// Harmonies — Music Connections Game Screen
import { useState, useEffect } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST } from "../ui";
import { HARMONIES_PUZZLES } from "../puzzleData";

export function Harmonies({ onBack }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = HARMONIES_PUZZLES[puzzleIndex % HARMONIES_PUZZLES.length];

  const [tiles, setTiles] = useState([]);
  const [selected, setSelected] = useState([]);
  const [solvedGroups, setSolvedGroups] = useState([]);
  const [mistakesRemaining, setMistakesRemaining] = useState(4);
  const [message, setMessage] = useState("");
  const [shaking, setShaking] = useState(false);

  // Initialize and shuffle tiles for current puzzle
  useEffect(() => {
    const all = puzzle.groups.flatMap((g) =>
      g.items.map((item) => ({ text: item, groupTheme: g.theme, groupLevel: g.level }))
    );
    // Shuffle
    setTiles(all.sort(() => Math.random() - 0.5));
    setSelected([]);
    setSolvedGroups([]);
    setMistakesRemaining(4);
    setMessage("");
  }, [puzzleIndex]);

  const toggleSelect = (text) => {
    if (selected.includes(text)) {
      setSelected(selected.filter((t) => t !== text));
      return;
    }
    if (selected.length >= 4) return;
    setSelected([...selected, text]);
  };

  const handleShuffle = () => {
    setTiles((prev) => [...prev].sort(() => Math.random() - 0.5));
  };

  const handleDeselect = () => {
    setSelected([]);
  };

  const handleSubmit = () => {
    if (selected.length !== 4) return;

    // Check if all 4 belong to same group
    const matchingGroup = puzzle.groups.find((g) =>
      selected.every((item) => g.items.includes(item))
    );

    if (matchingGroup) {
      // Correct!
      setSolvedGroups((prev) => [...prev, matchingGroup]);
      setTiles((prev) => prev.filter((t) => !matchingGroup.items.includes(t.text)));
      setSelected([]);
      setMessage(`✓ ${matchingGroup.theme}!`);
      setTimeout(() => setMessage(""), 2500);
    } else {
      // Check if "One away" (3 items from same group)
      const oneAway = puzzle.groups.some((g) => {
        const count = selected.filter((item) => g.items.includes(item)).length;
        return count === 3;
      });

      setShaking(true);
      setTimeout(() => setShaking(false), 500);

      const nextMistakes = mistakesRemaining - 1;
      setMistakesRemaining(nextMistakes);

      if (oneAway) {
        setMessage("One away…");
      } else {
        setMessage("Incorrect combination.");
      }
      setTimeout(() => setMessage(""), 2000);
    }
  };

  const isGameOver = mistakesRemaining <= 0;
  const isWon = solvedGroups.length === puzzle.groups.length;

  return (
    <div className="animate-rise space-y-6">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div>
          <p className="font-coin text-xs text-pink">HARMONIES // CONNECTIONS</p>
          <h2 className="font-marquee text-xl font-black uppercase tracking-tight text-bone">
            {puzzle.title}
          </h2>
        </div>
        <button type="button" onClick={onBack} className={BTN_GHOST}>
          ‹ Back
        </button>
      </div>

      <p className="font-console text-xs text-dim">
        Group 4 items that share a music connection. Avoid 4 mistakes!
      </p>

      {/* Solved Category Banners */}
      <div className="space-y-2">
        {solvedGroups.map((g) => (
          <div
            key={g.theme}
            className={`p-3 text-center transition-all ${g.color} animate-rise`}
          >
            <p className="font-console text-xs font-black uppercase tracking-wider">
              {g.theme}
            </p>
            <p className="font-console text-xs opacity-90">{g.items.join(", ")}</p>
          </div>
        ))}
      </div>

      {/* Grid of Unsolved Tiles */}
      {!isWon && !isGameOver && (
        <div className={`grid grid-cols-2 gap-2 sm:grid-cols-4 ${shaking ? "animate-pulse" : ""}`}>
          {tiles.map((tile) => {
            const isSel = selected.includes(tile.text);
            return (
              <button
                type="button"
                key={tile.text}
                onClick={() => toggleSelect(tile.text)}
                aria-pressed={isSel}
                className={`flex min-h-[4.5rem] items-center justify-center p-2 text-center font-console text-xs uppercase tracking-wide transition-[border-color,background-color,transform] active:scale-[.96] ${
                  isSel
                    ? "bg-pink text-black font-bold border border-pink"
                    : "border border-rule bg-cabinet text-bone hover:border-amber"
                }`}
              >
                {tile.text}
              </button>
            );
          })}
        </div>
      )}

      {/* Game Over Reveal */}
      {isGameOver && !isWon && (
        <div className={`${PANEL} space-y-3 p-4 text-center border-bad`}>
          <p className="font-console text-sm uppercase text-bad font-bold">Game Over · Out of strikes!</p>
          <div className="space-y-1 text-left">
            {puzzle.groups.map((g) => (
              <div key={g.theme} className={`p-2 text-xs font-console ${g.color}`}>
                <strong>{g.theme}:</strong> {g.items.join(", ")}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Win Banner */}
      {isWon && (
        <div className={`${PANEL} p-5 text-center border-good space-y-3`}>
          <p className="font-marquee text-2xl font-black uppercase text-good">
            ★ HARMONIES SOLVED! ★
          </p>
          <p className="font-console text-xs text-dim">
            Mistakes remaining: {mistakesRemaining} / 4
          </p>
          <button
            type="button"
            onClick={() => setPuzzleIndex((i) => i + 1)}
            className={`${BTN_AMBER} w-full`}
          >
            Play Next Puzzle ▶
          </button>
        </div>
      )}

      {/* Status / Mistakes Remaining */}
      {!isWon && !isGameOver && (
        <div className="flex items-center justify-between font-console text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-dim">Mistakes remaining:</span>
            <div className="flex gap-1">
              {[0, 1, 2, 3].map((i) => (
                <span
                  key={i}
                  className={`inline-block h-2.5 w-2.5 rounded-full ${
                    i < mistakesRemaining ? "bg-amber" : "bg-rule"
                  }`}
                />
              ))}
            </div>
          </div>
          {message && (
            <span className="font-bold text-pink animate-pulse">{message}</span>
          )}
        </div>
      )}

      {/* Action Buttons */}
      {!isWon && !isGameOver && (
        <div className="flex flex-wrap gap-2 pt-2">
          <button
            type="button"
            onClick={handleShuffle}
            className={`${BTN_GHOST} flex-1`}
          >
            Shuffle
          </button>
          <button
            type="button"
            onClick={handleDeselect}
            disabled={selected.length === 0}
            className={`${BTN_GHOST} flex-1 disabled:opacity-40`}
          >
            Deselect All
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={selected.length !== 4}
            className={`${BTN_AMBER} flex-1 disabled:opacity-40`}
          >
            Submit
          </button>
        </div>
      )}

      {/* Next puzzle option */}
      {(isGameOver || isWon) && (
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setPuzzleIndex((i) => i + 1)}
            className={`${BTN_AMBER} w-full`}
          >
            Next Puzzle ▶
          </button>
        </div>
      )}
    </div>
  );
}

export default Harmonies;
