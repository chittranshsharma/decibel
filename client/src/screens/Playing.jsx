// Playing: audio round, options, CRT timer, spectrum visualizer, and arcade power-ups.
import { useEffect, useRef, useState } from "react";
import { EYEBROW, BTN_GHOST, ReactionBar } from "../ui";

const QUESTION_BASE = 300;
const QUESTION_STEP = 250;
const MAX_SPEED_BONUS = 350;

const OPT_COLORS = [
  { num: "text-[#00dfd8]", sel: "border-[#00dfd8] bg-[#00dfd8]/10 ring-[#00dfd8]", hov: "enabled:hover:border-[#00dfd8] enabled:hover:bg-[#00dfd8]/5" },
  { num: "text-[#ff0080]", sel: "border-[#ff0080] bg-[#ff0080]/10 ring-[#ff0080]", hov: "enabled:hover:border-[#ff0080] enabled:hover:bg-[#ff0080]/5" },
  { num: "text-[#50e3c2]", sel: "border-[#50e3c2] bg-[#50e3c2]/10 ring-[#50e3c2]", hov: "enabled:hover:border-[#50e3c2] enabled:hover:bg-[#50e3c2]/5" },
  { num: "text-[#f9cb28]", sel: "border-[#f9cb28] bg-[#f9cb28]/10 ring-[#f9cb28]", hov: "enabled:hover:border-[#f9cb28] enabled:hover:bg-[#f9cb28]/5" },
];

export function Playing({ state, roundMeta, myGuess, hasGuessed, spectator, onGuess, onReact, audioRef, fiftyFiftyResult, onClearFiftyFifty, onRequestFiftyFifty }) {
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
    // Ask server to pick which options to eliminate — server never includes the correct answer
    if (onRequestFiftyFifty) onRequestFiftyFifty();
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
    <div className="space-y-6 animate-rise">
      <div className="flex items-center justify-between">
        <span className={EYEBROW}>
          {isArtist ? "Name the artist" : "Name the track"}
          {state.clip === "INTRO" ? " · intro" : ""}
          {doubleDownActive ? " · 🔥 2X DOUBLE" : ""}
          {shieldActive ? " · 🛡️ SHIELD" : ""}
        </span>
        <span className="font-console text-xs font-semibold uppercase tracking-[0.16em] text-dim">
          QV <span className="text-[#50e3c2] font-bold">{questionValue}</span> · Speed ≤{maxSpeedBonus}
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

      {/* Bento Options Grid */}
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
                  "flex w-full items-center justify-between rounded-xl border px-4 py-4 text-left font-geist text-sm tracking-[-0.2px] text-bone",
                  "transition-all enabled:active:scale-[.98]",
                  selected
                    ? `ring-2 ${c.sel} bg-white/10 text-white font-semibold animate-lockin`
                    : isEliminated
                    ? "border-white/5 bg-black/40 line-through text-dim/30 pointer-events-none"
                    : doubleDownActive
                    ? `border-[#ff0080]/60 bg-[#ff0080]/5 hover:bg-[#ff0080]/15 ${c.hov}`
                    : `border-white/5 bg-white/[0.02] backdrop-blur-md ${c.hov}`,
                  dimmed ? "pointer-events-none opacity-30" : "",
                  "disabled:cursor-not-allowed",
                ].join(" ")}
              >
                <span className="flex items-center gap-3.5 min-w-0">
                  <span className={`grid h-6 w-6 place-items-center rounded-md border border-white/10 bg-black/60 font-console text-xs font-bold ${c.num}`}>
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
                  ? "border-[#ff0080] bg-[#ff0080] text-black font-bold animate-pulse"
                  : powerups.doubleDown
                  ? "border-[#ff0080]/50 text-[#ff0080] bg-[#ff0080]/5 hover:bg-[#ff0080] hover:text-black active:scale-95 shadow-sm"
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
                  ? "border-[#50e3c2] bg-[#50e3c2] text-black font-bold"
                  : powerups.shield
                  ? "border-[#50e3c2]/50 text-[#50e3c2] bg-[#50e3c2]/5 hover:bg-[#50e3c2] hover:text-black active:scale-95 shadow-sm"
                  : "border-white/5 text-dim/30 pointer-events-none"
              }`}
            >
              🛡️ SHIELD {shieldActive ? "ON" : powerups.shield ? "1x" : "USED"}
            </button>
          </div>
        </div>
      )}

      {spectator ? (
        <p className={`${EYEBROW} text-center text-[#00dfd8]`}>Spectating Match. React below.</p>
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

// ---------- Spectrum Visualizer ----------
function SpectrumVisualizer({ active }) {
  const bars = [16, 28, 45, 68, 85, 95, 75, 60, 48, 70, 90, 80, 55, 35, 20, 30, 65, 82, 60, 40];

  return (
    <div className="flex h-8 items-end justify-between gap-1 rounded-lg border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
      {bars.map((maxH, idx) => (
        <div
          key={idx}
          className={`w-full rounded-sm transition-all duration-150 ${
            active ? "bg-[#50e3c2]" : "bg-white/10"
          }`}
          style={{
            height: active
              ? `${Math.max(15, Math.floor(Math.random() * (maxH - 10) + 15))}%`
              : "15%",
            opacity: active ? 0.95 : 0.25,
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
            low ? "bg-[#ee0000]" : "bg-[#50e3c2]"
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
