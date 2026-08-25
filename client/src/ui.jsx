// ui.jsx — Jam & Linear inspired design system tokens and reusable components.
import { useEffect, useRef, useState } from "react";
import sound from "./sound";

// ---- Shared class fragments ----
export const EYEBROW = "font-console text-[11px] uppercase tracking-[0.18em] text-dim font-medium";
export const PANEL = "bento-card";

// Warm Arcade Gold / Amber CTA Button (Glossy + Glassy)
export const BTN_AMBER =
  "relative bg-gradient-to-r from-[#f5a623] to-[#ffb84d] px-6 py-3 font-geist font-bold text-sm rounded-xl text-black " +
  "border border-[#f5a623]/40 backdrop-blur-md " +
  "shadow-[0_0_20px_rgba(245,166,35,0.25)] hover:shadow-[0_0_32px_rgba(245,166,35,0.45)] " +
  "transition-all duration-200 hover:brightness-105 active:scale-[.98] " +
  "focus:outline-none focus:ring-2 focus:ring-[#f5a623] focus:ring-offset-2 focus:ring-offset-black " +
  "disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-dim disabled:shadow-none disabled:transform-none";

// Dark Glass 8px Rounded Button (Glossy + Glassy)
export const BTN_GHOST =
  "border border-white/10 bg-white/[0.03] backdrop-blur-lg px-4 py-2.5 font-geist font-semibold text-sm text-bone rounded-xl " +
  "shadow-[0_4px_24px_rgba(0,0,0,0.5)] " +
  "transition-all duration-200 hover:border-white/25 hover:bg-white/[0.08] active:scale-[.97] " +
  "focus:outline-none focus:ring-2 focus:ring-white/20 disabled:cursor-not-allowed disabled:opacity-40";

// Reaction call-outs
const REACTION_TOKENS = ["GG", "WOW", "!!", "??", "★", "♥"];

export function useCountUp(target, duration = 600) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    const n = Number(target) || 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setVal(n);
      return;
    }
    let raf;
    const t0 = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - t0) / duration);
      setVal(Math.round(n * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

// ---------- Leaderboard ----------
export function Leaderboard({ rows, myId, title }) {
  return (
    <div>
      {title && <p className={EYEBROW}>{title}</p>}
      <ol className={`mt-3 ${PANEL} divide-y divide-white/5 overflow-hidden`}>
        {rows.map((r, i) => {
          const isMe = myId && r.id === myId;
          const top = i === 0;
          return (
            <li
              key={r.id ?? r.name ?? i}
              className={`flex items-center justify-between px-5 py-3.5 transition-colors ${
                isMe ? "bg-[#50e3c2]/5" : ""
              }`}
            >
              <span className="flex items-center gap-3">
                <span
                  className={`w-6 font-console text-xs font-semibold ${
                    top ? "text-[#50e3c2]" : "text-dim"
                  }`}
                >
                  {String(r.rank ?? i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`font-geist font-medium text-sm tracking-[-0.2px] ${
                    top ? "text-white font-semibold" : "text-dim"
                  }`}
                >
                  {r.name}
                </span>
              </span>
              <span
                className={`font-console text-sm font-semibold tabular-nums ${
                  top ? "text-[#50e3c2]" : "text-dim"
                }`}
              >
                {r.score}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

// Avatar
export function Avatar({ name, src, size = 28 }) {
  const [broken, setBroken] = useState(false);
  const initial = ((name || "?").trim().charAt(0) || "?").toUpperCase();
  const px = `${size}px`;
  if (src && !broken) {
    return (
      <img
        src={src}
        alt=""
        onError={() => setBroken(true)}
        style={{ width: px, height: px }}
        className="shrink-0 rounded-full border border-white/10 object-cover"
      />
    );
  }
  return (
    <span
      aria-hidden="true"
      style={{ width: px, height: px }}
      className="grid shrink-0 place-items-center rounded-full border border-white/10 bg-white/5 font-console text-xs text-bone"
    >
      {initial}
    </span>
  );
}

// In-game reaction bar
export function ReactionBar({ onReact }) {
  return (
    <div
      role="toolbar"
      aria-label="Reactions"
      className="flex flex-wrap items-center justify-center gap-2 pt-2"
    >
      {REACTION_TOKENS.map((token) => (
        <button
          type="button"
          key={token}
          onClick={() => {
            sound.play("react");
            onReact(token);
          }}
          aria-label={`React ${token}`}
          className="flex h-9 min-w-[2.5rem] items-center justify-center rounded-full border border-white/10 bg-[#121218]/90 px-3 font-geist text-xs font-semibold uppercase tracking-wider text-bone shadow-sm transition-all hover:border-[#50e3c2] hover:text-[#50e3c2] hover:shadow-[0_0_15px_rgba(80,227,194,0.3)] active:scale-95"
        >
          {token}
        </button>
      ))}
    </div>
  );
}

// Chat Component
export function Chat({ messages, onChat, myId, title = "Lobby Chat" }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = (e) => {
    e.preventDefault();
    const t = text.trim();
    if (!t) return;
    onChat(t);
    setText("");
  };

  return (
    <div className="space-y-3">
      <p className={EYEBROW}>{title}</p>
      <div className={`${PANEL} flex flex-col p-4`}>
        <div className="max-h-44 space-y-2 overflow-y-auto pr-1">
          {messages.length === 0 ? (
            <p className="font-geist text-xs text-dim italic">No messages yet...</p>
          ) : (
            messages.map((m, i) => {
              const isMe = m.playerId === myId;
              return (
                <div key={i} className="flex items-start gap-2 font-geist text-xs">
                  <span className={`font-semibold ${isMe ? "text-[#50e3c2]" : "text-[#7928ca]"}`}>
                    {m.playerName}:
                  </span>
                  <span className="text-bone">{m.text}</span>
                </div>
              );
            })
          )}
          <div ref={endRef} />
        </div>
        <form onSubmit={send} className="mt-3 flex gap-2 pt-2 border-t border-white/5">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={140}
            placeholder="Type a message..."
            className="flex-1 rounded-md border border-white/10 bg-black/60 px-3 py-2 font-geist text-xs text-bone placeholder:text-dim focus:border-[#50e3c2] focus:outline-none"
          />
          <button
            type="submit"
            disabled={!text.trim()}
            className="rounded-md bg-[#50e3c2] px-4 py-2 font-geist text-xs font-semibold text-black transition-opacity disabled:opacity-40"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

// Reaction Overlays
export function ReactionOverlay({ reactions }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {reactions.map((r) => (
        <div
          key={r.key ?? `${r.id}-${r.ts}`}
          className="absolute transform -translate-x-1/2 -translate-y-1/2 animate-floatup"
          style={{ left: `${r.x ?? 50}%`, top: `${r.y ?? 50}%` }}
        >
          <div className="rounded-2xl border border-[#50e3c2]/40 bg-[#0d0d14]/90 px-4 py-2 shadow-[0_0_24px_rgba(80,227,194,0.4)] backdrop-blur-md">
            <span className="font-geist text-2xl font-black tracking-tight text-[#50e3c2] drop-shadow-[0_0_8px_rgba(80,227,194,0.8)]">
              {r.token}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

// Countdown Overlay — counts down from `seconds` to 0 in real-time
export function CountdownOverlay({ seconds: initialSeconds, round, worth, maxPoints }) {
  const [secs, setSecs] = useState(initialSeconds ?? 3);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const startSec = initialSeconds ?? 3;
    setSecs(startSec);
    setVisible(true);
    if (startSec > 0) {
      sound.play("count");
    }
    let remaining = startSec;
    const id = setInterval(() => {
      remaining -= 1;
      setSecs(remaining);
      if (remaining > 0) {
        sound.play("count");
      } else if (remaining === 0) {
        sound.play("go");
        clearInterval(id);
        setTimeout(() => setVisible(false), 400);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [round, initialSeconds]);

  if (!visible || secs <= 0) return null;


  const totalPoints = (worth ?? 0) + (maxPoints ?? 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md animate-rise">
      <div className="text-center space-y-3">
        <p className="font-console text-xs uppercase tracking-[0.25em] text-amber-400">
          ROUND {round} STARTING
        </p>
        <p
          key={secs}
          className="font-geist text-8xl font-bold tracking-tight text-white animate-digitpop"
        >
          {Math.max(1, secs)}
        </p>
        <p className="font-geist text-sm text-dim">
          Worth up to <span className="text-amber-400 font-semibold">{totalPoints}</span> pts
        </p>
      </div>
    </div>
  );
}

export function LoadingOverlay({ message }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
      <div className="text-center space-y-3">
        <div className="mx-auto h-8 w-8 rounded-full border-2 border-white/20 border-t-amber-400 animate-spin" />
        <p className="font-geist text-sm text-bone">{message || "Loading..."}</p>
      </div>
    </div>
  );
}

export function ErrorBar({ message }) {
  return (
    <div className="fixed inset-x-0 top-0 z-50 bg-[#ee0000] px-4 py-2.5 text-center font-geist text-xs font-semibold text-white shadow-lg">
      {message}
    </div>
  );
}

export function Toast({ message }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 rounded-lg border border-white/10 bg-[#121218]/95 px-4 py-3 font-geist text-xs text-bone shadow-2xl backdrop-blur-md animate-rise">
      {message}
    </div>
  );
}

export function Centered({ eyebrow, title, subtitle }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center space-y-4 py-20">
      <div className="mx-auto h-10 w-10 rounded-full border-2 border-white/10 border-t-[#50e3c2] animate-spin" />
      {eyebrow && <p className={`${EYEBROW} text-[#50e3c2]`}>{eyebrow}</p>}
      <h2 className="font-geist text-2xl font-bold tracking-tight text-white">{title}</h2>
      {subtitle && <p className="font-geist text-xs text-slate-400 max-w-xs">{subtitle}</p>}
    </div>
  );
}
