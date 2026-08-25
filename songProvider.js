// Song provider — the one place the game asks for tracks.
//
// Supports:
//   1. Custom Spotify playlist tracks and AI-generated Crate tracks when provided.
//   2. Multi-query AI Vibe searches sampled across prompt seeds.
//   3. PostgreSQL / Supabase / Catalog with decade and mainstream/underground vibe filters.
//   4. Direct curated artist-seed sampling from genres.js (100% verified artist rosters).
//   5. Live iTunes search as safety net fallback.

import fetch from "node-fetch";
import { fetchSongs } from "./itunesFetcher.js";
import { sampleTracks, samplePlaylistTracks, genreCount, catalogReady } from "./catalog/store.js";
import { seedArtistsFor, isGenreKey, matchesArtist } from "./catalog/genres.js";
import { isJunkVersion, JUNK_VERSION_RE } from "./catalog/normalize.js";
import { sampleDiverse, filterDecade, shuffle } from "./catalog/sample.js";
import { log } from "./log.js";

const MIN_CATALOG_POOL = 30;

/**
 * Fetch tracks matching an array of search queries / artist seeds and sample diverse results.
 */
export async function fetchVibeTracks(searchQueries = [], count = 20, opts = {}) {
  if (!Array.isArray(searchQueries) || searchQueries.length === 0) return [];
  const perQueryCount = Math.max(6, Math.ceil((count * 2.5) / searchQueries.length));

  const results = await Promise.allSettled(
    searchQueries.map((q) => fetchSongs(q, perQueryCount, opts))
  );

  const merged = [];
  const seen = new Set();
  for (const res of results) {
    if (res.status === "fulfilled" && Array.isArray(res.value)) {
      for (const track of res.value) {
        if (track && track.trackId && !seen.has(track.trackId)) {
          seen.add(track.trackId);
          merged.push(track);
        }
      }
    }
  }

  if (merged.length === 0) return [];
  return samplePlaylistTracks(merged, count);
}

/**
 * Directly fetch tracks for the exact curated artists registered in genres.js.
 * Guarantees all tracks in the game pool come strictly from the configured artists.
 */
export async function fetchCuratedGenrePool(genre, count = 20, opts = {}) {
  const vibe = (opts && opts.vibe) || "all";
  const decade = (opts && opts.decade) || "all";
  const artists = seedArtistsFor(genre, vibe);
  if (!artists || artists.length === 0) return [];

  // Pick up to 16 random artists from the curated roster
  const selectedArtists = shuffle(artists).slice(0, Math.min(16, artists.length));

  const isDesi = genre === "desi-hip-hop" || genre === "desi-indie";
  const countryParam = isDesi ? "&country=IN" : "";

  const trackPromises = selectedArtists.map(async (artist) => {
    try {
      const aLower = artist.toLowerCase();
      // Add disambiguation hints for short ambiguous names
      let query = artist;
      if (["king", "raga", "rawal", "tarun", "smoke", "sammad", "ruab", "mc stan"].includes(aLower)) {
        query = `${artist} rap`;
      } else if (["queen", "kiss"].includes(aLower)) {
        query = `${artist} band`;
      }

      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&entity=song&limit=15${countryParam}`;
      const res = await fetch(url);
      if (!res.ok) return [];
      const data = await res.json();
      const results = (data.results || []).filter((r) => {
        if (!r || !r.previewUrl || !r.trackName || !r.artistName) return false;
        if (Number(r.trackTimeMillis) <= 20000) return false;
        if (isJunkVersion(r.trackName, r.collectionName)) return false; // Filter junk, remix, slowed, reverb, live

        return matchesArtist(r.artistName, artist);
      });

      return results.map((r) => ({
        trackId: r.trackId,
        trackName: r.trackName,
        artistName: r.artistName,
        previewUrl: r.previewUrl,
        primaryGenreName: r.primaryGenreName,
        releaseYear: r.releaseDate ? Number(String(r.releaseDate).slice(0, 4)) : null,
      }));
    } catch {
      return [];
    }
  });

  const settled = await Promise.allSettled(trackPromises);
  const rawPool = [];
  const seen = new Set();
  for (const s of settled) {
    if (s.status === "fulfilled" && Array.isArray(s.value)) {
      for (const t of s.value) {
        if (!seen.has(t.trackId)) {
          seen.add(t.trackId);
          rawPool.push(t);
        }
      }
    }
  }

  const filtered = filterDecade(rawPool, decade);
  const usable = filtered.length >= Math.min(count, 4) ? filtered : rawPool;
  return sampleDiverse(usable, count);
}

export async function getSongs(genre, count, opts = {}) {
  const decade = (opts && opts.decade) || "all";
  const vibe = (opts && opts.vibe) || "all";
  const customTracks = opts && opts.customPlaylistTracks;
  const searchQueries = opts && (opts.searchQueries || opts.aiQueries);

  // 1. Custom Spotify Playlist / Preloaded Crate mode
  if (Array.isArray(customTracks) && customTracks.length >= 4) {
    const sampled = samplePlaylistTracks(customTracks, count);
    if (sampled.length >= Math.min(count, 4)) {
      return sampled;
    }
  }

  // 2. Multi-query AI Vibe search mode
  if (Array.isArray(searchQueries) && searchQueries.length > 0) {
    try {
      const vibeTracks = await fetchVibeTracks(searchQueries, count, { decade });
      if (vibeTracks.length >= count) return vibeTracks;
      if (vibeTracks.length >= Math.min(count, 4)) return vibeTracks;
    } catch (e) {
      log.warn("fetchVibeTracks failed; using standard fallback", { error: String((e && e.message) || e) });
    }
  }

  // 3. Database / Catalog sampling
  if (catalogReady()) {
    try {
      const available = await genreCount(genre);
      if (available >= Math.max(MIN_CATALOG_POOL, count)) {
        const rows = await sampleTracks({ genre, decade, vibe, count });
        if (rows.length >= count) return rows;
      }
    } catch (e) {
      log.warn("catalog sample failed; using live fetcher", { error: String((e && e.message) || e) });
    }
  }

  // 4. Direct Curated Artist Roster Sampling (Guarantees accuracy for all genre keys)
  if (isGenreKey(genre)) {
    try {
      const curatedPool = await fetchCuratedGenrePool(genre, count, { decade, vibe });
      if (curatedPool.length >= Math.min(count, 4)) {
        return curatedPool;
      }
    } catch (e) {
      log.warn("curated genre sampling failed; using fallback", { error: String((e && e.message) || e) });
    }
  }

  // 5. Fallback: live iTunes search
  try {
    const live = await fetchSongs(genre, count, { decade });
    if (Array.isArray(live) && live.length >= Math.min(count, 4)) {
      return live;
    }
  } catch (e) {
    log.warn("live fetchSongs failed; falling back to catalog emergency recovery", {
      error: String((e && e.message) || e),
    });
  }

  // 6. Emergency fallback: sample from catalog ignoring pool size threshold
  if (catalogReady()) {
    try {
      const emergency = await sampleTracks({ genre, decade: "all", vibe: "all", count });
      if (emergency && emergency.length > 0) return emergency;
    } catch {
      // ignore
    }
  }

  return [];
}

export default getSongs;



