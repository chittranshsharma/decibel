// Catalog storage — where the ingested tracks live and how rounds sample them.
//
// Supports PostgreSQL (Supabase / RDS / Local) and in-memory JSON snapshot fallback.
// Optimized for 500,000+ tracks with indexed random sampling and mainstream / underground vibe filtering.

import { readFile, writeFile, rename, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { sampleDiverse, decadeRange } from "./sample.js";
import { seedArtistsFor, isUndergroundArtist } from "./genres.js";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const snapshotPath = () => process.env.CATALOG_FILE || path.join(HERE, "snapshot.json");

const CANDIDATE_MULTIPLIER = 12;
const CANDIDATE_CAP = 900;

let backend = "none"; // "postgres" | "file" | "none"
let pool = null; // pg pool when backend === "postgres"
let rows = new Map(); // trackId -> row, when backend === "file"
let logger = null;
let dirty = false;

const CREATE_SQL = `
  CREATE TABLE IF NOT EXISTS catalog_tracks (
    track_id     TEXT PRIMARY KEY,
    track_name   TEXT NOT NULL,
    artist_name  TEXT NOT NULL,
    artist_id    TEXT,
    preview_url  TEXT NOT NULL,
    apple_genre  TEXT,
    genre_keys   TEXT[] NOT NULL,
    release_year INTEGER,
    duration_ms  INTEGER,
    base_title   TEXT,
    random_seed  FLOAT NOT NULL DEFAULT random(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS catalog_tracks_genre_idx ON catalog_tracks USING GIN (genre_keys);
  CREATE INDEX IF NOT EXISTS catalog_tracks_year_idx  ON catalog_tracks (release_year);
  CREATE INDEX IF NOT EXISTS catalog_tracks_seed_idx  ON catalog_tracks (random_seed);
`;

// ----- init -----

export async function initCatalog(log) {
  logger = log || null;
  const url = process.env.DATABASE_URL;
  if (url) {
    try {
      const { default: pg } = await import("pg");
      pool = new pg.Pool({ connectionString: url, max: 8 });
      pool.on("error", (err) => {
        logger?.warn?.("pg pool idle client error in catalog", { error: String(err?.message || err) });
      });
      await pool.query(CREATE_SQL);
      backend = "postgres";
      const { total } = await catalogStats();
      logger?.info?.("catalog ready (postgres)", { tracks: total });
      return backend;
    } catch (e) {
      pool = null;
      logger?.warn?.("DATABASE_URL set but catalog storage failed; falling back to the JSON snapshot", {
        error: String((e && e.message) || e),
      });
    }
  }
  backend = "file";
  await loadSnapshot();
  logger?.info?.("catalog ready (file)", { tracks: rows.size, path: snapshotPath() });
  return backend;
}

async function loadSnapshot() {
  try {
    const raw = await readFile(snapshotPath(), "utf8");
    const parsed = JSON.parse(raw);
    const list = Array.isArray(parsed) ? parsed : parsed.tracks || [];
    rows = new Map(list.filter((r) => r && r.trackId).map((r) => [String(r.trackId), r]));
  } catch {
    rows = new Map();
  }
}

export async function saveSnapshot() {
  if (backend !== "file" || !dirty) return false;
  const target = snapshotPath();
  const payload = JSON.stringify({ savedAt: new Date().toISOString(), tracks: [...rows.values()] });
  const tmp = `${target}.tmp`;
  try {
    await mkdir(path.dirname(target), { recursive: true });
    await writeFile(tmp, payload, "utf8");
    await rename(tmp, target);
    dirty = false;
    return true;
  } catch (e) {
    logger?.warn?.("catalog snapshot save failed", { error: String((e && e.message) || e) });
    return false;
  }
}

export function catalogBackend() {
  return backend;
}

export function catalogReady() {
  return backend !== "none";
}

// ----- writes -----

export async function upsertTracks(list) {
  const batch = (list || []).filter((r) => r && r.trackId && r.previewUrl);
  if (batch.length === 0) return 0;

  if (backend === "postgres") {
    let written = 0;
    for (let i = 0; i < batch.length; i += 200) {
      const chunk = batch.slice(i, i + 200);
      const values = [];
      const params = [];
      chunk.forEach((r, n) => {
        const b = n * 11;
        values.push(`($${b + 1},$${b + 2},$${b + 3},$${b + 4},$${b + 5},$${b + 6},$${b + 7}::text[],$${b + 8},$${b + 9},$${b + 10},COALESCE($${b + 11}, random()))`);
        params.push(
          r.trackId, r.trackName, r.artistName, r.artistId, r.previewUrl,
          r.appleGenre, r.genreKeys, r.releaseYear, r.durationMs, r.baseTitle, r.randomSeed ?? null
        );
      });
      await pool.query(
        `INSERT INTO catalog_tracks
           (track_id, track_name, artist_name, artist_id, preview_url, apple_genre, genre_keys, release_year, duration_ms, base_title, random_seed)
         VALUES ${values.join(",")}
         ON CONFLICT (track_id) DO UPDATE SET
           preview_url = EXCLUDED.preview_url,
           apple_genre = COALESCE(EXCLUDED.apple_genre, catalog_tracks.apple_genre),
           release_year = COALESCE(EXCLUDED.release_year, catalog_tracks.release_year),
           genre_keys = ARRAY(SELECT DISTINCT unnest(catalog_tracks.genre_keys || EXCLUDED.genre_keys)),
           updated_at = now()`,
        params
      );
      written += chunk.length;
    }
    return written;
  }

  for (const r of batch) {
    const prev = rows.get(r.trackId);
    if (prev) {
      prev.previewUrl = r.previewUrl;
      prev.appleGenre = r.appleGenre ?? prev.appleGenre;
      prev.releaseYear = r.releaseYear ?? prev.releaseYear;
      prev.genreKeys = [...new Set([...(prev.genreKeys || []), ...(r.genreKeys || [])])];
    } else {
      rows.set(r.trackId, { ...r });
    }
  }
  dirty = true;
  return batch.length;
}

// ----- reads -----

function decadeKeyOf(year) {
  if (year == null || !Number.isFinite(Number(year))) return "unknown";
  const y = Number(year);
  if (y < 1980) return "pre-1980";
  return `${Math.floor(y / 10) * 10}s`;
}

export async function catalogStats() {
  if (backend === "postgres") {
    const total = await pool.query("SELECT count(*)::int AS n FROM catalog_tracks");
    const res = await pool.query(
      `SELECT g AS genre,
              CASE WHEN release_year IS NULL THEN 'unknown'
                   WHEN release_year < 1980 THEN 'pre-1980'
                   ELSE ((release_year / 10) * 10)::text || 's' END AS decade,
              count(*)::int AS n
         FROM catalog_tracks, unnest(genre_keys) AS g
        GROUP BY 1, 2`
    );
    const byGenre = {};
    const byGenreDecade = {};
    for (const r of res.rows) {
      byGenre[r.genre] = (byGenre[r.genre] || 0) + r.n;
      (byGenreDecade[r.genre] = byGenreDecade[r.genre] || {})[r.decade] = r.n;
    }
    return { backend, total: total.rows[0]?.n ?? 0, byGenre, byGenreDecade };
  }
  const byGenre = {};
  const byGenreDecade = {};
  for (const r of rows.values()) {
    const decade = decadeKeyOf(r.releaseYear);
    for (const g of r.genreKeys || []) {
      byGenre[g] = (byGenre[g] || 0) + 1;
      (byGenreDecade[g] = byGenreDecade[g] || {})[decade] = ((byGenreDecade[g] || {})[decade] || 0) + 1;
    }
  }
  return { backend, total: rows.size, byGenre, byGenreDecade };
}

export async function genreCount(genre) {
  const key = String(genre ?? "").toLowerCase();
  if (backend === "postgres") {
    const res = await pool.query("SELECT count(*)::int AS n FROM catalog_tracks WHERE genre_keys @> ARRAY[$1]", [key]);
    return res.rows[0]?.n ?? 0;
  }
  let n = 0;
  for (const r of rows.values()) if ((r.genreKeys || []).includes(key)) n++;
  return n;
}

// Random candidate rows for one genre with optional decade range and vibe filter.
async function candidates(genre, count, range = null, vibe = "all") {
  const key = String(genre ?? "").toLowerCase();
  const limit = Math.min(CANDIDATE_CAP, Math.max(count * CANDIDATE_MULTIPLIER, count));
  
  if (backend === "postgres") {
    const params = [key];
    let where = "genre_keys @> ARRAY[$1]";

    if (vibe === "underground") {
      params.push(`${key}:underground`);
      where += ` AND (genre_keys @> ARRAY[$${params.length}] OR genre_keys @> ARRAY['underground'])`;
    } else if (vibe === "mainstream") {
      params.push(`${key}:mainstream`);
      where += ` AND (genre_keys @> ARRAY[$${params.length}] OR genre_keys @> ARRAY['mainstream'])`;
    }

    if (range) {
      params.push(range[0], range[1]);
      where += ` AND release_year BETWEEN $${params.length - 1} AND $${params.length}`;
    }

    const seed = Math.random();
    const queryParams = [...params, seed, limit];
    const seedParamIdx = queryParams.length - 1;
    const limitParamIdx = queryParams.length;

    const res = await pool.query(
      `SELECT track_id AS "trackId", track_name AS "trackName", artist_name AS "artistName",
              preview_url AS "previewUrl", release_year AS "releaseYear", base_title AS "baseTitle",
              apple_genre AS "appleGenre"
         FROM catalog_tracks
        WHERE ${where} AND random_seed >= $${seedParamIdx}
        ORDER BY random_seed ASC
        LIMIT $${limitParamIdx}`,
      queryParams
    );

    let candidateRows = res.rows;
    if (candidateRows.length < count) {
      // Wrap around from 0 to seed
      const needed = limit - candidateRows.length;
      const wrapParams = [...params, seed, needed];
      const wrapRes = await pool.query(
        `SELECT track_id AS "trackId", track_name AS "trackName", artist_name AS "artistName",
                preview_url AS "previewUrl", release_year AS "releaseYear", base_title AS "baseTitle",
                apple_genre AS "appleGenre"
           FROM catalog_tracks
          WHERE ${where} AND random_seed < $${seedParamIdx}
          ORDER BY random_seed ASC
          LIMIT $${limitParamIdx}`,
        wrapParams
      );
      candidateRows = [...candidateRows, ...wrapRes.rows];
    }

    if (candidateRows.length >= count) return candidateRows;

    // Fallback without strict vibe tag if pool was thin
    if (vibe !== "all") {
      return candidates(genre, count, range, "all");
    }
    return candidateRows;
  }

  const all = [];
  for (const r of rows.values()) {
    if (!(r.genreKeys || []).includes(key)) continue;
    if (vibe === "underground" && !isUndergroundArtist(r.artistName, key) && !(r.genreKeys || []).includes(`${key}:underground`)) {
      continue;
    }
    if (vibe === "mainstream" && isUndergroundArtist(r.artistName, key) && !(r.genreKeys || []).includes(`${key}:mainstream`)) {
      continue;
    }
    if (range && !(r.releaseYear != null && r.releaseYear >= range[0] && r.releaseYear <= range[1])) continue;
    all.push(r);
  }

  if (all.length < count && vibe !== "all") {
    return candidates(genre, count, range, "all");
  }
  return all;
}

export async function sampleTracks({ genre, decade = "all", vibe = "all", count = 20 } = {}) {
  if (!catalogReady()) return [];
  const n = Number.isFinite(count) ? Math.max(0, Math.floor(count)) : 0;
  if (n === 0) return [];

  const range = decadeRange(decade);
  if (range) {
    const inDecade = await candidates(genre, n, range, vibe);
    const sampled = sampleDiverse(inDecade, n);
    if (sampled.length >= n) return sampled;
  }

  const pool_ = await candidates(genre, n, null, vibe);
  if (pool_.length === 0) return [];
  return sampleDiverse(pool_, n);
}

export function samplePlaylistTracks(playlistTracks, count = 20) {
  if (!Array.isArray(playlistTracks) || playlistTracks.length === 0) return [];
  const n = Math.min(count, playlistTracks.length);
  return sampleDiverse(playlistTracks, n);
}

export async function closeCatalog() {
  await saveSnapshot();
  if (pool) await pool.end().catch(() => {});
  pool = null;
  rows = new Map();
  backend = "none";
  dirty = false;
}

export default {
  initCatalog,
  upsertTracks,
  sampleTracks,
  samplePlaylistTracks,
  catalogStats,
  genreCount,
  catalogBackend,
  catalogReady,
  saveSnapshot,
  closeCatalog,
};
