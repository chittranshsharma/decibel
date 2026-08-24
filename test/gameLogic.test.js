import { describe, it, expect } from "vitest";
import {
  sanitizeSettings,
  poolSizeFor,
  buildRound,
  cleanName,
  questionValueFor,
  speedBonusFor,
  streakBonusFor,
  computeRoundScore,
  DEFAULT_SETTINGS,
  MAX_SPEED_BONUS,
} from "../gameLogic.js";

const POOL = [
  { trackId: 1, trackName: "Alpha", artistName: "Ann", previewUrl: "u1" },
  { trackId: 2, trackName: "Bravo", artistName: "Ben", previewUrl: "u2" },
  { trackId: 3, trackName: "Charlie", artistName: "Cara", previewUrl: "u3" },
  { trackId: 4, trackName: "Delta", artistName: "Dee", previewUrl: "u4" },
  { trackId: 5, trackName: "Echo", artistName: "Eli", previewUrl: "u5" },
  { trackId: 6, trackName: "Foxtrot", artistName: "Fae", previewUrl: "u6" },
  { trackId: 7, trackName: "Golf", artistName: "Gus", previewUrl: "u7" },
];

describe("sanitizeSettings", () => {
  it("accepts valid values", () => {
    expect(
      sanitizeSettings({ rounds: 15, roundMs: 7500, optionsCount: 6, mode: "artist", decade: "2010s", clip: "intro", vibe: "underground", genre: "desi-hip-hop" })
    ).toEqual({
      rounds: 15,
      roundMs: 7500,
      optionsCount: 6,
      mode: "ARTIST",
      decade: "2010s",
      clip: "INTRO",
      vibe: "underground",
      genre: "desi-hip-hop",
      customPlaylistId: null,
    });
    // "rap" is no longer its own family — it clamps to the hip-hop default.
    expect(sanitizeSettings({ genre: "rap" }).genre).toBe("hip-hop");
  });

  it("clamps every off-list / hostile field back to the default", () => {
    expect(sanitizeSettings({ rounds: 999, roundMs: 1, optionsCount: 100, mode: "x", decade: "1800s", genre: "polka" })).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings("evil")).toEqual(DEFAULT_SETTINGS);
  });
});

describe("poolSizeFor", () => {
  it("scales with rounds + options but stays bounded [16, 60]", () => {
    expect(poolSizeFor({ rounds: 5, optionsCount: 4 })).toBe(16);
    expect(poolSizeFor({ rounds: 15, optionsCount: 6 })).toBe(27);
    expect(poolSizeFor({ rounds: 100, optionsCount: 6 })).toBe(60);
  });
});

describe("buildRound", () => {
  it("TITLE mode: optionsCount distinct titles including the answer", () => {
    for (let i = 0; i < 50; i++) {
      const r = buildRound(POOL, new Set(), { optionsCount: 4, mode: "TITLE" });
      expect(r.options).toHaveLength(4);
      expect(r.options).toContain(r.correct);
      expect(new Set(r.options).size).toBe(4); // no duplicate options
      expect(r.correct).toBe(r.trackName);
    }
  });

  it("ARTIST mode: options are artist names and the answer is the artist", () => {
    for (let i = 0; i < 50; i++) {
      const r = buildRound(POOL, new Set(), { optionsCount: 4, mode: "ARTIST" });
      expect(r.options).toContain(r.artistName);
      expect(r.correct).toBe(r.artistName);
      expect(new Set(r.options).size).toBe(4);
    }
  });

  it("prefers unused tracks for the correct answer", () => {
    const used = new Set([1, 2, 3, 4, 5, 6]); // only track 7 unused
    const r = buildRound(POOL, used, { optionsCount: 4, mode: "TITLE" });
    expect(r.trackId).toBe(7);
  });

  it("supports 6 options when the pool is large enough", () => {
    const r = buildRound(POOL, new Set(), { optionsCount: 6, mode: "TITLE" });
    expect(r.options).toHaveLength(6);
    expect(new Set(r.options).size).toBe(6);
  });
});

describe("scoring", () => {
  it("questionValue grows by step per round", () => {
    expect(questionValueFor(0)).toBe(300);
    expect(questionValueFor(9)).toBe(300 + 9 * 250);
  });

  it("speed bonus is max at t=0 and zero at/after the deadline", () => {
    expect(speedBonusFor(0, 10000)).toBe(MAX_SPEED_BONUS);
    expect(speedBonusFor(150, 10000)).toBe(MAX_SPEED_BONUS);
    expect(speedBonusFor(10000, 10000)).toBe(0);
    expect(speedBonusFor(99999, 10000)).toBe(0);
    expect(speedBonusFor(5000, 10000)).toBe(178);
  });

  it("streak bonus tiers", () => {
    expect(streakBonusFor(1)).toBe(0);
    expect(streakBonusFor(2)).toBe(50);
    expect(streakBonusFor(3)).toBe(100);
    expect(streakBonusFor(4)).toBe(200);
    expect(streakBonusFor(9)).toBe(200);
  });

  it("computeRoundScore accurately calculates points and handles powerups", () => {
    // Correct without powerups
    const r1 = computeRoundScore({
      roundIndex: 0,
      elapsedMs: 2000,
      roundMs: 10000,
      streak: 0,
      isCorrect: true,
    });
    expect(r1.pointsEarned).toBe(300 + speedBonusFor(2000, 10000) + 0);
    expect(r1.nextStreak).toBe(1);

    // Double Down 2x
    const rDouble = computeRoundScore({
      roundIndex: 0,
      elapsedMs: 2000,
      roundMs: 10000,
      streak: 0,
      isCorrect: true,
      doubleDown: true,
    });
    expect(rDouble.pointsEarned).toBe(r1.pointsEarned * 2);

    // Incorrect without shield resets streak
    const rWrong = computeRoundScore({
      roundIndex: 1,
      streak: 3,
      isCorrect: false,
      hasShield: false,
    });
    expect(rWrong.pointsEarned).toBe(0);
    expect(rWrong.nextStreak).toBe(0);

    // Incorrect with shield preserves streak
    const rShield = computeRoundScore({
      roundIndex: 1,
      streak: 3,
      isCorrect: false,
      hasShield: true,
    });
    expect(rShield.pointsEarned).toBe(0);
    expect(rShield.nextStreak).toBe(3);
    expect(rShield.shieldSaved).toBe(true);
  });
});

describe("buildRound deduplication", () => {
  it("filters near-duplicate titles sharing the same baseTitle", () => {
    const poolWithDupes = [
      { trackId: 1, trackName: "Starboy", artistName: "The Weeknd", previewUrl: "u1" },
      { trackId: 2, trackName: "Starboy (Remix)", artistName: "Kygo", previewUrl: "u2" },
      { trackId: 3, trackName: "Starboy - Instrumental", artistName: "Studio", previewUrl: "u3" },
      { trackId: 4, trackName: "Blinding Lights", artistName: "Abel", previewUrl: "u4" },
      { trackId: 5, trackName: "Save Your Tears", artistName: "Max", previewUrl: "u5" },
      { trackId: 6, trackName: "Can't Feel My Face", artistName: "Dan", previewUrl: "u6" },
    ];
    const r = buildRound(poolWithDupes, new Set(), { optionsCount: 4, mode: "TITLE" });
    const starboyCount = r.options.filter((opt) => opt.toLowerCase().includes("starboy")).length;
    expect(starboyCount).toBe(1);
  });
});

describe("cleanName", () => {
  it("strips disallowed characters and trims length", () => {
    expect(cleanName("  good_name-1  ")).toBe("good_name-1");
    expect(cleanName("a".repeat(40)).length).toBe(20);
    expect(cleanName("dr🤖op<>")).toBe("drop");
  });
  it("masks profane handles", () => {
    expect(cleanName("fuck")).toBe("****");
  });
});
