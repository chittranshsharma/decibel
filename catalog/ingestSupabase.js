// Ingest pipeline for Supabase & PostgreSQL catalog scaling.
// Sweeps Apple charts and all 11 genre families (mainstream + underground seed artists)
// and bulk-inserts normalized tracks into Supabase `catalog_tracks`.

import { initCatalog, upsertTracks, catalogStats, closeCatalog } from "./store.js";
import { GENRE_FAMILIES, seedArtistsFor } from "./genres.js";
import { chartEntries, lookupTracks, artistIdFor, songsForArtist, DEFAULT_STOREFRONTS } from "./appleSource.js";
import { toCatalogRows } from "./normalize.js";

const logger = {
  info: (msg, data) => console.log(`[INGEST] ${msg}`, data ? JSON.stringify(data) : ""),
  warn: (msg, data) => console.warn(`[INGEST WARN] ${msg}`, data ? JSON.stringify(data) : ""),
  error: (msg, data) => console.error(`[INGEST ERR] ${msg}`, data ? JSON.stringify(data) : ""),
};

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function mapConcurrent(items, limit, fn) {
  const results = [];
  const executing = [];
  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);
    if (limit <= items.length) {
      const e = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(results);
}

async function runIngest() {
  console.log("=== Starting Deep Supabase Catalog Ingest for All 11 Genres ===");
  const backend = await initCatalog(logger);
  console.log(`Backend initialized: ${backend}`);

  let totalIngested = 0;

  // Phase 1: Storefronts charts
  console.log("\n--- Phase 1: Storefront Charts Sweep ---");
  for (const sf of DEFAULT_STOREFRONTS) {
    try {
      console.log(`Fetching charts for storefront [${sf}]...`);
      const entries = await chartEntries(sf, 100);
      if (entries.length > 0) {
        const rawTracks = await lookupTracks(entries.map((e) => e.id));
        const normalized = toCatalogRows(rawTracks);
        const written = await upsertTracks(normalized);
        totalIngested += written;
        console.log(`  -> Storefront [${sf}]: Ingested ${written} tracks.`);
      }
    } catch (e) {
      console.error(`  -> Failed storefront [${sf}]:`, e.message);
    }
  }

  // Phase 2: Seed Artists Sweep for all 11 Genres concurrently
  console.log("\n--- Phase 2: Deep Artist Sweeps across all 11 Genres ---");
  for (const [genreKey, config] of Object.entries(GENRE_FAMILIES)) {
    console.log(`\n========================================`);
    console.log(`Processing genre [${config.label}] (${genreKey})...`);
    console.log(`========================================`);
    const artists = seedArtistsFor(genreKey, "all");
    console.log(`Total seed artists for ${genreKey}: ${artists.length}`);

    await mapConcurrent(artists, 3, async (artistName) => {
      try {
        await delay(150);
        const artistId = await artistIdFor(artistName);
        if (!artistId) {
          console.log(`  - ${artistName}: Artist ID not found on Apple.`);
          return;
        }
        await delay(150);
        const rawTracks = await songsForArtist(artistId, 200);
        const normalized = toCatalogRows(rawTracks, [genreKey]);
        const written = await upsertTracks(normalized);
        totalIngested += written;
        console.log(`  + [${genreKey}] ${artistName}: Ingested ${written} songs (${rawTracks.length} raw).`);
      } catch (e) {
        console.error(`  x Error on [${genreKey}] ${artistName}:`, e.message);
      }
    });
  }

  const finalStats = await catalogStats();
  console.log("\n=== Ingest Complete ===");
  console.log(`Total tracks in database: ${finalStats.total}`);
  console.log("Tracks by genre:", JSON.stringify(finalStats.byGenre, null, 2));

  await closeCatalog();
}

runIngest().catch((err) => {
  console.error("Ingest fatal error:", err);
  process.exit(1);
});
