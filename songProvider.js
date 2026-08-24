// Song provider — the one place the game asks for tracks.
//
// Supports:
//   1. Custom Spotify playlist tracks when provided.
//   2. PostgreSQL / Supabase / Catalog with decade and mainstream/underground vibe filters.
//   3. Live iTunes search as safety net fallback.

import { fetchSongs } from "./itunesFetcher.js";
import { sampleTracks, samplePlaylistTracks, genreCount, catalogReady } from "./catalog/store.js";
import { log } from "./log.js";

const MIN_CATALOG_POOL = 30;

export async function getSongs(genre, count, opts = {}) {
  const decade = (opts && opts.decade) || "all";
  const vibe = (opts && opts.vibe) || "all";
  const customTracks = opts && opts.customPlaylistTracks;

  // Custom Spotify Playlist mode
  if (Array.isArray(customTracks) && customTracks.length >= 4) {
    const sampled = samplePlaylistTracks(customTracks, count);
    if (sampled.length >= Math.min(count, 4)) {
      return sampled;
    }
  }

  // Database / Catalog sampling
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

  // Fallback: live iTunes search
  return fetchSongs(genre, count, { decade });
}

export default getSongs;
