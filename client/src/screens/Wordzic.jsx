// Wordzic — Music Wordle Game Screen
import { useState, useEffect, useCallback } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST } from "../ui";
import { WORDZIC_WORDS } from "../puzzleData";

const KEYBOARD_ROWS = [
  ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
  ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
  ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "⌫"],
];

export function evaluateWordleGuess(guess, target) {
  if (!guess || !target || guess.length !== 5 || target.length !== 5) {
    return Array(5).fill("absent");
  }
  const res = Array(5).fill("absent");
  const letterCounts = {};

  for (let i = 0; i < 5; i++) {
    const char = target[i];
    letterCounts[char] = (letterCounts[char] || 0) + 1;
  }

  // Pass 1: exact matches
  for (let i = 0; i < 5; i++) {
    if (guess[i] === target[i]) {
      res[i] = "correct";
      letterCounts[guess[i]]--;
    }
  }

  // Pass 2: misplaced matches up to remaining letter frequency
  for (let i = 0; i < 5; i++) {
    if (res[i] === "correct") continue;
    const char = guess[i];
    if (letterCounts[char] && letterCounts[char] > 0) {
      res[i] = "present";
      letterCounts[char]--;
    }
  }

  return res;
}

export function Wordzic({ onBack }) {
  const [targetIndex, setTargetIndex] = useState(0);
  const targetWord = WORDZIC_WORDS[targetIndex % WORDZIC_WORDS.length];

  const [guesses, setGuesses] = useState([]);
  const [currentGuess, setCurrentGuess] = useState("");
  const [status, setStatus] = useState("playing"); // "playing" | "won" | "lost"
  const [toast, setToast] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setGuesses([]);
    setCurrentGuess("");
    setStatus("playing");
    setToast("");
    setCopied(false);
  }, [targetIndex]);

  const onKeyPress = useCallback(
    (key) => {
      if (status !== "playing") return;

      if (key === "ENTER") {
        if (currentGuess.length < 5) {
          setToast("Not enough letters");
          setTimeout(() => setToast(""), 1500);
          return;
        }

        const nextGuesses = [...guesses, currentGuess];
        setGuesses(nextGuesses);
        setCurrentGuess("");

        if (currentGuess === targetWord) {
          setStatus("won");
          setToast("★ BRILLIANT! ★");
        } else if (nextGuesses.length >= 6) {
          setStatus("lost");
          setToast(`Game Over. Word was ${targetWord}`);
        }
        return;
      }

      if (key === "BACKSPACE" || key === "⌫") {
        setCurrentGuess((prev) => prev.slice(0, -1));
        return;
      }

      if (/^[A-Z]$/.test(key) && currentGuess.length < 5) {
        setCurrentGuess((prev) => prev + key);
      }
    },
    [currentGuess, guesses, status, targetWord]
  );

  // Physical keyboard listener
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onKeyPress("ENTER");
      } else if (e.key === "Backspace") {
        onKeyPress("BACKSPACE");
      } else {
        const k = e.key.toUpperCase();
        if (/^[A-Z]$/.test(k)) {
          onKeyPress(k);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onKeyPress]);

  // Compute key statuses for keyboard
  const keyStatuses = {};
  for (const guess of guesses) {
    const evals = evaluateWordleGuess(guess, targetWord);
    for (let i = 0; i < guess.length; i++) {
      const letter = guess[i];
      const ev = evals[i];
      if (ev === "correct") {
        keyStatuses[letter] = "correct";
      } else if (ev === "present" && keyStatuses[letter] !== "correct") {
        keyStatuses[letter] = "present";
      } else if (!keyStatuses[letter]) {
        keyStatuses[letter] = "absent";
      }
    }
  }

  const getTileClass = (guess, colIndex) => {
    if (!guess) return "border border-rule bg-cabinet text-bone";
    const evals = evaluateWordleGuess(guess, targetWord);
    const ev = evals[colIndex];
    if (ev === "correct") {
      return "bg-good text-black font-bold border-good";
    }
    if (ev === "present") {
      return "bg-amber text-black font-bold border-amber";
    }
    return "bg-void border-dim/40 text-dim";
  };

  const handleShare = () => {
    const grid = guesses
      .map((g) => {
        const evals = evaluateWordleGuess(g, targetWord);
        return evals.map((e) => (e === "correct" ? "🟩" : e === "present" ? "🟨" : "⬛")).join("");
      })
      .join("\n");
    const text = `Decibel Wordzic #${targetIndex + 1} ${status === "won" ? guesses.length : "X"}/6\n\n${grid}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-rise space-y-6">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div>
          <p className="font-coin text-xs text-pink">WORDZIC // MUSIC WORDLE</p>
          <h2 className="font-marquee text-xl font-black uppercase tracking-tight text-bone">
            Word #{targetIndex + 1}
          </h2>
        </div>
        <button type="button" onClick={onBack} className={BTN_GHOST}>
          ‹ Back
        </button>
      </div>

      <p className="font-console text-xs text-dim text-center">
        Guess the 5-letter music term in 6 tries. Green = right spot, Yellow = wrong spot.
      </p>

      {/* 6-Row Guessing Grid */}
      <div className="mx-auto max-w-[17.5rem] space-y-1.5">
        {[0, 1, 2, 3, 4, 5].map((rowIndex) => {
          const isCurrentRow = rowIndex === guesses.length;
          const guess = guesses[rowIndex];

          return (
            <div key={rowIndex} className="grid grid-cols-5 gap-1.5">
              {[0, 1, 2, 3, 4].map((colIndex) => {
                let letter = "";
                if (guess) {
                  letter = guess[colIndex] || "";
                } else if (isCurrentRow) {
                  letter = currentGuess[colIndex] || "";
                }

                return (
                  <div
                    key={colIndex}
                    className={`flex h-12 w-12 items-center justify-center rounded-lg font-geist text-lg font-bold uppercase border transition-all ${
                      guess
                        ? getTileClass(guess, colIndex)
                        : isCurrentRow && letter
                        ? "border-white/40 bg-white/10 text-white animate-pulse"
                        : "border-white/10 bg-[#121218]/80 text-bone"
                    }`}
                  >
                    {letter}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {toast && (
        <p className="font-geist text-center text-sm font-semibold text-[#50e3c2] animate-pulse">
          {toast}
        </p>
      )}

      {/* Victory / Game Over card */}
      {status !== "playing" && (
        <div className={`${PANEL} p-5 text-center space-y-3 border-[#50e3c2]/40`}>
          <p className="font-geist text-xl font-bold uppercase text-white">
            {status === "won" ? "★ PUZZLE SOLVED! ★" : `WORD WAS: ${targetWord}`}
          </p>
          <div className="flex gap-2">
            <button type="button" onClick={handleShare} className={`${BTN_GHOST} flex-1`}>
              {copied ? "Copied!" : "Share Results"}
            </button>
            <button
              type="button"
              onClick={() => setTargetIndex((i) => i + 1)}
              className={`${BTN_AMBER} flex-1`}
            >
              Next Word ▶
            </button>
          </div>
        </div>
      )}

      {/* On-Screen Keyboard */}
      <div className="space-y-1.5 pt-2">
        {KEYBOARD_ROWS.map((row, rIdx) => (
          <div key={rIdx} className="flex justify-center gap-1">
            {row.map((k) => {
              const st = keyStatuses[k];
              const isWide = k === "ENTER" || k === "⌫";
              let bg = "bg-[#121218]/90 text-bone border-white/10";
              if (st === "correct") bg = "bg-[#50e3c2] text-black font-bold border-[#50e3c2]";
              else if (st === "present") bg = "bg-[#f5a623] text-black font-bold border-[#f5a623]";
              else if (st === "absent") bg = "bg-black/60 text-dim/30 border-white/5";

              return (
                <button
                  type="button"
                  key={k}
                  onClick={() => onKeyPress(k)}
                  className={`flex h-11 items-center justify-center rounded-md border font-geist text-xs font-semibold uppercase transition-all active:scale-95 ${
                    isWide ? "px-3 text-[11px]" : "w-8 sm:w-10"
                  } ${bg}`}
                >
                  {k}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Wordzic;
