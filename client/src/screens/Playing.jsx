// Playing: audio round, options, CRT timer, spectrum visualizer, and arcade power-ups.
import { useEffect, useRef, useState } from "react";
import { EYEBROW, BTN_GHOST, ReactionBar } from "../ui";

// Fallback scoring constants, mirroring server.js (banner uses roundMeta first).
const QUESTION_BASE = 300;
const QUESTION_STEP = 250;
const MAX_SPEED_BONUS = 350;

const OPT_COLORS = [
  { num: "text-cyan", sel: "border-cyan bg-cyan/10 ring-cyan", hov: "enabled:hover:border-cyan enabled:hover:bg-cyan/10" },
  { num: "text-pink", sel: "border-pink bg-pink/10 ring-pink", hov: "enabled:hover:border-pink enabled:hover:bg-pink/10" },
  { num: "text-good", sel: "border-good bg-good/10 ring-good", hov: "enabled:hover:border-good enabled:hover:bg-good/10" },
  { num: "text-yellow", sel: "border-yellow bg-yellow/10 ring-yellow", hov: "enabled:hover:border-yellow enabled:hover:bg-yellow/10" },
];

// ---------- Playing ----------
export function Playing({ state, roundMeta, myGuess, hasGuessed, spectator, onGuess, onReact, audioRef }) {
  const locked = hasGuessed || spectator;
  const startRef = useRef(() => {});
  const [needsTap, setNeedsTap] = useState(false);
  const [audioError, setAudioError] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  // Arcade Power-Ups state (1 charge each per game session)
  const [powerups, setPowerups] = useState({
    fiftyFifty: true,
    doubleDown: true,
    shield: true,
  });
  const [eliminatedOptions, setEliminatedOptions] = useState([]);
  const [doubleDownActive, setDoubleDownActive] = useState(false);
  const [shieldActive, setShieldActive] = useState(false);

  // Reset per-round modifiers (keep charge state across rounds in a match)
  useEffect(() => {
    setEliminatedOptions([]);
    setDoubleDownActive(false);
    setShieldActive(false);
  }, [state.round]);

  // Audio Playback effect
  useEffect(() => {
    const el = audioRef.current;
    if (!el) return;

    let pauseTimer = null;
    el.pause();
    el.src = state.audioUrl;
    el.load();

    const start = () => {
      try {
        if (state.clip === "INTRO") {
          el.currentTime = 0;
        } else {
          const maxOffset = Math.max(0, el.duration - 10);
          el.currentTime = Math.random() * Math.min(15, maxOffset);
        }
      } catch {
        /* not seekable yet */
      }
      const p = el.play();
      if (p && typeof p.then === "function") {
        p.then(() => {
          setNeedsTap(false);
          setAudioError(false);
          setIsPlaying(true);
        }).catch(() => {
          setNeedsTap(true);
          setIsPlaying(false);
        });
      }
      if (pauseTimer) clearTimeout(pauseTimer);
      pauseTimer = setTimeout(() => {
        el.pause();
        setIsPlaying(false);
      }, state.roundMs ?? 10000);
    };
    startRef.current = start;

    const onError = () => {
      setAudioError(true);
      setIsPlaying(false);
    };
    el.addEventListener("error", onError);

    if (el.readyState >= 1) start();
    else el.addEventListener("loadedmetadata", start, { once: true });

    return () => {
      if (pauseTimer) clearTimeout(pauseTimer);
      el.removeEventListener("loadedmetadata", start);
      el.removeEventListener("error", onError);
      el.pause();
      setIsPlaying(false);
    };
  }, [state.audioUrl, audioRef]);

  const retryAudio = () => {
    const el = audioRef.current;
    if (!el) return;
    setAudioError(false);
    el.load();
    el.play().then(() => {
      setNeedsTap(false);
      setIsPlaying(true);
    }).catch(() => setNeedsTap(true));
  };

  // Arcade keys 1-4
  useEffect(() => {
    if (locked) return;
    const onKey = (e) => {
      const i = parseInt(e.key, 10);
      if (i >= 1 && i <= (state.options?.length ?? 0)) {
        const targetOpt = state.options[i - 1];
        if (!eliminatedOptions.includes(targetOpt)) {
          onGuess(targetOpt);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [locked, state.options, eliminatedOptions, onGuess]);

  // Handle Power-Up Actions
  const useFiftyFifty = () => {
    if (!powerups.fiftyFifty || locked || state.options.length < 3) return;
    setPowerups((p) => ({ ...p, fiftyFifty: false }));
    // Eliminate up to 2 options (distractors)
    const countToElim = Math.min(2, state.options.length - 2);
    const shuffled = [...state.options].sort(() => Math.random() - 0.5);
    const toElim = shuffled.slice(0, countToElim);
    setEliminatedOptions(toElim);
  };

  const useDoubleDown = () => {
    if (!powerups.doubleDown || locked || doubleDownActive) return;
    setPowerups((p) => ({ ...p, doubleDown: false }));
    setDoubleDownActive(true);
  };

  const useShield = () => {
    if (!powerups.shield || locked || shieldActive) return;
    setPowerups((p) => ({ ...p, shield: false }));
    setShieldActive(true);
  };

  const questionValue =
    (roundMeta?.questionValue ?? QUESTION_BASE + (state.round - 1) * QUESTION_STEP) *
    (doubleDownActive ? 2 : 1);
  const maxSpeedBonus = (roundMeta?.maxSpeedBonus ?? MAX_SPEED_BONUS) * (doubleDownActive ? 2 : 1);
  const isArtist = state.mode === "ARTIST";
  const roundSeconds = Math.round((state.roundMs ?? 10000) / 1000);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className={EYEBROW}>
          {isArtist ? "Name the artist" : "Name the track"}
          {state.clip === "INTRO" ? " · intro" : ""}
          {doubleDownActive ? " · 🔥 2X DOUBLE" : ""}
          {shieldActive ? " · 🛡️ SHIELD" : ""}
        </span>
        <span className="font-console text-xs uppercase tracking-[0.18em] text-dim">
          QV <span className="text-amber font-bold">{questionValue}</span> · Speed ≤{maxSpeedBonus}
        </span>
      </div>

      {/* CRT Scoreboard & Animated Spectrum Visualizer */}
      <div className="space-y-2">
        <TimeCounter
          timeRemainingMs={state.timeRemainingMs}
          round={state.round}
          total={roundSeconds}
        />
        <SpectrumVisualizer active={isPlaying} />
      </div>

      {audioError && (
        <button
          type="button"
          onClick={retryAudio}
          className="w-full border border-amber px-5 py-3 font-console text-sm uppercase tracking-[0.2em] text-amber transition-colors hover:bg-amber hover:text-black"
        >
          Audio didn't load — retry
        </button>
      )}

      {needsTap && (
        <button type="button" onClick={() => startRef.current()} className={`${BTN_GHOST} w-full`}>
          ▶ Play clip
        </button>
      )}

      {/* Options Grid */}
      <div className="grid gap-3">
        {state.options.map((opt, i) => {
          const selected = myGuess === opt;
          const isEliminated = eliminatedOptions.includes(opt);
          const dimmed = (locked && !selected) || isEliminated;
          const c = OPT_COLORS[i % OPT_COLORS.length];

          return (
            <div key={opt} className="min-w-0 animate-rise" style={{ animationDelay: `${i * 50}ms` }}>
              <button
                type="button"
                onClick={() => onGuess(opt)}
                disabled={locked || isEliminated}
                aria-label={`Option ${i + 1}: ${opt}`}
                className={[
                  "flex w-full items-center justify-between border px-4 py-4 text-left font-console text-sm uppercase tracking-wide text-bone",
                  "transition-[border-color,background-color,opacity,transform] enabled:active:scale-[.96]",
                  selected
                    ? `ring-2 ${c.sel} animate-lockin`
                    : isEliminated
                    ? "border-rule/20 bg-void line-through text-dim/30 pointer-events-none"
                    : doubleDownActive
                    ? `border-pink bg-pink/5 hover:bg-pink/15 ${c.hov}`
                    : `border-rule bg-cabinet ${c.hov}`,
                  dimmed ? "pointer-events-none opacity-30" : "",
                  "disabled:cursor-not-allowed",
                ].join(" ")}
              >
                <span className="flex items-center gap-3 min-w-0">
                  <span className={`font-console text-xs ${c.num}`}>{i + 1}</span>
                  <span className="min-w-0 truncate">{opt}</span>
                </span>
                {isEliminated && (
                  <span className="font-mono text-[10px] text-bad font-bold uppercase">50:50 OUT</span>
                )}
              </button>
              {hasGuessed && selected && (
                <p className={`mt-1 animate-rise font-console text-xs uppercase tracking-[0.2em] ${c.num}`}>
                  Locked In {doubleDownActive ? "★ 2X ACTIVE" : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Arcade Power-Ups Bar */}
      {!locked && !spectator && (
        <div className="border border-rule bg-cabinet p-3 space-y-2">
          <p className="font-coin text-[10px] text-pink tracking-wider">ARCADE POWER-UPS</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={useFiftyFifty}
              disabled={!powerups.fiftyFifty || locked || state.options.length < 3}
              className={`p-2 border text-center font-console text-xs uppercase transition-all ${
                powerups.fiftyFifty
                  ? "border-amber text-amber hover:bg-amber hover:text-black active:scale-95"
                  : "border-rule/40 text-dim/30 pointer-events-none"
              }`}
            >
              💣 50:50 {powerups.fiftyFifty ? "1x" : "USED"}
            </button>
            <button
              type="button"
              onClick={useDoubleDown}
              disabled={!powerups.doubleDown || locked || doubleDownActive}
              className={`p-2 border text-center font-console text-xs uppercase transition-all ${
                doubleDownActive
                  ? "border-pink bg-pink text-black font-bold animate-pulse"
                  : powerups.doubleDown
                  ? "border-pink text-pink hover:bg-pink hover:text-black active:scale-95"
                  : "border-rule/40 text-dim/30 pointer-events-none"
              }`}
            >
              ⚡ 2X BET {doubleDownActive ? "ACTIVE" : powerups.doubleDown ? "1x" : "USED"}
            </button>
            <button
              type="button"
              onClick={useShield}
              disabled={!powerups.shield || locked || shieldActive}
              className={`p-2 border text-center font-console text-xs uppercase transition-all ${
                shieldActive
                  ? "border-good bg-good text-black font-bold"
                  : powerups.shield
                  ? "border-good text-good hover:bg-good hover:text-black active:scale-95"
                  : "border-rule/40 text-dim/30 pointer-events-none"
              }`}
            >
              🛡️ SHIELD {shieldActive ? "ON" : powerups.shield ? "1x" : "USED"}
            </button>
          </div>
        </div>
      )}

      {spectator ? (
        <p className={`${EYEBROW} text-center text-cyan`}>Spectating. You can react, but not guess.</p>
      ) : (
        !hasGuessed && (
          <p className={`${EYEBROW} text-center`}>
            {isArtist ? "Pick the artist" : "Pick the track"} — keys 1-{state.options.length}
          </p>
        )
      )}

      <ReactionBar onReact={onReact} />
    </div>
  );
}

// ---------- Audio Spectrum Visualizer ----------
function SpectrumVisualizer({ active }) {
  const bars = [16, 28, 45, 68, 85, 95, 75, 60, 48, 70, 90, 80, 55, 35, 20, 30, 65, 82, 60, 40];

  return (
    <div className="flex h-7 items-end justify-between gap-1 border border-rule/50 bg-void px-3 py-1">
      {bars.map((maxH, idx) => (
        <div
          key={idx}
          className={`w-full transition-all duration-150 ${
            active ? "bg-good" : "bg-rule"
          }`}
          style={{
            height: active
              ? `${Math.max(15, Math.floor(Math.random() * (maxH - 10) + 15))}%`
              : "15%",
            opacity: active ? 0.9 : 0.3,
          }}
        />
      ))}
    </div>
  );
}

// ---------- CRT Scoreboard ----------
function TimeCounter({ timeRemainingMs, round, total = 10 }) {
  const seconds = useCountdown(timeRemainingMs, round);
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  const low = seconds <= 3;
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="bezel border border-rule bg-cabinet px-4 py-5">
      <div className="flex items-center justify-between">
        <span className={EYEBROW}>Time</span>
        <span className={EYEBROW}>{Math.round(pct)}%</span>
      </div>
      <div className={`mt-1 text-center ${low ? "animate-beat" : ""}`}>
        <span
          className={`font-console text-7xl font-bold tabular-nums leading-none ${
            low ? "phosphor-bad animate-flicker" : "phosphor"
          }`}
        >
          {mm}:{ss}
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full bg-rule">
        <div
          className={`h-full transition-[width,background-color] duration-1000 ease-linear ${
            low ? "bg-bad" : "bg-amber"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function useCountdown(timeRemainingMs, round) {
  const [seconds, setSeconds] = useState(0);
  useEffect(() => {
    const endAt = Date.now() + (timeRemainingMs ?? 0);
    const tick = () => setSeconds(Math.max(0, Math.ceil((endAt - Date.now()) / 1000)));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [timeRemainingMs, round]);
  return seconds;
}

export default Playing;
