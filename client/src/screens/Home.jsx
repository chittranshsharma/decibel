// Home hub, profile, and side menu — Vercel Geist Design System + Arcade Accents.
import { useEffect, useRef, useState } from "react";
import { EYEBROW, PANEL } from "../ui";

export const GAMES = [
  { key: "musicquiz", glyph: "♬", title: "Music Quiz", sub: "Name the track from a 10s snippet", status: "play", clip: "RANDOM", accent: "text-[#ff0080]" },
  { key: "heardle", glyph: "▶", title: "Heardle", sub: "Guess the song from its intro", status: "play", clip: "INTRO", accent: "text-[#3df07a]" },
  { key: "create", glyph: "+", title: "Create Room", sub: "Private multiplayer room for friends", status: "play", clip: "RANDOM", accent: "text-[#0070f3]" },
  { key: "harmonies", glyph: "⌘", title: "Harmonies", sub: "Music connections 4x4 puzzle", status: "play", accent: "text-[#00dfd8]" },
  { key: "wordzic", glyph: "▦", title: "Wordzic", sub: "Guess the 5-letter music term", status: "play", accent: "text-[#f9cb28]" },
  { key: "lyricles", glyph: "❝", title: "Lyricles", sub: "Guess the song from its lyrics", status: "play", accent: "text-[#7928ca]" },
  { key: "crosszic", glyph: "✚", title: "Crosszic", sub: "Interactive 5x5 music crossword", status: "play", accent: "text-[#3df07a]" },
];

// ---------- Home hub (landing) ----------
export function Home({ games, stats, onOpen, onProfile }) {
  return (
    <div className="relative animate-rise space-y-12">
      {/* Vercel Multi-Stop Hero Mesh Gradient */}
      <div className="vercel-mesh-bg" />

      {/* Hero Section */}
      <div className="relative z-10 space-y-5 pt-4 text-left">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 font-console text-[11px] font-medium tracking-[0.14em] text-dim backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-[#00dfd8] animate-pulse" />
            LIVE // 78,890 TRACKS
          </span>
        </div>

        <h1 className="font-geist text-5xl font-semibold tracking-[-2.4px] text-white leading-[1.04] sm:text-6xl">
          Guess the track.
          <br />
          <span className="text-gradient-full">Beat your squad.</span>
        </h1>

        <p className="max-w-lg font-geist text-base font-normal leading-relaxed text-[#888888]">
          The zero-latency, server-authoritative multiplayer audio engine. 11 curated genres, custom Spotify playlists, and daily music puzzles.
        </p>
      </div>

      {/* Profile Bar Card */}
      <button
        type="button"
        onClick={onProfile}
        className={`${PANEL} flex w-full items-center justify-between px-5 py-4 text-left`}
      >
        <span className="flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-[#f5a623]" />
          <span className={EYEBROW}>Player Profile</span>
        </span>
        <span className="font-console text-xs font-semibold tabular-nums text-bone">
          {stats.games} MATCHES · {stats.wins} WINS · BEST {stats.bestScore}
        </span>
      </button>

      {/* Game Selection Matrix */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <p className={EYEBROW}>Select Game Mode</p>
          <span className="font-console text-[11px] text-dim uppercase">7 Modes Ready</span>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {games.map((g) => (
            <GameCard key={g.key} game={g} onOpen={onOpen} />
          ))}
        </div>
      </div>

      <WhyDecibel />
      <Faq />
      <SiteFooter />
    </div>
  );
}

function GameCard({ game, onOpen }) {
  const playable = game.status === "play";
  return (
    <button
      type="button"
      onClick={() => playable && onOpen(game)}
      disabled={!playable}
      className={`${PANEL} flex items-start gap-4 p-4 text-left transition-all ${
        playable ? "hover:border-white/20 active:scale-[.98]" : "opacity-50"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/10 bg-black font-geist text-lg font-semibold ${
          game.accent || "text-white"
        }`}
      >
        {game.glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between">
          <span className="font-geist text-base font-medium tracking-[-0.4px] text-white">
            {game.title}
          </span>
          <span className="font-console text-[11px] uppercase tracking-wider text-dim hover:text-white">
            Play →
          </span>
        </span>
        <span className="mt-1 block font-geist text-xs leading-relaxed text-[#888888]">
          {game.sub}
        </span>
      </span>
    </button>
  );
}

const WHY_ITEMS = [
  { t: "Massive 78k+ Catalog", d: "11 meticulously curated genres, updated live via Apple Search CDN & Supabase PostgreSQL." },
  { t: "Sub-2ms Database Queries", d: "GIN array containment indexes & B-Tree point lookups for instantaneous sampling." },
  { t: "Keyless Spotify Import", d: "Extract public Spotify playlists and stream high-bitrate preview snippets in real-time." },
  { t: "Vibe Tier Selector", d: "Toggle between mainstream billboard anthems and deep underground crate cuts." },
];

function WhyDecibel() {
  return (
    <div className="space-y-3">
      <p className={EYEBROW}>System Architecture</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {WHY_ITEMS.map((i) => (
          <div key={i.t} className={`${PANEL} p-5`}>
            <p className="font-geist text-sm font-semibold tracking-[-0.3px] text-white">{i.t}</p>
            <p className="mt-1.5 font-geist text-xs leading-relaxed text-[#888888]">{i.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "How does the Spotify playlist scraper work?",
    a: "Decibel uses a zero-dependency headless resolver to extract public Spotify embed payloads and match tracks against high-quality 30-second audio stream CDN endpoints.",
  },
  {
    q: "What music genres are included in the engine?",
    a: "11 scene rosters: Modern Hip-Hop, Old School Rap, Trap, Hyperpop, Desi Hip Hop, Rock & Alt, Indie, Bedroom Pop, R&B & Soul, Pop & Dance, and Desi Indie.",
  },
  {
    q: "How does scoring and velocity calculation work?",
    a: "Scores scale with round depth (300 to 2550+ pts), speed velocity bonus (up to +350 pts based on millisecond latency), and consecutive answer streak multipliers.",
  },
  {
    q: "Are accounts or downloads required?",
    a: "No downloads or authentication barriers. Play directly in any modern desktop or mobile browser as a progressive web app.",
  },
];

function Faq() {
  const [open, setOpen] = useState(-1);
  return (
    <div className="space-y-3">
      <p className={EYEBROW}>Frequently Asked Questions</p>
      <div className="space-y-2">
        {FAQ_ITEMS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={`${PANEL} overflow-hidden`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-4 text-left font-geist text-sm font-medium tracking-[-0.2px] text-bone transition-colors hover:text-white"
              >
                <span>{f.q}</span>
                <span className="shrink-0 font-console text-xs text-dim" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p className="border-t border-white/10 bg-black/40 p-4 font-geist text-xs leading-relaxed text-[#888888]">
                  {f.a}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="border-t border-white/10 pt-8 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-geist text-lg font-semibold tracking-[-0.5px] text-white">
          DECIBEL<span className="text-[#00dfd8]">.</span>
        </span>
        <span className={EYEBROW}>High-Frequency Real-Time Music Engine</span>
      </div>
      <p className="font-geist text-xs leading-relaxed text-dim">
        Engineered with React 18, Vite, Socket.IO, and Supabase PostgreSQL 17.
      </p>
    </footer>
  );
}

// ---------- Profile Screen ----------
export function Profile({ stats, onBack }) {
  const acc = stats.rounds > 0 ? Math.round((stats.correct / stats.rounds) * 100) : 0;
  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  const rows = [
    { k: "Matches Played", v: stats.games },
    { k: "Victories", v: `${stats.wins} (${winRate}%)` },
    { k: "High Score", v: stats.bestScore },
    { k: "Accuracy", v: `${stats.correct} / ${stats.rounds} (${acc}%)` },
  ];
  return (
    <div className="animate-rise space-y-6">
      <button
        type="button"
        onClick={onBack}
        className={`${EYEBROW} inline-flex min-h-11 items-center text-dim hover:text-white`}
      >
        ‹ Home
      </button>

      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h2 className="font-geist text-3xl font-semibold tracking-[-1px] text-white">
          Player Profile
        </h2>
        <span className="font-console text-xs text-dim uppercase">Stats Overview</span>
      </div>

      <div className={`${PANEL} p-5 space-y-4`}>
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
            <span className={EYEBROW}>{r.k}</span>
            <span className="font-console text-sm text-bone font-semibold tabular-nums">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Side Menu ----------
export function SideMenu({ games, onClose, onHome, onOpen, onProfile }) {
  const panelRef = useRef(null);
  const playable = games.filter((g) => g.status === "play");

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[70] flex" role="dialog" aria-modal="true" aria-label="Menu">
      <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <nav
        ref={panelRef}
        className="animate-rise relative z-10 w-72 max-w-[80vw] overflow-y-auto border-r border-white/10 bg-[#0d0d10]/95 p-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="font-geist text-lg font-semibold tracking-[-0.5px] text-white">
            DECIBEL<span className="text-[#00dfd8]">.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-geist text-xl text-dim transition-colors hover:text-white"
          >
            ✕
          </button>
        </div>

        <p className={`${EYEBROW} mt-6`}>Game Modes</p>
        <ul className="mt-3 space-y-1">
          {playable.map((g) => (
            <li key={g.key}>
              <button
                type="button"
                onClick={() => onOpen(g)}
                className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-geist text-sm text-bone transition-all hover:bg-white/5 hover:text-white rounded-md"
              >
                <span className={`w-5 text-center font-bold ${g.accent || "text-white"}`}>
                  {g.glyph}
                </span>
                {g.title}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-white/10 pt-4 space-y-2">
          <button
            type="button"
            onClick={onHome}
            className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-geist text-sm text-dim hover:text-white rounded-md"
          >
            ⌂ Home Hub
          </button>
          <button
            type="button"
            onClick={onProfile}
            className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-geist text-sm text-dim hover:text-white rounded-md"
          >
            ★ Player Profile
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Home;
