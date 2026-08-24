// Crosszic — Interactive 5x5 Mini Music Crossword Game
import { useState, useEffect, useRef } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST } from "../ui";
import { CROSSZIC_PUZZLES } from "../puzzleData";

export function Crosszic({ onBack }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = CROSSZIC_PUZZLES[puzzleIndex % CROSSZIC_PUZZLES.length];

  // User input grid state: 5x5 array of characters
  const [userGrid, setUserGrid] = useState([]);
  const [selectedCell, setSelectedCell] = useState({ r: 0, c: 0 });
  const [direction, setDirection] = useState("across"); // "across" | "down"
  const [solved, setSolved] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [timerActive, setTimerActive] = useState(true);

  // Initialize grid
  useEffect(() => {
    const initial = Array(puzzle.size)
      .fill(null)
      .map(() => Array(puzzle.size).fill(""));
    setUserGrid(initial);
    setSelectedCell({ r: 0, c: 0 });
    setDirection("across");
    setSolved(false);
    setSeconds(0);
    setTimerActive(true);
  }, [puzzleIndex]);

  // Stopwatch timer
  useEffect(() => {
    if (!timerActive || solved) return;
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [timerActive, solved]);

  const handleCellClick = (r, c) => {
    if (puzzle.grid[r][c] === "#") return;
    if (selectedCell.r === r && selectedCell.c === c) {
      setDirection((d) => (d === "across" ? "down" : "across"));
    } else {
      setSelectedCell({ r, c });
    }
  };

  const handleKeyDown = (e) => {
    const { r, c } = selectedCell;
    if (puzzle.grid[r]?.[c] === "#" || solved) return;

    if (e.key === "Backspace") {
      e.preventDefault();
      setUserGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = "";
        return next;
      });
      // Move backwards
      moveCursor(-1);
      return;
    }

    if (e.key === "ArrowRight") {
      e.preventDefault();
      moveInGrid(0, 1);
      return;
    }
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      moveInGrid(0, -1);
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      moveInGrid(1, 0);
      return;
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      moveInGrid(-1, 0);
      return;
    }

    const char = e.key.toUpperCase();
    if (/^[A-Z]$/.test(char)) {
      e.preventDefault();
      setUserGrid((prev) => {
        const next = prev.map((row) => [...row]);
        next[r][c] = char;
        checkWin(next);
        return next;
      });
      // Advance to next cell
      moveCursor(1);
    }
  };

  const moveInGrid = (dr, dc) => {
    let nr = selectedCell.r + dr;
    let nc = selectedCell.c + dc;
    if (nr >= 0 && nr < puzzle.size && nc >= 0 && nc < puzzle.size) {
      if (puzzle.grid[nr][nc] !== "#") {
        setSelectedCell({ r: nr, c: nc });
      }
    }
  };

  const moveCursor = (step) => {
    let { r, c } = selectedCell;
    let nr = r;
    let nc = c;

    if (direction === "across") {
      nc += step;
    } else {
      nr += step;
    }

    if (nr >= 0 && nr < puzzle.size && nc >= 0 && nc < puzzle.size) {
      if (puzzle.grid[nr][nc] !== "#") {
        setSelectedCell({ r: nr, c: nc });
      }
    }
  };

  const checkWin = (current) => {
    for (let r = 0; r < puzzle.size; r++) {
      for (let c = 0; c < puzzle.size; c++) {
        const target = puzzle.grid[r][c];
        if (target !== "#") {
          if (current[r][c] !== target) return;
        }
      }
    }
    setSolved(true);
    setTimerActive(false);
  };

  const handleReveal = () => {
    setUserGrid(puzzle.grid.map((row) => [...row]));
    setSolved(true);
    setTimerActive(false);
  };

  const formatTime = (totalSeconds) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${String(secs).padStart(2, "0")}`;
  };

  return (
    <div className="animate-rise space-y-6" onKeyDown={handleKeyDown} tabIndex={0}>
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div>
          <p className="font-coin text-xs text-pink">CROSSZIC // MINI CROSSWORD</p>
          <h2 className="font-marquee text-xl font-black uppercase tracking-tight text-bone">
            {puzzle.title}
          </h2>
        </div>
        <button type="button" onClick={onBack} className={BTN_GHOST}>
          ‹ Back
        </button>
      </div>

      <div className="flex items-center justify-between font-console text-xs">
        <span className="text-dim">Direction: <strong className="text-amber uppercase">{direction}</strong> (Tap cell to toggle)</span>
        <span className="font-mono text-amber tabular-nums">⏱ {formatTime(seconds)}</span>
      </div>

      {/* Crossword 5x5 Grid */}
      <div className="mx-auto flex justify-center">
        <div className="grid grid-cols-5 gap-1 border-2 border-rule bg-rule p-1">
          {puzzle.grid.map((row, r) =>
            row.map((cell, c) => {
              const isBlocked = cell === "#";
              const isSelected = selectedCell.r === r && selectedCell.c === c;
              const isHighlighted =
                !isBlocked &&
                (direction === "across" ? selectedCell.r === r : selectedCell.c === c);
              const val = userGrid[r]?.[c] || "";

              if (isBlocked) {
                return (
                  <div key={`${r}-${c}`} className="h-11 w-11 sm:h-12 sm:w-12 bg-black" />
                );
              }

              return (
                <button
                  type="button"
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center font-marquee text-base sm:text-lg font-black uppercase transition-all ${
                    isSelected
                      ? "bg-pink text-black ring-2 ring-pink z-10 font-black"
                      : isHighlighted
                      ? "bg-cabinet text-bone border border-amber/40"
                      : "bg-cabinet text-bone border border-rule"
                  }`}
                >
                  {val}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Clues Section */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 pt-2">
        <div className="space-y-2">
          <p className={EYEBROW}>Across Clues</p>
          <ul className="space-y-1 font-console text-xs">
            {puzzle.across.map((clue) => (
              <li
                key={clue.num}
                onClick={() => {
                  setSelectedCell({ r: clue.row, c: clue.col });
                  setDirection("across");
                }}
                className={`cursor-pointer p-1.5 transition-colors ${
                  direction === "across" && selectedCell.r === clue.row
                    ? "bg-cabinet text-amber font-bold border-l-2 border-amber"
                    : "text-dim hover:text-bone"
                }`}
              >
                <strong>{clue.num}A.</strong> {clue.clue}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <p className={EYEBROW}>Down Clues</p>
          <ul className="space-y-1 font-console text-xs">
            {puzzle.down.map((clue) => (
              <li
                key={clue.num}
                onClick={() => {
                  setSelectedCell({ r: clue.row, c: clue.col });
                  setDirection("down");
                }}
                className={`cursor-pointer p-1.5 transition-colors ${
                  direction === "down" && selectedCell.c === clue.col
                    ? "bg-cabinet text-amber font-bold border-l-2 border-amber"
                    : "text-dim hover:text-bone"
                }`}
              >
                <strong>{clue.num}D.</strong> {clue.clue}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Solve Banner */}
      {solved && (
        <div className={`${PANEL} p-5 text-center border-good space-y-3`}>
          <p className="font-marquee text-2xl font-black uppercase text-good">
            ★ MINI CROSSWORD COMPLETE! ★
          </p>
          <p className="font-console text-xs text-dim">
            Solved in {formatTime(seconds)}
          </p>
          <button
            type="button"
            onClick={() => setPuzzleIndex((i) => i + 1)}
            className={`${BTN_AMBER} w-full`}
          >
            Play Next Crossword ▶
          </button>
        </div>
      )}

      {/* Bottom controls */}
      {!solved && (
        <div className="flex gap-2">
          <button type="button" onClick={handleReveal} className={`${BTN_GHOST} flex-1`}>
            Reveal Puzzle
          </button>
          <button
            type="button"
            onClick={() => setPuzzleIndex((i) => i + 1)}
            className={`${BTN_AMBER} flex-1`}
          >
            Next Puzzle ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default Crosszic;
