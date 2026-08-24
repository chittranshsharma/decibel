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
  const [revealed, setRevealed] = useState(false);
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
    setRevealed(false);
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
    setRevealed(true);
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

      {/* Grid, Timer & Active Clue Header */}
      <div className="flex items-center justify-between font-console text-xs text-dim">
        <span>DIRECTION: <strong className="text-amber uppercase">{direction}</strong></span>
        <span>TIME: <strong className="text-bone">{formatTime(seconds)}</strong></span>
      </div>

      {/* 5x5 Crossword Grid */}
      <div className="mx-auto flex flex-col items-center">
        <div className="grid grid-cols-5 gap-1 border-2 border-rule bg-black p-1.5 rounded-lg shadow-inner">
          {userGrid.map((row, r) =>
            row.map((cell, c) => {
              const isBlock = puzzle.grid[r][c] === "#";
              const isSelected = selectedCell.r === r && selectedCell.c === c;
              const isHighlighted =
                !isBlock &&
                (direction === "across" ? selectedCell.r === r : selectedCell.c === c);
              const clueNum = getClueNumber(r, c);

              if (isBlock) {
                return (
                  <div
                    key={`${r}-${c}`}
                    className="h-11 w-11 sm:h-12 sm:w-12 bg-[#09090b] border border-white/5"
                  />
                );
              }

              return (
                <div
                  key={`${r}-${c}`}
                  onClick={() => handleCellClick(r, c)}
                  className={`relative flex h-11 w-11 sm:h-12 sm:w-12 cursor-pointer items-center justify-center font-geist text-base font-bold uppercase transition-colors select-none ${
                    isSelected
                      ? "bg-amber text-black ring-2 ring-amber"
                      : isHighlighted
                      ? "bg-amber/15 text-bone"
                      : "bg-cabinet text-bone hover:bg-cabinet/80"
                  } border border-rule`}
                >
                  {clueNum && (
                    <span className={`absolute top-0.5 left-1 font-console text-[9px] ${isSelected ? "text-black font-bold" : "text-dim"}`}>
                      {clueNum}
                    </span>
                  )}
                  {cell}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Clues List */}
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
        <div className={`${PANEL} p-5 text-center ${revealed ? "border-amber" : "border-good"} space-y-3`}>
          <p className={`font-marquee text-2xl font-black uppercase ${revealed ? "text-amber" : "text-good"}`}>
            {revealed ? "SOLUTION REVEALED" : "★ MINI CROSSWORD COMPLETE! ★"}
          </p>
          <p className="font-console text-xs text-dim">
            {revealed ? "Better luck on the next one!" : `Solved in ${formatTime(seconds)}`}
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
