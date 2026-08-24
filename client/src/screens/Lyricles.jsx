// Lyricles — Song Lyrics Progression Guessing Game
import { useState, useEffect, useRef } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST } from "../ui";
import { LYRICLES_PUZZLES } from "../puzzleData";

export function Lyricles({ onBack }) {
  const [puzzleIndex, setPuzzleIndex] = useState(0);
  const puzzle = LYRICLES_PUZZLES[puzzleIndex % LYRICLES_PUZZLES.length];

  const [revealedLines, setRevealedLines] = useState(1);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("playing"); // "playing" | "won" | "lost"
  const [guesses, setGuesses] = useState([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);
  const audioRef = useRef(null);

  useEffect(() => {
    setRevealedLines(1);
    setQuery("");
    setStatus("playing");
    setGuesses([]);
    setIsPlayingAudio(false);
    setCopied(false);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  }, [puzzleIndex]);

  const handleGuess = (e) => {
    e.preventDefault();
    if (!query.trim() || status !== "playing") return;

    const guessText = query.trim();
    const isCorrect =
      guessText.toLowerCase().includes(puzzle.track.toLowerCase()) ||
      guessText.toLowerCase().includes(puzzle.artist.toLowerCase());

    const nextGuesses = [...guesses, guessText];
    setGuesses(nextGuesses);
    setQuery("");

    if (isCorrect) {
      setStatus("won");
      playSnippet();
    } else {
      if (revealedLines >= 6) {
        setStatus("lost");
        playSnippet();
      } else {
        setRevealedLines((prev) => prev + 1);
      }
    }
  };

  const handleSkip = () => {
    if (status !== "playing") return;
    const nextGuesses = [...guesses, "SKIPPED"];
    setGuesses(nextGuesses);
    if (revealedLines >= 6) {
      setStatus("lost");
      playSnippet();
    } else {
      setRevealedLines((prev) => prev + 1);
    }
  };

  const playSnippet = () => {
    if (puzzle.previewUrl && audioRef.current) {
      audioRef.current.src = puzzle.previewUrl;
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current.play().then(() => setIsPlayingAudio(true)).catch(() => {});
    }
  };

  const handleShare = () => {
    const blocks = guesses
      .map((g, i) => (i === guesses.length - 1 && status === "won" ? "🟩" : g === "SKIPPED" ? "⬛" : "🟥"))
      .join("");
    const text = `Decibel Lyricles #${puzzleIndex + 1} ${status === "won" ? guesses.length : "X"}/6\n${blocks}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="animate-rise space-y-6">
      <div className="flex items-center justify-between border-b border-rule pb-3">
        <div>
          <p className="font-coin text-xs text-pink">LYRICLES // GUESS THE SONG</p>
          <h2 className="font-marquee text-xl font-black uppercase tracking-tight text-bone">
            Puzzle #{puzzleIndex + 1}
          </h2>
        </div>
        <button type="button" onClick={onBack} className={BTN_GHOST}>
          ‹ Back
        </button>
      </div>

      <p className="font-console text-xs text-dim">
        Each attempt or skip unlocks the next lyric line ({revealedLines}/6 revealed).
      </p>

      {/* Lyric Cards Container */}
      <div className="space-y-2">
        {puzzle.lines.map((line, idx) => {
          const isRevealed = idx < revealedLines;
          return (
            <div
              key={idx}
              className={`p-3 border font-console text-xs leading-relaxed transition-all ${
                isRevealed
                  ? "border-amber bg-cabinet text-bone shadow-sm"
                  : "border-rule/40 bg-void text-dim/20 select-none"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="font-marquee text-[10px] text-pink font-bold">L{idx + 1}</span>
                {isRevealed ? (
                  <p className="font-medium">{line}</p>
                ) : (
                  <p className="italic text-dim/30">━━━━━━━━━━━━━━━━━━━━━━━━━━━━</p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input Form */}
      {status === "playing" && (
        <form onSubmit={handleGuess} className="space-y-3">
          <input
            type="text"
            placeholder="Type song title or artist..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full border border-rule bg-void px-3 py-2.5 font-console text-xs text-bone placeholder:text-dim focus:border-amber focus:outline-none"
          />
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleSkip}
              className={`${BTN_GHOST} flex-1`}
            >
              Skip Line (+1)
            </button>
            <button
              type="submit"
              disabled={!query.trim()}
              className={`${BTN_AMBER} flex-1 disabled:opacity-40`}
            >
              Submit Guess
            </button>
          </div>
        </form>
      )}

      {/* Result Card with Audio Playback */}
      {status !== "playing" && (
        <div className={`${PANEL} p-5 text-center space-y-4 border-${status === "won" ? "good" : "bad"}`}>
          <div>
            <p className={`font-marquee text-xl font-black uppercase text-${status === "won" ? "good" : "bad"}`}>
              {status === "won" ? "★ CORRECT! ★" : "GAME OVER"}
            </p>
            <h3 className="mt-1 font-marquee text-2xl font-black text-bone">{puzzle.track}</h3>
            <p className="font-console text-xs text-dim">{puzzle.artist} ({puzzle.year} · {puzzle.genre})</p>
          </div>

          {/* Audio preview controls */}
          {puzzle.previewUrl && (
            <button
              type="button"
              onClick={toggleAudio}
              className={`${BTN_GHOST} inline-flex items-center gap-2 border-good text-good`}
            >
              {isPlayingAudio ? "❚❚ Pause Snippet" : "▶ Play 30s Snippet"}
            </button>
          )}

          <div className="flex gap-2 pt-2">
            <button type="button" onClick={handleShare} className={`${BTN_GHOST} flex-1`}>
              {copied ? "Copied!" : "Share Results"}
            </button>
            <button
              type="button"
              onClick={() => setPuzzleIndex((i) => i + 1)}
              className={`${BTN_AMBER} flex-1`}
            >
              Next Song ▶
            </button>
          </div>
        </div>
      )}

      <audio ref={audioRef} onEnded={() => setIsPlayingAudio(false)} className="hidden" />
    </div>
  );
}

export default Lyricles;
