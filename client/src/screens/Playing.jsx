// Playing: audio round, options, CRT timer, spectrum visualizer, and arcade power-ups.
import { useEffect, useRef, useState } from "react";
import { EYEBROW, BTN_GHOST, ReactionBar } from "../ui";

const QUESTION_BASE = 300;
const QUESTION_STEP = 250;
const MAX_SPEED_BONUS = 350;

const OPT_COLORS = [
  { num: "text-amber-400", sel: "border-amber-400 bg-amber-400/10 ring-amber-400", hov: "enabled:hover:border-amber-400 enabled:hover:bg-amber-400/5" },
  { num: "text-amber-300", sel: "border-amber-300 bg-amber-300/10 ring-amber-300", hov: "enabled:hover:border-amber-300 enabled:hover:bg-amber-300/5" },
  { num: "text-amber-400", sel: "border-amber-400 bg-amber-400/10 ring-amber-400", hov: "enabled:hover:border-amber-400 enabled:hover:bg-amber-400/5" },
  { num: "text-amber-300", sel: "border-amber-300 bg-amber-300/10 ring-amber-300", hov: "enabled:hover:border-amber-300 enabled:hover:bg-amber-300/5" },
];

export function Playing({
  state,
  roundMeta,
  myGuess,
  hasGuessed,
  spectator,
  onGuess,
  onReact,
  audioRef,
  fiftyFiftyResult,
  onClearFiftyFifty,
  onRequestFiftyFifty,
  onUsePowerUp,
}) {
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
  const [fiftyFiftyPending, setFiftyFiftyPending] = useState(false);

  // Apply server-returned 50:50 result
  useEffect(() => {
    if (fiftyFiftyResult && Array.isArray(fiftyFiftyResult.eliminated)) {
      setEliminatedOptions(fiftyFiftyResult.eliminated);
      setFiftyFiftyPending(false);
    }
  }, [fiftyFiftyResult]);

  useEffect(() => {
    setEliminatedOptions([]);
    setDoubleDownActive(false);
    setShieldActive(false);
    setFiftyFiftyPending(false);
    if (onClearFiftyFifty) onClearFiftyFifty();
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

  // Keyboard navigation 1-4
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

  const useFiftyFifty = () => {
    if (!powerups.fiftyFifty || locked || fiftyFiftyPending || state.options.length < 3) return;
    setPowerups((p) => ({ ...p, fiftyFifty: false }));
    setFiftyFiftyPending(true);
    if (onUsePowerUp) onUsePowerUp("fiftyFifty");
    else if (onRequestFiftyFifty) onRequestFiftyFifty();
  };

  const useDoubleDown = () => {
    if (!powerups.doubleDown || locked || doubleDownActive) return;
    setPowerups((p) => ({ ...p, doubleDown: false }));
    setDoubleDownActive(true);
    if (onUsePowerUp) onUsePowerUp("doubleDown");
  };

  const useShield = () => {
    if (!powerups.shield || locked || shieldActive) return;
    setPowerups((p) => ({ ...p, shield: false }));
    setShieldActive(true);
    if (onUsePowerUp) onUsePowerUp("shield");
  };

  const questionValue =
    (roundMeta?.questionValue ?? QUESTION_BASE + (state.round - 1) * QUESTION_STEP) *
    (doubleDownActive ? 2 : 1);
  const maxSpeedBonus = (roundMeta?.maxSpeedBonus ?? MAX_SPEED_BONUS) * (doubleDownActive ? 2 : 1);
  const isArtist = state.mode === "ARTIST";
  const roundSeconds = Math.round((state.roundMs ?? 10000) / 1000);

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex items-center justify-between">
        <span className={EYEBROW}>
          {isArtist ? "Name the artist" : "Name the track"}
          {state.clip === "INTRO" ? " · intro" : ""}
          {doubleDownActive ? " · 🔥 2X DOUBLE" : ""}
          {shieldActive ? " · 🛡️ SHIELD" : ""}
        </span>
        <span className="font-console text-xs font-semibold uppercase tracking-[0.16em] text-neutral-300">
          QV <span className="text-amber-400 font-bold drop-shadow-[0_0_8px_rgba(245,166,35,0.6)]">{questionValue}</span> · Speed ≤{maxSpeedBonus}
        </span>
      </div>

      {/* Bento Scoreboard & Equalizer Visualizer */}
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
          className="w-full rounded-xl border border-[#f5a623] bg-[#f5a623]/10 px-5 py-3 font-geist text-sm font-semibold uppercase tracking-wider text-[#f5a623] transition-colors hover:bg-[#f5a623] hover:text-black"
        >
          Audio didn't load — Retry
        </button>
      )}

      {needsTap && (
        <button type="button" onClick={() => startRef.current()} className={`${BTN_GHOST} w-full`}>
          ▶ Tap to Play Audio Clip
        </button>
      )}

      {/* Primary 4 Arcade Options Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {state.options?.map((opt, i) => {
          const selected = myGuess === opt;
          const isEliminated = eliminatedOptions.includes(opt);
          const dimmed = hasGuessed && !selected;
          const c = OPT_COLORS[i % OPT_COLORS.length];

          return (
            <div key={opt} className="relative">
              <button
                type="button"
                onClick={() => onGuess(opt)}
                disabled={locked || isEliminated}
                aria-label={`Option ${i + 1}: ${opt}`}
                className={[
                  "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left font-geist text-sm tracking-[-0.2px] text-white font-medium",
                  "transition-all enabled:active:scale-[.98] cursor-pointer shadow-lg",
                  selected
                    ? `ring-2 ${c.sel} bg-white/15 text-white font-bold animate-lockin shadow-[0_0_25px_rgba(245,166,35,0.3)]`
                    : isEliminated
                    ? "border-white/5 bg-black/40 line-through text-dim/30 pointer-events-none"
                    : doubleDownActive
                    ? `border-amber-400/60 bg-amber-400/10 hover:bg-amber-400/20 hover:border-amber-300 shadow-[0_0_20px_rgba(245,166,35,0.2)] ${c.hov}`
                    : `border-white/15 bg-white/[0.05] backdrop-blur-xl hover:border-amber-400/60 hover:bg-white/[0.09] hover:shadow-[0_0_20px_rgba(245,166,35,0.18)] ${c.hov}`,
                  dimmed ? "pointer-events-none opacity-30" : "",
                  "disabled:cursor-not-allowed",
                ].join(" ")}
              >
                <span className="flex items-center gap-3.5 min-w-0">
                  <span className={`grid h-7 w-7 place-items-center rounded-lg border border-white/20 bg-black/70 font-console text-xs font-bold ${c.num}`}>
                    {i + 1}
                  </span>
                  <span className="min-w-0 truncate">{opt}</span>
                </span>
                {isEliminated && (
                  <span className="font-console text-[10px] text-[#ee0000] font-semibold uppercase">50:50 OUT</span>
                )}
              </button>
              {hasGuessed && selected && (
                <p className={`mt-1 animate-rise font-console text-[11px] font-semibold uppercase tracking-[0.16em] ${c.num}`}>
                  Locked In {doubleDownActive ? "★ 2X MULTIPLIER" : ""}
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Arcade Power-Ups Bar */}
      {!locked && !spectator && (
        <div className="rounded-xl border border-white/10 bg-[#121218]/80 p-3.5 space-y-2">
          <p className={EYEBROW}>Match Modifiers</p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={useFiftyFifty}
              disabled={!powerups.fiftyFifty || locked || state.options.length < 3}
              className={`p-2.5 rounded-lg border text-center font-geist text-xs font-semibold uppercase transition-all ${
                powerups.fiftyFifty
                  ? "border-[#f5a623]/50 text-[#f5a623] bg-[#f5a623]/5 hover:bg-[#f5a623] hover:text-black active:scale-95 shadow-sm"
                  : "border-white/5 text-dim/30 pointer-events-none"
              }`}
            >
              💣 50:50 {powerups.fiftyFifty ? "1x" : "USED"}
            </button>
            <button
              type="button"
              onClick={useDoubleDown}
              disabled={!powerups.doubleDown || locked || doubleDownActive}
              className={`p-2.5 rounded-lg border text-center font-geist text-xs font-semibold uppercase transition-all ${
                doubleDownActive
                  ? "border-amber-400 bg-amber-400 text-black font-bold shadow-md"
                  : powerups.doubleDown
                  ? "border-amber-400/50 text-amber-400 bg-amber-400/5 hover:bg-amber-400 hover:text-black active:scale-95 shadow-sm"
                  : "border-white/5 text-dim/30 pointer-events-none"
              }`}
            >
              ⚡ 2X BET {doubleDownActive ? "ACTIVE" : powerups.doubleDown ? "1x" : "USED"}
            </button>
            <button
              type="button"
              onClick={useShield}
              disabled={!powerups.shield || locked || shieldActive}
              className={`p-2.5 rounded-lg border text-center font-geist text-xs font-semibold uppercase transition-all ${
                shieldActive
                  ? "border-amber-400 bg-amber-400 text-black font-bold shadow-md"
                  : powerups.shield
                  ? "border-amber-400/50 text-amber-400 bg-amber-400/5 hover:bg-amber-400 hover:text-black active:scale-95 shadow-sm"
                  : "border-white/5 text-dim/30 pointer-events-none"
              }`}
            >
              🛡️ SHIELD {shieldActive ? "ON" : powerups.shield ? "1x" : "USED"}
            </button>
          </div>
        </div>
      )}

      {spectator ? (
        <p className={`${EYEBROW} text-center text-amber-400`}>Spectating Match. React below.</p>
      ) : (
        !hasGuessed && (
          <p className={`${EYEBROW} text-center`}>
            {isArtist ? "Select the artist" : "Select the track"} — keys 1-{state.options.length}
          </p>
        )
      )}

      <ReactionBar onReact={onReact} />
    </div>
  );
}

// ---------- Spectrum Visualizer (60fps Real-Time Animated Wave) ----------
function SpectrumVisualizer({ active }) {
  const [heights, setHeights] = useState(() => Array(24).fill(15));

  useEffect(() => {
    if (!active) {
      setHeights(Array(24).fill(15));
      return;
    }
    let animId;
    let phase = 0;
    const baseProfile = [20, 35, 55, 75, 90, 100, 85, 70, 60, 80, 95, 90, 75, 60, 45, 65, 85, 70, 50, 35, 25, 40, 30, 20];

    const loop = () => {
      phase += 0.12;
      setHeights(
        baseProfile.map((maxH, idx) => {
          const wave1 = Math.sin(phase + idx * 0.45);
          const wave2 = Math.cos(phase * 1.3 - idx * 0.3);
          const factor = Math.max(0.18, (wave1 + wave2 + 2) / 4);
          return Math.max(12, Math.round(maxH * factor));
        })
      );
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animId);
  }, [active]);

  return (
    <div className="flex h-10 items-end justify-between gap-1 rounded-xl border border-white/10 bg-[#0d0d14]/80 px-4 py-2 backdrop-blur-md shadow-[inset_0_0_20px_rgba(0,0,0,0.8)]">
      {heights.map((h, idx) => (
        <div
          key={idx}
          className={`w-full rounded-sm transition-[height] duration-75 ${
            active
              ? "bg-gradient-to-t from-[#f5a623] to-[#ffb84d] shadow-[0_0_8px_rgba(245,166,35,0.4)]"
              : "bg-white/10"
          }`}
          style={{
            height: `${h}%`,
            opacity: active ? 0.95 : 0.2,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Time Counter Scoreboard ----------
function TimeCounter({ timeRemainingMs, round, total = 10 }) {
  const seconds = useCountdown(timeRemainingMs, round);
  const pct = Math.max(0, Math.min(100, (seconds / total) * 100));
  const low = seconds <= 3;
  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <div className="rounded-2xl border border-white/10 bg-[#121218]/90 p-5 backdrop-blur-xl shadow-2xl">
      <div className="flex items-center justify-between">
        <span className={EYEBROW}>Remaining Time</span>
        <span className="font-console text-xs font-semibold text-dim">{Math.round(pct)}%</span>
      </div>
      <div className={`mt-2 text-center ${low ? "animate-beat" : ""}`}>
        <span
          className={`font-geist text-7xl font-extrabold tracking-tight tabular-nums leading-none ${
            low ? "text-[#ee0000] drop-shadow-[0_0_15px_rgba(238,0,0,0.6)]" : "text-white"
          }`}
        >
          {mm}:{ss}
        </span>
      </div>
      <div className="mt-4 h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
        <div
          className={`h-full transition-[width,background-color] duration-1000 ease-linear ${
            low ? "bg-[#ee0000]" : "bg-amber-400"
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
