// Spotify Playlist Extractor & Audio Preview Resolver
//
// Extracts track lists from public Spotify playlist links without requiring
// player authentication or developer API keys, then resolves 30s playable audio
// preview clips from the iTunes Search API.

import fetch from "node-fetch";

// In-memory cache for resolved playlists: playlistId -> { playlistId, name, tracks, resolvedAt }
const playlistCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Rate-limiting and concurrency limiter for iTunes preview lookups
const CONCURRENCY_LIMIT = 6;

/**
 * Parses a Spotify playlist ID from any URL or URI format.
 * e.g. "https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M?si=..." -> "37i9dQZF1DXcBWIGoYBM5M"
 * e.g. "spotify:playlist:37i9dQZF1DXcBWIGoYBM5M" -> "37i9dQZF1DXcBWIGoYBM5M"
 */
export function parseSpotifyPlaylistId(input) {
  if (!input || typeof input !== "string") return null;
  const trimmed = input.trim();
  const urlMatch = trimmed.match(/open\.spotify\.com\/playlist\/([a-zA-Z0-9]+)/);
  if (urlMatch) return urlMatch[1];
  const uriMatch = trimmed.match(/spotify:playlist:([a-zA-Z0-9]+)/);
  if (uriMatch) return uriMatch[1];
  if (/^[a-zA-Z0-9]{18,30}$/.test(trimmed)) return trimmed;
  return null;
}

/**
 * Fetches playlist metadata and raw track items using Spotify's public embed page.
 */
async function fetchRawSpotifyTracks(playlistId) {
  const embedUrl = `https://open.spotify.com/embed/playlist/${playlistId}`;
  const res = await fetch(embedUrl, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    },
    timeout: 8000,
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch Spotify playlist: HTTP ${res.status}`);
  }

  const html = await res.text();

  // Extract from Next.js payload (__NEXT_DATA__)
  const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/);
  if (nextDataMatch) {
    try {
      const data = JSON.parse(nextDataMatch[1]);
      const entity = data?.props?.pageProps?.state?.data?.entity;
      if (entity) {
        const name = entity.name || entity.title || "Custom Spotify Playlist";
        const trackList = entity.trackList || entity.tracks?.items || [];
        const tracks = trackList
          .map((item, idx) => {
            const track = item.track || item;
            const title = track.name || track.title;
            const artist =
              track.artists?.[0]?.name ||
              track.subtitle ||
              (Array.isArray(track.artists) ? track.artists.map((a) => a.name).join(", ") : "");
            if (!title || !artist) return null;
            return {
              id: track.id || `sp_${playlistId}_${idx}`,
              title: title.trim(),
              artist: artist.trim(),
              durationMs: track.duration || track.duration_ms || 180000,
            };
          })
          .filter(Boolean);

        return { name, tracks };
      }
    } catch {
      // fallback to regex extraction if JSON parse fails
    }
  }

  // Fallback regex extractor for track names and artists in embed HTML
  const tracks = [];
  const itemRegex = /"name":"([^"]+)","artists":\[{"name":"([^"]+)"/g;
  let m;
  while ((m = itemRegex.exec(html)) !== null) {
    tracks.push({
      id: `sp_${playlistId}_${tracks.length}`,
      title: m[1].replace(/\\u0026/g, "&"),
      artist: m[2].replace(/\\u0026/g, "&"),
      durationMs: 180000,
    });
  }

  return { name: "Spotify Playlist", tracks };
}

/**
 * Searches iTunes API for a 30s playable preview matching an artist and song title.
 */
async function resolveItunesAudio(artist, title) {
  try {
    const cleanTitle = title
      .replace(/\s*\(feat\..*?\)/i, "")
      .replace(/\s*-\s*Remaster.*$/i, "")
      .trim();
    const query = encodeURIComponent(`${artist} ${cleanTitle}`);
    const url = `https://itunes.apple.com/search?term=${query}&media=music&entity=song&limit=1`;
    const res = await fetch(url, { timeout: 4000 });
    if (!res.ok) return null;
    const data = await res.json();
    const result = data.results?.[0];
    if (result && result.previewUrl) {
      return {
        trackId: String(result.trackId || result.collectionId),
        trackName: result.trackName || title,
        artistName: result.artistName || artist,
        previewUrl: result.previewUrl,
        releaseYear: result.releaseDate ? new Date(result.releaseDate).getFullYear() : null,
        durationMs: result.trackTimeMillis || 180000,
      };
    }
  } catch {
    // lookup error/timeout
  }
  return null;
}

/**
 * Concurrently resolves audio previews for a list of raw tracks.
 */
async function resolveAllPreviews(rawTracks) {
  const resolved = [];
  let index = 0;

  async function worker() {
    while (index < rawTracks.length) {
      const i = index++;
      const item = rawTracks[i];
      const match = await resolveItunesAudio(item.artist, item.title);
      if (match) {
        resolved.push(match);
      }
    }
  }

  const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, rawTracks.length) }, () => worker());
  await Promise.all(workers);
  return resolved;
}

/**
 * Main entry point: Fetches a Spotify playlist, resolves 30s playable audio previews,
 * and caches the result.
 */
export async function fetchSpotifyPlaylist(urlOrId) {
  const playlistId = parseSpotifyPlaylistId(urlOrId);
  if (!playlistId) {
    throw new Error("Invalid Spotify playlist URL or ID.");
  }

  // Check in-memory cache
  const cached = playlistCache.get(playlistId);
  if (cached && Date.now() - cached.resolvedAt < CACHE_TTL_MS) {
    return cached;
  }

  const { name, tracks: rawTracks } = await fetchRawSpotifyTracks(playlistId);
  if (!rawTracks || rawTracks.length === 0) {
    throw new Error("No playable tracks found in this Spotify playlist. Make sure the playlist is public.");
  }

  // Take up to 100 tracks from the playlist for responsive resolution
  const sampleCandidateTracks = rawTracks.slice(0, 100);
  const resolvedTracks = await resolveAllPreviews(sampleCandidateTracks);

  if (resolvedTracks.length < 4) {
    throw new Error(
      `Only found ${resolvedTracks.length} playable audio preview(s). At least 4 matched tracks are required.`
    );
  }

  const result = {
    playlistId,
    name,
    totalRawTracks: rawTracks.length,
    matchedTracksCount: resolvedTracks.length,
    tracks: resolvedTracks,
    resolvedAt: Date.now(),
  };

  playlistCache.set(playlistId, result);
  return result;
}

export default {
  parseSpotifyPlaylistId,
  fetchSpotifyPlaylist,
};
