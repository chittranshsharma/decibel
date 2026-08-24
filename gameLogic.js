// Pure, side-effect-free game logic — extracted from server.js so it can be
// unit-tested without spinning up a server or hitting the network.

import { maskProfanity } from "./profanity.js";
import { GENRE_KEYS } from "./catalog/genres.js";

// ----- Scoring constants -----
export const QUESTION_BASE = 300;
export const QUESTION_STEP = 250;
export const MAX_SPEED_BONUS = 350;
export const MIN_REACTION_MS = 150; // human auditory reflex floor for bot mitigation

// ----- Power-up rules (1 charge each per game session) -----
export const MAX_FIFTY_FIFTY = 1;
export const MAX_DOUBLE_DOWN = 1;
export const MAX_SHIELD = 1;

// ----- Host-configurable settings (allowlists; first item is the default) -----
export const ROUND_CHOICES = [10, 5, 15];
export const TIMER_CHOICES = [10000, 7500, 15000];
export const OPTION_CHOICES = [4, 3, 6];
export const MODE_CHOICES = ["TITLE", "ARTIST"];
export const DECADE_CHOICES = ["all", "new", "2020s", "2010s", "2000s", "1990s", "1980s"];
export const CLIP_CHOICES = ["RANDOM", "INTRO"];
export const VIBE_CHOICES = ["all", "mainstream", "underground"];

// Playable genres: 10 curated families + custom Spotify playlist + AI Vibe Crate
export const ALLOWED_GENRES = [...GENRE_KEYS, "spotify", "ai-vibe"];

export const DEFAULT_SETTINGS = {
  rounds: ROUND_CHOICES[0],
  roundMs: TIMER_CHOICES[0],
  optionsCount: OPTION_CHOICES[0],
  mode: MODE_CHOICES[0],
  decade: DECADE_CHOICES[0],
  clip: CLIP_CHOICES[0],
  vibe: VIBE_CHOICES[0],
  genre: "hip-hop",
  customPlaylistId: null,
};

// Coerce an untrusted settings payload into a safe, fully-populated object.
export function sanitizeSettings(payload) {
  const p = payload && typeof payload === "object" ? payload : {};
  const pick = (val, choices) => (choices.includes(val) ? val : choices[0]);
  const genre = String(p.genre ?? "").toLowerCase();
  return {
    rounds: pick(Number(p.rounds), ROUND_CHOICES),
    roundMs: pick(Number(p.roundMs), TIMER_CHOICES),
    optionsCount: pick(Number(p.optionsCount), OPTION_CHOICES),
    mode: pick(String(p.mode || "").toUpperCase(), MODE_CHOICES),
    decade: pick(String(p.decade || "").toLowerCase(), DECADE_CHOICES),
    clip: pick(String(p.clip || "").toUpperCase(), CLIP_CHOICES),
    vibe: pick(String(p.vibe || "").toLowerCase(), VIBE_CHOICES),
    genre: ALLOWED_GENRES.includes(genre) ? genre : DEFAULT_SETTINGS.genre,
    customPlaylistId: p.customPlaylistId ? String(p.customPlaylistId) : null,
  };
}

// Pool size needed for a match
export function poolSizeFor(settings) {
  return Math.min(60, Math.max(16, settings.rounds + settings.optionsCount + 6));
}

// Allow letters, digits, space, underscore, hyphen; then mask guest profanity.
export function cleanName(raw) {
  const cleaned = String(raw ?? "")
    .replace(/[^a-zA-Z0-9 _\-]/g, "")
    .trim()
    .slice(0, 20);
  return maskProfanity(cleaned);
}

// Fisher-Yates on a copy.
export function shuffle(list) {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

// Base title normalization for deduplication
function normalizedBase(track) {
  if (!track) return "";
  if (track.baseTitle) return track.baseTitle;
  return String(track.trackName || "")
    .toLowerCase()
    .replace(/\s*[-([].*$/, "")
    .replace(/[^a-z0-9]/g, "");
}

// Build one round
export function buildRound(pool, usedTrackIds, settings) {
  const need = settings.optionsCount - 1;
  const isArtist = settings.mode === "ARTIST";
  const valueOf = isArtist ? (t) => t.artistName : (t) => t.trackName;

  const unused = pool.filter((t) => !usedTrackIds.has(t.trackId));
  const candidates = unused.length > 0 ? unused : pool;
  const correct = candidates[Math.floor(Math.random() * candidates.length)];
  const correctValue = valueOf(correct);

  const usedValues = new Set([correctValue.toLowerCase().trim()]);
  const usedBaseTitles = new Set([normalizedBase(correct)]);
  const usedArtists = new Set([String(correct.artistName || "").toLowerCase().trim()]);
  const distractors = [];
  const others = shuffle(pool.filter((t) => t.trackId !== correct.trackId));

  for (const t of others) {
    if (distractors.length === need) break;
    const aNorm = String(t.artistName || "").toLowerCase().trim();
    const vNorm = valueOf(t).toLowerCase().trim();
    const base = normalizedBase(t);

    if (usedArtists.has(aNorm)) continue;
    if (usedValues.has(vNorm)) continue;
    if (!isArtist && base && usedBaseTitles.has(base)) continue;

    distractors.push(t);
    usedArtists.add(aNorm);
    usedValues.add(vNorm);
    if (base) usedBaseTitles.add(base);
  }

  // Fallback: relax unique artist restriction if pool is tight, but keep value uniqueness
  if (distractors.length < need) {
    for (const t of others) {
      if (distractors.length === need) break;
      const vNorm = valueOf(t).toLowerCase().trim();
      const base = normalizedBase(t);

      if (usedValues.has(vNorm)) continue;
      if (!isArtist && base && usedBaseTitles.has(base)) continue;

      distractors.push(t);
      usedValues.add(vNorm);
      if (base) usedBaseTitles.add(base);
    }
  }

  const options = shuffle([correctValue, ...distractors.map(valueOf)]);
  return {
    audioUrl: correct.previewUrl,
    options,
    correct: correctValue,
    artistName: correct.artistName,
    trackName: correct.trackName,
    trackId: correct.trackId,
  };
}

export function questionValueFor(roundIndex) {
  return QUESTION_BASE + Math.max(0, roundIndex) * QUESTION_STEP;
}

export function speedBonusFor(elapsedMs, roundMs) {
  if (elapsedMs == null || elapsedMs >= roundMs) return 0;
  const clampedElapsed = Math.max(MIN_REACTION_MS, Math.min(elapsedMs, roundMs));
  const effectiveWindow = roundMs - MIN_REACTION_MS;
  if (effectiveWindow <= 0) return 0;
  const ratio = Math.max(0, Math.min(1, (roundMs - clampedElapsed) / effectiveWindow));
  return Math.round(MAX_SPEED_BONUS * ratio);
}

export function streakBonusFor(streak) {
  if (streak >= 4) return 200;
  if (streak === 3) return 100;
  if (streak === 2) return 50;
  return 0;
}

export function questionValue(roundIndex) {
  return QUESTION_BASE + Math.max(0, roundIndex) * QUESTION_STEP;
}

export function roundMaxPoints(roundIndex) {
  return QUESTION_BASE + Math.max(0, roundIndex) * QUESTION_STEP + MAX_SPEED_BONUS;
}

/**
 * Canonical, unified scoring calculation.
 * Returns breakdown of points earned and updated streak.
 */
export function computeRoundScore({
  roundIndex = 0,
  elapsedMs = 10000,
  roundMs = 10000,
  streak = 0,
  isCorrect = false,
  doubleDown = false,
  hasShield = false,
}) {
  if (!isCorrect) {
    const nextStreak = hasShield ? streak : 0;
    return {
      pointsEarned: 0,
      streakBonus: 0,
      speedBonus: 0,
      baseQuestionValue: 0,
      nextStreak,
      shieldSaved: hasShield && streak > 0,
      doubleDownActive: Boolean(doubleDown),
    };
  }

  const baseQuestionValue = questionValueFor(roundIndex);
  const speedBonus = speedBonusFor(elapsedMs, roundMs);
  const nextStreak = (streak || 0) + 1;
  const streakBonus = streakBonusFor(nextStreak);

  let rawTotal = baseQuestionValue + speedBonus + streakBonus;
  if (doubleDown) {
    rawTotal *= 2;
  }

  return {
    pointsEarned: rawTotal,
    streakBonus: doubleDown ? streakBonus * 2 : streakBonus,
    speedBonus: doubleDown ? speedBonus * 2 : speedBonus,
    baseQuestionValue: doubleDown ? baseQuestionValue * 2 : baseQuestionValue,
    nextStreak,
    shieldSaved: false,
    doubleDownActive: Boolean(doubleDown),
  };
}

// Backward compatibility helper
export function computeScore({ correct, answerTimeSeconds, roundTimeSeconds = 10, roundIndex = 0, streak = 0 }) {
  if (!correct || answerTimeSeconds == null) return 0;
  const res = computeRoundScore({
    roundIndex,
    elapsedMs: answerTimeSeconds * 1000,
    roundMs: roundTimeSeconds * 1000,
    streak,
    isCorrect: true,
  });
  return res.pointsEarned;
}

export default {
  QUESTION_BASE,
  QUESTION_STEP,
  MAX_SPEED_BONUS,
  MIN_REACTION_MS,
  MAX_FIFTY_FIFTY,
  MAX_DOUBLE_DOWN,
  MAX_SHIELD,
  ROUND_CHOICES,
  TIMER_CHOICES,
  OPTION_CHOICES,
  MODE_CHOICES,
  DECADE_CHOICES,
  CLIP_CHOICES,
  VIBE_CHOICES,
  ALLOWED_GENRES,
  DEFAULT_SETTINGS,
  sanitizeSettings,
  poolSizeFor,
  cleanName,
  shuffle,
  buildRound,
  questionValueFor,
  speedBonusFor,
  streakBonusFor,
  questionValue,
  roundMaxPoints,
  computeRoundScore,
  computeScore,
};
