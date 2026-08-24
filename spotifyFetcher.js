// Spotify Playlist Extractor & Audio Preview Resolver
//
// Extracts track lists from public Spotify playlist links and resolves playable
// 30s audio previews directly from Spotify preview endpoints and iTunes Search API fallback.
// Supports Spotify Web API with Client Credentials when configured for full pagination of 500+ song playlists.

import fetch from "node-fetch";

// In-memory cache for resolved playlists: playlistId -> { playlistId, name, tracks, resolvedAt }
const playlistCache = new Map();
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

// Concurrency limiter for iTunes preview lookups
const CONCURRENCY_LIMIT = 8;
const MAX_PLAYLIST_CANDIDATES = 500;

const SPOTIFY_JUNK_REGEX =
  /\b(remix|re-?mix|club mix|extended mix|vip mix|vip edit|mashup|bootleg|flip|edit|dub mix|radio edit remix|live at|live from|live in|live version|anniversary edition|demo|instrumental|karaoke|tribute|cover|acoustic|acoustic version|sped.?up|slowed|reverb|nightcore)\b|[([].*?\b(remix|re-?mix|club mix|extended mix|vip mix|vip edit|mashup|bootleg|flip|edit|dub mix|live|acoustic|instrumental|karaoke|tribute|cover|demo|sped.?up|slowed)\b.*?[)\]]/i;

const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID || "";
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET || "";

let spotifyApiToken = null;
let spotifyApiTokenExpiresAt = 0;

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
 * Obtains an access token for Spotify API using Client Credentials flow if credentials are set.
 */
async function getSpotifyApiToken() {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) return null;
  if (spotifyApiToken && Date.now() < spotifyApiTokenExpiresAt - 60000) {
    return spotifyApiToken;
  }

  try {
    const creds = Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString("base64");
    const res = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${creds}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
      timeout: 5000,
    });

    if (!res.ok) return null;
    const data = await res.json();
    if (data.access_token) {
      spotifyApiToken = data.access_token;
      spotifyApiTokenExpiresAt = Date.now() + (data.expires_in || 3600) * 1000;
      return spotifyApiToken;
    }
  } catch {
    // ignore credential lookup failure
  }
  return null;
}

/**
 * Fetches tracks from Spotify Web API with full pagination (supports 300+ songs).
 */
async function fetchFromSpotifyApi(playlistId, token) {
  let name = "Spotify Playlist";
  const rawTracks = [];
  let nextUrl = `https://api.spotify.com/v1/playlists/${playlistId}?fields=name,tracks(items(track(id,name,duration_ms,preview_url,artists(name))),next,total)`;

  // Fetch initial playlist details
  const initialRes = await fetch(nextUrl, {
    headers: { Authorization: `Bearer ${token}` },
    timeout: 8000,
  });

  if (!initialRes.ok) return null;
  const initialData = await initialRes.json();
  if (initialData.name) name = initialData.name;

  let items = initialData.tracks?.items || [];
  nextUrl = initialData.tracks?.next;

  while (items.length > 0) {
    for (const item of items) {
      const track = item.track;
      if (!track || !track.name) continue;
      const title = track.name.trim();
      if (SPOTIFY_JUNK_REGEX.test(title)) continue;
      const artist = track.artists?.map((a) => a.name).join(", ") || "Unknown Artist";
      const previewUrl = track.preview_url || null;

      rawTracks.push({
        id: track.id || `sp_${playlistId}_${rawTracks.length}`,
        title,
        artist,
        previewUrl,
        durationMs: track.duration_ms || 180000,
      });

      if (rawTracks.length >= MAX_PLAYLIST_CANDIDATES) break;
    }

    if (!nextUrl || rawTracks.length >= MAX_PLAYLIST_CANDIDATES) break;

    try {
      const nextRes = await fetch(nextUrl, {
        headers: { Authorization: `Bearer ${token}` },
        timeout: 8000,
      });
      if (!nextRes.ok) break;
      const nextData = await nextRes.json();
      items = nextData.items || [];
      nextUrl = nextData.next;
    } catch {
      break;
    }
  }

  return { name, tracks: rawTracks };
}

/**
 * Fetches playlist metadata and raw track items using Spotify's public embed page with direct audio previews.
 */
async function fetchRawSpotifyTracks(playlistId) {
  // Check if official API token is available first
  const apiToken = await getSpotifyApiToken();
  if (apiToken) {
    const apiResult = await fetchFromSpotifyApi(playlistId, apiToken);
    if (apiResult && apiResult.tracks.length > 0) {
      return apiResult;
    }
  }

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
            if (SPOTIFY_JUNK_REGEX.test(title)) return null;

            // Direct Spotify preview url if embedded
            const directPreview = item.audioPreview?.url || track.preview_url || item.preview_url || null;

            return {
              id: track.id || `sp_${playlistId}_${idx}`,
              title: title.trim(),
              artist: artist.trim(),
              previewUrl: directPreview,
              durationMs: track.duration || track.duration_ms || 180000,
            };
          })
          .filter(Boolean);

        return { name, tracks };
      }
    } catch {
      // fallback to regex extraction
    }
  }

  // Fallback regex extractor for track names and artists in embed HTML
  const tracks = [];
  const itemRegex = /"name":"([^"]+)","artists":\[{"name":"([^"]+)"/g;
  let m;
  while ((m = itemRegex.exec(html)) !== null) {
    const rawTitle = m[1].replace(/\\u0026/g, "&").trim();
    if (SPOTIFY_JUNK_REGEX.test(rawTitle)) continue;
    tracks.push({
      id: `sp_${playlistId}_${tracks.length}`,
      title: rawTitle,
      artist: m[2].replace(/\\u0026/g, "&").trim(),
      previewUrl: null,
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
      .replace(/\s*\(feat\..*?\)/gi, "")
      .replace(/\s*\[feat\..*?\]/gi, "")
      .replace(/\s*\(with.*?\)/gi, "")
      .replace(/\s*-\s*Remaster.*$/gi, "")
      .replace(/\s*\(Remaster.*?\)/gi, "")
      .replace(/\s*\(Deluxe.*?\)/gi, "")
      .replace(/\s*-\s*Radio Edit.*$/gi, "")
      .replace(/\s*-\s*Bonus Track.*$/gi, "")
      .trim();

    const queries = [
      `${artist} ${cleanTitle}`,
      `${artist.split(",")[0].trim()} ${cleanTitle}`,
      cleanTitle,
    ];

    for (const q of queries) {
      const url = `https://itunes.apple.com/search?term=${encodeURIComponent(q)}&media=music&entity=song&limit=1`;
      const res = await fetch(url, { timeout: 4500 });
      if (!res.ok) continue;
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
    }
  } catch {
    // lookup error or timeout
  }
  return null;
}

/**
 * Concurrently resolves audio previews for a list of raw tracks.
 */
async function resolveAllPreviews(rawTracks) {
  const resolved = [];
  const needsItunes = [];

  // Pass 1: Grab direct previews immediately
  for (const item of rawTracks) {
    if (item.previewUrl) {
      resolved.push({
        trackId: String(item.id),
        trackName: item.title,
        artistName: item.artist,
        previewUrl: item.previewUrl,
        releaseYear: null,
        durationMs: item.durationMs || 180000,
      });
    } else {
      needsItunes.push(item);
    }
  }

  // Pass 2: Concurrently resolve missing previews from iTunes
  let index = 0;
  async function worker() {
    while (index < needsItunes.length) {
      const i = index++;
      const item = needsItunes[i];
      const match = await resolveItunesAudio(item.artist, item.title);
      if (match) {
        resolved.push(match);
      }
    }
  }

  if (needsItunes.length > 0) {
    const workers = Array.from({ length: Math.min(CONCURRENCY_LIMIT, needsItunes.length) }, () => worker());
    await Promise.all(workers);
  }

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

  const candidateTracks = rawTracks.slice(0, MAX_PLAYLIST_CANDIDATES);
  const resolvedTracks = await resolveAllPreviews(candidateTracks);

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
