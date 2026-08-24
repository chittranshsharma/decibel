import { describe, it, expect } from "vitest";
import {
  HARMONIES_PUZZLES,
  WORDZIC_WORDS,
  LYRICLES_PUZZLES,
  CROSSZIC_PUZZLES,
} from "../client/src/puzzleData.js";

describe("Harmonies Puzzles", () => {
  it("validates that all Harmonies puzzles have 4 groups with 4 unique items each", () => {
    expect(HARMONIES_PUZZLES.length).toBeGreaterThan(0);
    for (const puzzle of HARMONIES_PUZZLES) {
      expect(puzzle.groups).toHaveLength(4);
      const allItems = [];
      for (const group of puzzle.groups) {
        expect(group.items).toHaveLength(4);
        allItems.push(...group.items);
      }
      expect(new Set(allItems).size).toBe(16); // All 16 items are unique
    }
  });
});

describe("Wordzic Words", () => {
  it("validates that all Wordzic words are 5-letter uppercase strings", () => {
    expect(WORDZIC_WORDS.length).toBeGreaterThan(10);
    for (const word of WORDZIC_WORDS) {
      expect(word).toHaveLength(5);
      expect(/^[A-Z]{5}$/.test(word)).toBe(true);
    }
  });
});

describe("Lyricles Puzzles", () => {
  it("validates that all Lyricles puzzles have 6 lines and metadata", () => {
    expect(LYRICLES_PUZZLES.length).toBeGreaterThan(0);
    for (const p of LYRICLES_PUZZLES) {
      expect(p.lines).toHaveLength(6);
      expect(p.artist).toBeTruthy();
      expect(p.track).toBeTruthy();
    }
  });
});

describe("Crosszic Puzzles", () => {
  it("validates that all Crosszic puzzles are 5x5 grids with across and down clues", () => {
    expect(CROSSZIC_PUZZLES.length).toBeGreaterThan(0);
    for (const p of CROSSZIC_PUZZLES) {
      expect(p.size).toBe(5);
      expect(p.grid).toHaveLength(5);
      for (const row of p.grid) {
        expect(row).toHaveLength(5);
      }
      expect(p.across.length).toBeGreaterThan(0);
      expect(p.down.length).toBeGreaterThan(0);
    }
  });
});
