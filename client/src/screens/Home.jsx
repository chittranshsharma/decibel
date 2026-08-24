// Home hub, profile, and side menu — landing surfaces outside a room.
import { useEffect, useRef, useState } from "react";
import { EYEBROW, PANEL } from "../ui";

export const GAMES = [
  { key: "musicquiz", glyph: "♬", title: "Music Quiz", sub: "Name the track from a 10s snippet", status: "play", clip: "RANDOM", color: "text-pink border-pink/40" },
  { key: "heardle", glyph: "▶", title: "Heardle", sub: "Guess the song from its intro", status: "play", clip: "INTRO", color: "text-good border-good/40" },
  { key: "create", glyph: "+", title: "Create Room", sub: "Private room — challenge your friends", status: "play", clip: "RANDOM", color: "text-amber border-amber/40" },
  { key: "harmonies", glyph: "⌘", title: "Harmonies", sub: "Music connections 4x4 puzzle", status: "play", color: "text-cyan border-cyan/40" },
  { key: "wordzic", glyph: "▦", title: "Wordzic", sub: "Guess the 5-letter music word", status: "play", color: "text-yellow border-yellow/40" },
  { key: "lyricles", glyph: "❝", title: "Lyricles", sub: "Guess the song from its lyrics", status: "play", color: "text-purple border-purple/40" },
  { key: "crosszic", glyph: "✚", title: "Crosszic", sub: "Interactive 5x5 music crossword", status: "play", color: "text-good border-good/40" },
];

// ---------- Home hub (landing) ----------
export function Home({ games, stats, onOpen, onProfile }) {
  return (
    <div className="animate-rise space-y-10">
      {/* Hero Section */}
      <div className="relative space-y-4">
        <div className="flex items-center gap-2">
          <span className="font-coin text-xs tracking-widest text-pink animate-pulse">● INSERT COIN</span>
          <span className="border border-good/40 bg-good/10 px-2 py-0.5 font-console text-[10px] uppercase tracking-widest text-good">
            LIVE // 78,890 SONGS
          </span>
        </div>
        
        <h2 className="font-marquee text-4xl font-black uppercase leading-[1.05] tracking-tight text-bone sm:text-5xl">
          GUESS THE TRACK.
          <br />
          <span className="phosphor-pink">BEAT YOUR SQUAD.</span>
        </h2>
        
        <p className="font-console text-xs leading-relaxed text-dim sm:text-sm">
          High-frequency real-time multiplayer music engine. 11 curated genres, custom Spotify playlists, and daily music puzzles.
        </p>
      </div>

      {/* Profile Bar Card */}
      <button
        type="button"
        onClick={onProfile}
        className={`${PANEL} glass-panel-hover flex w-full items-center justify-between px-5 py-4 text-left border border-rule/90`}
      >
        <span className="flex items-center gap-2.5">
          <span className="h-2 w-2 rounded-full bg-amber animate-ping" />
          <span className={EYEBROW}>Player Profile</span>
        </span>
        <span className="font-console text-xs tabular-nums text-amber font-bold">
          {stats.games} MATCHES · {stats.wins} WINS · BEST {stats.bestScore}
        </span>
      </button>

      {/* Game Selection Matrix */}
      <div>
        <div className="flex items-center justify-between pb-3">
          <p className={EYEBROW}>Select Game Mode</p>
          <span className="font-console text-[10px] uppercase text-dim tracking-wider">7 Modes Active</span>
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
      className={`${PANEL} glass-panel-hover flex items-start gap-4 p-4 text-left border border-rule/90 transition-all ${
        playable ? "hover:border-pink enabled:active:scale-[.97]" : "opacity-60"
      }`}
    >
      <span
        className={`grid h-10 w-10 shrink-0 place-items-center border bg-void font-marquee text-xl font-bold shadow-inner ${
          game.color || "text-pink border-pink/40"
        }`}
      >
        {game.glyph}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center justify-between">
          <span className="font-console text-sm uppercase font-bold tracking-wide text-bone">
            {game.title}
          </span>
          <span className="font-console text-[10px] text-pink uppercase tracking-widest font-bold">
            ▶ Play
          </span>
        </span>
        <span className="mt-1 block font-console text-xs leading-relaxed text-dim">
          {game.sub}
        </span>
      </span>
    </button>
  );
}

const WHY_ITEMS = [
  { t: "Massive 78k+ Song Store", d: "Deep catalogs across 11 genres, updated live via Apple & Supabase." },
  { t: "Zero-Latency Real-Time", d: "Sub-2ms indexed database queries, high-frequency WebSockets." },
  { t: "Custom Spotify Import", d: "Paste any Spotify playlist link and play rounds from it instantly." },
  { t: "Mainstream & Underground", d: "Toggle between global chart-toppers and niche crate deep cuts." },
];

function WhyDecibel() {
  return (
    <div className="space-y-3">
      <p className={EYEBROW}>Why Decibel</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {WHY_ITEMS.map((i) => (
          <div key={i.t} className={`${PANEL} p-4 glass-panel-hover border border-rule/80`}>
            <p className="font-console text-xs font-bold uppercase tracking-wider text-amber">{i.t}</p>
            <p className="mt-1 font-console text-xs leading-relaxed text-dim">{i.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "How does Spotify playlist import work?",
    a: "Paste any public Spotify playlist URL into the lobby. Decibel extracts the song metadata and matches each track with a high-bitrate 30-second playable audio preview.",
  },
  {
    q: "What genres and eras are supported?",
    a: "11 genres including Modern Hip-Hop, Old School Rap, Trap, Hyperpop, Desi Hip Hop, Rock, Indie, Bedroom Pop, R&B, Pop, and Desi Indie, with decades spanning back to the 1980s.",
  },
  {
    q: "Can I play solo or with friends?",
    a: "Both! Play single-player puzzles (Harmonies, Wordzic, Lyricles, Crosszic, Heardle) or create private multiplayer rooms for up to 8 players with live scoring and speed bonuses.",
  },
  {
    q: "Is an account required?",
    a: "No downloads or accounts needed. It runs instantly in your browser as a responsive PWA.",
  },
];

function Faq() {
  const [open, setOpen] = useState(-1);
  return (
    <div className="space-y-3">
      <p className={EYEBROW}>Popular Questions</p>
      <div className="space-y-2">
        {FAQ_ITEMS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={`${PANEL} overflow-hidden border border-rule/80 transition-all`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-4 text-left font-console text-xs uppercase tracking-wide text-bone transition-colors hover:text-amber"
              >
                <span>{f.q}</span>
                <span className="shrink-0 font-console text-amber font-bold" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p className="border-t border-rule/80 bg-void/50 p-4 font-console text-xs leading-relaxed text-dim">
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
    <footer className="border-t border-rule/80 pt-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <span className="font-marquee text-xl font-black uppercase tracking-tight text-bone">
          DECIBEL<span className="text-pink">.</span>
        </span>
        <span className={EYEBROW}>HIGH-FREQUENCY AUDIO TRIVIA ENGINE</span>
      </div>
      <p className="font-console text-xs leading-relaxed text-dim">
        Multiplayer audio engine powered by Supabase PostgreSQL and Apple Search CDN.
      </p>
    </footer>
  );
}

// ---------- My profile (local stats) ----------
export function Profile({ stats, onBack }) {
  const acc = stats.rounds > 0 ? Math.round((stats.correct / stats.rounds) * 100) : 0;
  const winRate = stats.games > 0 ? Math.round((stats.wins / stats.games) * 100) : 0;
  const rows = [
    { k: "Games played", v: stats.games },
    { k: "Wins", v: `${stats.wins} · ${winRate}%` },
    { k: "Best score", v: stats.bestScore },
    { k: "Correct", v: `${stats.correct} / ${stats.rounds} · ${acc}%` },
  ];
  return (
    <div className="animate-rise space-y-6">
      <button
        type="button"
        onClick={onBack}
        className={`${EYEBROW} inline-flex min-h-11 items-center hover:text-amber`}
      >
        ‹ Home
      </button>

      <div className="flex items-center justify-between border-b border-rule pb-3">
        <h2 className="font-marquee text-3xl font-black uppercase tracking-tight text-bone">
          Player Profile
        </h2>
        <span className="font-coin text-xs text-amber">RECORD</span>
      </div>

      <div className={`${PANEL} p-5 space-y-4 border border-rule/90`}>
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between border-b border-rule/40 pb-2 last:border-0 last:pb-0">
            <span className={EYEBROW}>{r.k}</span>
            <span className="font-console text-sm text-bone font-bold tabular-nums">{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------- Side menu ----------
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
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <nav
        ref={panelRef}
        className="animate-rise relative z-10 w-72 max-w-[80vw] overflow-y-auto border-r border-rule bg-cabinet/95 p-6 backdrop-blur-md"
      >
        <div className="flex items-center justify-between border-b border-rule pb-4">
          <span className="font-marquee text-xl font-black uppercase tracking-tight text-bone">
            DECIBEL<span className="text-pink">.</span>
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="inline-flex min-h-11 min-w-11 items-center justify-center font-console text-xl text-dim transition-colors hover:text-pink"
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
                className="flex min-h-11 w-full items-center gap-3 px-2 py-2 text-left font-console text-xs uppercase tracking-wider text-bone transition-all hover:bg-void/60 hover:text-pink"
              >
                <span className={`w-5 text-center font-bold ${g.color?.split(" ")[0] || "text-pink"}`}>
                  {g.glyph}
                </span>
                {g.title}
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-8 border-t border-rule pt-4 space-y-2">
          <button
            type="button"
            onClick={onHome}
            className="flex min-h-11 w-full items-center gap-3 px-2 py-2 text-left font-console text-xs uppercase tracking-wider text-dim hover:text-bone"
          >
            ⌂ Home Hub
          </button>
          <button
            type="button"
            onClick={onProfile}
            className="flex min-h-11 w-full items-center gap-3 px-2 py-2 text-left font-console text-xs uppercase tracking-wider text-dim hover:text-amber"
          >
            ★ My Stats
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Home;
