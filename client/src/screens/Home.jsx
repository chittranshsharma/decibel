// Home hub, profile, and side menu — Jam & Linear Bento Aesthetic.
import { useEffect, useRef, useState } from "react";
import { EYEBROW, PANEL, BTN_AMBER } from "../ui";
import DriftWall from "../components/DriftWall";
import Strands from "../components/Strands";

export const GAMES = [
  { key: "musicquiz", glyph: "♬", title: "Music Quiz", sub: "Name the track from a 10s snippet", status: "play", clip: "RANDOM", gradient: "from-[#ff0080] to-[#7928ca]" },
  { key: "heardle", glyph: "▶", title: "Heardle", sub: "Guess the song from its intro", status: "play", clip: "INTRO", gradient: "from-[#50e3c2] to-[#007cf0]" },
  { key: "create", glyph: "+", title: "Create Room", sub: "Private multiplayer room for friends", status: "play", clip: "RANDOM", gradient: "from-[#0070f3] to-[#00dfd8]" },
  { key: "harmonies", glyph: "⌘", title: "Harmonies", sub: "Music connections 4x4 puzzle", status: "play", gradient: "from-[#00dfd8] to-[#50e3c2]" },
  { key: "wordzic", glyph: "▦", title: "Wordzic", sub: "Guess the 5-letter music term", status: "play", gradient: "from-[#f9cb28] to-[#ff4d4d]" },
  { key: "lyricles", glyph: "❝", title: "Lyricles", sub: "Guess the song from its lyrics", status: "play", gradient: "from-[#7928ca] to-[#ff0080]" },
  { key: "crosszic", glyph: "✚", title: "Crosszic", sub: "Interactive 5x5 music crossword", status: "play", gradient: "from-[#50e3c2] to-[#3df07a]" },
];

// ---------- Home hub (landing) ----------
export function Home({ games, stats, onOpen, onProfile }) {
  return (
    <div className="relative animate-rise space-y-12">
      {/* Background Multi-Point Aurora Spotlight */}
      <div className="jam-aurora" />

      {/* Hero Section with Ambient Strands Wave */}
      <div className="relative z-10 space-y-6 pt-4 pb-4 text-center sm:text-left overflow-hidden rounded-3xl p-6 sm:p-10 border border-white/10 bg-[#0e0e14]/70 backdrop-blur-xl shadow-2xl">
        {/* Ambient WebGL Strands glowing ribbons */}
        <div className="absolute inset-0 pointer-events-none opacity-45 mix-blend-screen overflow-hidden">
          <Strands
            colors={["#00DFD8", "#7928CA", "#FF0080", "#50E3C2"]}
            count={3}
            speed={0.45}
            amplitude={0.9}
            waviness={1.2}
            thickness={0.65}
            glow={2.8}
            intensity={0.65}
            saturation={1.4}
            opacity={0.85}
            scale={1.3}
          />
        </div>

        <div className="relative z-10 flex flex-wrap items-center justify-center sm:justify-start gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1 font-console text-[11px] font-semibold tracking-[0.14em] text-bone backdrop-blur-md shadow-sm">
            <span className="h-2 w-2 rounded-full bg-[#50e3c2] animate-ping" />
            78,890 TRACKS LIVE
          </span>
          <span className="rounded-full border border-[#7928ca]/30 bg-[#7928ca]/10 px-3 py-1 font-console text-[11px] font-semibold text-[#aaffec] uppercase tracking-wider">
            11 SCENE ROSTERS
          </span>
        </div>

        <h1 className="relative z-10 font-geist text-5xl font-extrabold tracking-[-2.4px] text-white leading-[1.04] sm:text-6xl">
          Guess the song.
          <br />
          <span className="text-gradient-jam">Beat your squad.</span>
        </h1>

        <p className="relative z-10 mx-auto sm:mx-0 max-w-lg font-geist text-base font-normal leading-relaxed text-[#8f8f8f]">
          Real-time multiplayer music trivia with zero latency. Scrape custom Spotify playlists or battle through underground crate cuts.
        </p>

        <div className="relative z-10 pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <button
            type="button"
            onClick={() => onOpen(games.find((g) => g.key === "musicquiz"))}
            className={`${BTN_AMBER} inline-flex items-center gap-2`}
          >
            <span>Play Music Quiz</span>
            <span className="text-xs">▶</span>
          </button>
          <button
            type="button"
            onClick={() => onOpen(games.find((g) => g.key === "create"))}
            className="rounded-full border border-white/15 bg-white/5 px-6 py-3.5 font-geist text-sm font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/30 active:scale-[.97]"
          >
            Create Private Room
          </button>
        </div>
      </div>

      {/* Player Profile Spotlight Card */}
      <button
        type="button"
        onClick={onProfile}
        className={`${PANEL} flex w-full items-center justify-between p-5 text-left transition-all hover:border-[#50e3c2]/40 group`}
      >
        <span className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-white/5 text-lg group-hover:scale-105 transition-transform">
            ★
          </span>
          <div>
            <p className="font-geist text-sm font-semibold text-white">Player Profile & Records</p>
            <p className="font-console text-xs text-dim">Local device performance</p>
          </div>
        </span>
        <span className="font-console text-xs font-semibold tabular-nums text-[#50e3c2]">
          {stats.games} MATCHES · {stats.wins} WINS · BEST {stats.bestScore}
        </span>
      </button>

      {/* 3D Drifting Music Crate Wall */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className={EYEBROW}>11 Curated Scene Rosters</p>
            <h3 className="font-geist text-lg font-bold text-white tracking-[-0.4px]">Interactive 3D Music Crate</h3>
          </div>
          <span className="rounded-full border border-[#50e3c2]/30 bg-[#50e3c2]/10 px-3 py-0.5 font-console text-[10px] font-semibold text-[#50e3c2] uppercase">
            Click Scene to Play
          </span>
        </div>
        <div className="relative h-[240px] sm:h-[300px] w-full overflow-hidden rounded-2xl border border-white/10 bg-black/90 shadow-2xl">
          <DriftWall
            columns={5}
            tileWidth={170}
            tileHeight={105}
            gap={14}
            tilt={14}
            turn={-12}
            depth={90}
            speed={30}
            parallax={0.5}
            lift={48}
            overlayColor="#07070a"
            onSelectGenre={(genreKey) => {
              onOpen(games.find((g) => g.key === "musicquiz"));
            }}
          />
        </div>
      </div>

      {/* Bento Grid: Game Modes Matrix */}
      <div>
        <div className="flex items-center justify-between pb-4">
          <div>
            <p className={EYEBROW}>Game Catalog</p>
            <h2 className="font-geist text-xl font-bold text-white tracking-[-0.5px]">Select Mode</h2>
          </div>
          <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 font-console text-[10px] text-dim uppercase">
            7 Playable Modes
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
          {games.map((g) => (
            <GameBentoCard key={g.key} game={g} onOpen={onOpen} />
          ))}
        </div>
      </div>

      <WhyDecibel />
      <Faq />
      <SiteFooter />
    </div>
  );
}

function GameBentoCard({ game, onOpen }) {
  const playable = game.status === "play";
  return (
    <button
      type="button"
      onClick={() => playable && onOpen(game)}
      disabled={!playable}
      className={`${PANEL} flex flex-col justify-between p-5 text-left group`}
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br ${
            game.gradient || "from-white/10 to-white/5"
          } font-geist text-xl font-bold text-white shadow-md group-hover:scale-105 transition-transform`}
        >
          {game.glyph}
        </span>
        <span className="rounded-full border border-white/10 bg-black/40 px-3 py-1 font-console text-[10px] font-semibold uppercase tracking-wider text-dim group-hover:text-white group-hover:border-white/30 transition-colors">
          Play →
        </span>
      </div>

      <div className="mt-4 space-y-1">
        <h3 className="font-geist text-base font-semibold tracking-[-0.3px] text-white group-hover:text-[#50e3c2] transition-colors">
          {game.title}
        </h3>
        <p className="font-geist text-xs leading-relaxed text-[#8f8f8f]">
          {game.sub}
        </p>
      </div>
    </button>
  );
}

const WHY_ITEMS = [
  { t: "78,890 Indexed Tracks", d: "11 scene rosters powered by Supabase PostgreSQL and Apple Search CDN." },
  { t: "<1.8ms Query Latency", d: "Optimized GIN array containment and point index lookups for instant rounds." },
  { t: "Keyless Spotify Scraper", d: "Paste any Spotify playlist URL to parse songs and stream direct 30s clips." },
  { t: "Arcade Power-Ups", d: "50:50 Eliminator, 2X Double Down Multiplier, and Streak Shields." },
];

function WhyDecibel() {
  return (
    <div className="space-y-4">
      <div>
        <p className={EYEBROW}>Engine Capabilities</p>
        <h2 className="font-geist text-xl font-bold text-white tracking-[-0.5px]">Built for Music Heads</h2>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {WHY_ITEMS.map((i) => (
          <div key={i.t} className={`${PANEL} p-5`}>
            <p className="font-geist text-sm font-semibold text-white tracking-[-0.2px]">{i.t}</p>
            <p className="mt-1.5 font-geist text-xs leading-relaxed text-[#8f8f8f]">{i.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  {
    q: "How does Spotify playlist integration work?",
    a: "Paste any public Spotify playlist URL into the lobby. Decibel extracts the song metadata without API keys and matches each track with a high-bitrate 30-second playable audio preview.",
  },
  {
    q: "What genres and eras are supported?",
    a: "11 curated scenes: Modern Hip-Hop, Old School Rap, Trap, Hyperpop, Desi Hip Hop, Rock & Alt, Indie, Bedroom Pop, R&B & Soul, Pop & Dance, and Desi Indie.",
  },
  {
    q: "Can I play solo or with friends?",
    a: "Both! Play single-player puzzles (Harmonies, Wordzic, Lyricles, Crosszic, Heardle) or create private multiplayer rooms for up to 8 players with real-time scoring and live reactions.",
  },
  {
    q: "Are downloads or accounts required?",
    a: "Zero friction. It runs instantly in any desktop or mobile browser as a modern progressive web app.",
  },
];

function Faq() {
  const [open, setOpen] = useState(-1);
  return (
    <div className="space-y-4">
      <div>
        <p className={EYEBROW}>Support & Knowledge</p>
        <h2 className="font-geist text-xl font-bold text-white tracking-[-0.5px]">Frequently Asked Questions</h2>
      </div>
      <div className="space-y-2">
        {FAQ_ITEMS.map((f, i) => {
          const isOpen = open === i;
          return (
            <div key={f.q} className={`${PANEL} overflow-hidden`}>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? -1 : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center justify-between p-4 text-left font-geist text-sm font-medium text-bone transition-colors hover:text-white"
              >
                <span>{f.q}</span>
                <span className="shrink-0 font-console text-xs text-dim" aria-hidden="true">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <p className="border-t border-white/5 bg-black/40 p-4 font-geist text-xs leading-relaxed text-[#8f8f8f]">
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
        <span className="font-geist text-lg font-bold tracking-[-0.5px] text-white">
          DECIBEL<span className="text-[#50e3c2]">.</span>
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
        <h2 className="font-geist text-3xl font-bold tracking-[-1px] text-white">
          Player Profile
        </h2>
        <span className="font-console text-xs text-[#50e3c2] uppercase">Performance Records</span>
      </div>

      <div className={`${PANEL} p-6 space-y-4`}>
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
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
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md transition-opacity" onClick={onClose} />
      <nav
        ref={panelRef}
        className="animate-rise relative z-10 w-72 max-w-[80vw] overflow-y-auto border-r border-white/10 bg-[#0d0d12]/95 p-6 backdrop-blur-xl"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <span className="font-geist text-lg font-bold tracking-[-0.5px] text-white">
            DECIBEL<span className="text-[#50e3c2]">.</span>
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

        <p className={`${EYEBROW} mt-6`}>Game Catalog</p>
        <ul className="mt-3 space-y-1.5">
          {playable.map((g) => (
            <li key={g.key}>
              <button
                type="button"
                onClick={() => onOpen(g)}
                className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-geist text-sm font-medium text-bone transition-all hover:bg-white/5 hover:text-white rounded-lg"
              >
                <span className="grid h-7 w-7 place-items-center rounded-md bg-white/5 font-bold text-xs text-[#50e3c2]">
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
            className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-geist text-sm text-dim hover:text-white rounded-lg"
          >
            ⌂ Home Hub
          </button>
          <button
            type="button"
            onClick={onProfile}
            className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-geist text-sm text-dim hover:text-[#50e3c2] rounded-lg"
          >
            ★ Player Profile
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Home;
