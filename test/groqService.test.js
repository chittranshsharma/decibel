import { describe, it, expect } from "vitest";
import { generateDjCommentary, generateMatchVerdict, generateVibeCrate } from "../groqService.js";

describe("groqService - Offline & Fallback Resiliency", () => {
  it("generates winner commentary gracefully without API key", async () => {
    const commentary = await generateDjCommentary({
      track: { trackName: "Starboy", artistName: "The Weeknd" },
      winner: { name: "Alex", answerTimeSeconds: 0.45, streak: 3 },
      results: [
        { name: "Alex", correct: true },
        { name: "Sam", correct: false },
      ],
      round: 1,
      totalRounds: 10,
    });

    expect(typeof commentary).toBe("string");
    expect(commentary.length).toBeGreaterThan(5);
    expect(commentary).toContain("Alex");
  });

  it("generates miss commentary when nobody gets the track right", async () => {
    const commentary = await generateDjCommentary({
      track: { trackName: "One More Time", artistName: "Daft Punk" },
      winner: null,
      results: [
        { name: "Alex", correct: false },
        { name: "Sam", correct: false },
      ],
      round: 5,
      totalRounds: 10,
    });

    expect(typeof commentary).toBe("string");
    expect(commentary.length).toBeGreaterThan(5);
  });

  it("generates match verdict for game over", async () => {
    const verdict = await generateMatchVerdict({
      leaderboard: [
        { name: "Alex", score: 4500 },
        { name: "Sam", score: 3200 },
      ],
    });

    expect(typeof verdict).toBe("string");
    expect(verdict).toContain("Alex");
    expect(verdict).toContain("4500");
  });

  it("generates structured vibe crate for natural language prompt", async () => {
    const crate = await generateVibeCrate("90s Tokyo midnight drift");

    expect(crate).toBeDefined();
    expect(crate.vibeTitle).toBeDefined();
    expect(crate.description).toBeDefined();
    expect(Array.isArray(crate.searchQueries)).toBe(true);
    expect(crate.searchQueries.length).toBeGreaterThan(0);
  });

  it("handles empty or invalid vibe prompt safely", async () => {
    const crate = await generateVibeCrate("");
    expect(crate).toBeDefined();
    expect(crate.vibeTitle).toBeDefined();
    expect(Array.isArray(crate.searchQueries)).toBe(true);
  });
});

