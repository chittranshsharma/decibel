// Raw iTunes record -> catalog row.
//
// Converts raw iTunes track objects into clean, normalized catalog rows.
// Automatically tags tracks with genre families and mainstream/underground vibe tiers.

import { familiesForAppleGenre, isUndergroundArtist } from "./genres.js";

export const MIN_DURATION_MS = 20 * 1000; // 20s minimum duration

const JUNK_VERSION_RE =
  /\b(live|karaoke|tribute|cover|remaster(ed)?|re-?record(ed)?|instrumental|acoustic version|sped.?up|slowed|reverb|8.?bit|lullaby|workout|dj mix|medley|originally performed|in the style of|made famous|demo)\b/i;

const COMPILATION_RE =
  /\b(greatest hits|best of|number one|number ones|anthology|essential|the hits|hits collection|for the record|ultimate collection|decades|the collection)\b/i;

export function isJunkVersion(trackName, collectionName) {
  return (
    JUNK_VERSION_RE.test(String(trackName || "")) ||
    JUNK_VERSION_RE.test(String(collectionName || "")) ||
    COMPILATION_RE.test(String(collectionName || ""))
  );
}

export function baseTitle(name) {
  return String(name || "")
    .toLowerCase()
    .replace(/\s*[([].*$/, "")
    .replace(/[^a-z0-9]/g, "");
}

export function toCatalogRow(raw, seedGenreKeys = []) {
  if (!raw || !raw.previewUrl || !raw.trackId) return null;
  if (!(Number(raw.trackTimeMillis) > MIN_DURATION_MS)) return null;
  const trackName = String(raw.trackName || "").trim();
  const artistName = String(raw.artistName || "").trim();
  if (!trackName || !artistName) return null;
  if (isJunkVersion(trackName, raw.collectionName)) return null;

  const appleGenre = raw.primaryGenreName || null;
  const matched = familiesForAppleGenre(appleGenre);
  const seeded = (seedGenreKeys || []).map((k) => String(k).toLowerCase());
  const baseGenreKeys = [...new Set([...matched, ...seeded])];
  if (baseGenreKeys.length === 0) return null;

  // Add vibe tags (:underground or :mainstream) for fine-grained filtering
  const enrichedGenreKeys = [...baseGenreKeys];
  for (const gk of baseGenreKeys) {
    if (isUndergroundArtist(artistName, gk)) {
      enrichedGenreKeys.push(`${gk}:underground`);
      enrichedGenreKeys.push("underground");
    } else {
      enrichedGenreKeys.push(`${gk}:mainstream`);
      enrichedGenreKeys.push("mainstream");
    }
  }

  const year = raw.releaseDate ? Number(String(raw.releaseDate).slice(0, 4)) : null;
  return {
    trackId: String(raw.trackId),
    trackName,
    artistName,
    artistId: raw.artistId ? String(raw.artistId) : null,
    previewUrl: raw.previewUrl,
    appleGenre,
    genreKeys: [...new Set(enrichedGenreKeys)],
    releaseYear: Number.isFinite(year) ? year : null,
    durationMs: Number(raw.trackTimeMillis),
    baseTitle: baseTitle(trackName),
    randomSeed: Math.random(),
  };
}

export function toCatalogRows(rawList, seedGenreKeys = []) {
  const byId = new Map();
  for (const raw of rawList || []) {
    const row = toCatalogRow(raw, seedGenreKeys);
    if (!row) continue;
    const prev = byId.get(row.trackId);
    if (prev) prev.genreKeys = [...new Set([...prev.genreKeys, ...row.genreKeys])];
    else byId.set(row.trackId, row);
  }
  return [...byId.values()];
}

export default { toCatalogRow, toCatalogRows, isJunkVersion, baseTitle, MIN_DURATION_MS };
