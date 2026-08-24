// Home hub, profile, and side menu — Jam & Linear Bento Aesthetic.
import { useCallback, useEffect, useRef, useState } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST } from "../ui";
import DriftWall from "../components/DriftWall";
import BorderGlow from "../components/BorderGlow";

// Renders the Google Identity Services button. Harmless if clientId is absent.
function GoogleSignInButton({ onSignIn }) {
  const divRef = useRef(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
  const onSignInRef = useRef(onSignIn);
  useEffect(() => { onSignInRef.current = onSignIn; }, [onSignIn]);

  useEffect(() => {
    if (!clientId || !divRef.current) return;
    const g = window.google;
    if (!g?.accounts?.id) return;
    g.accounts.id.initialize({
      client_id: clientId,
      callback: (res) => {
        try {
          const payload = JSON.parse(atob(res.credential.split(".")[1]));
          onSignInRef.current({ name: payload.name || "Player", picture: payload.picture || null, email: payload.email || null, idToken: res.credential });
        } catch { /* ignore */ }
      },
    });
    g.accounts.id.renderButton(divRef.current, {
      theme: "filled_black", size: "large", shape: "pill", width: 220,
    });
  }, [clientId]);

  if (!clientId) return null;
  return <div ref={divRef} />;
}

export const GAMES = [
  { key: "musicquiz", glyph: "♬", title: "Music Quiz", sub: "Name the track from a 10s snippet", status: "play", clip: "RANDOM" },
  { key: "heardle", glyph: "▶", title: "Heardle", sub: "Guess the song from its intro", status: "play", clip: "INTRO" },
  { key: "create", glyph: "+", title: "Create Room", sub: "Private multiplayer room for friends", status: "play", clip: "RANDOM" },
  { key: "harmonies", glyph: "⌘", title: "Harmonies", sub: "Music connections 4x4 puzzle", status: "play" },
  { key: "wordzic", glyph: "▦", title: "Wordzic", sub: "Guess the 5-letter music term", status: "play" },
  { key: "lyricles", glyph: "❝", title: "Lyricles", sub: "Guess the song from its lyrics", status: "play" },
  { key: "crosszic", glyph: "✚", title: "Crosszic", sub: "Interactive 5x5 music crossword", status: "play" },
];

// ---------- Home hub (landing) ----------
export function Home({ games, stats, onOpen, onProfile, googleUser, onGoogleSignIn, onGoogleSignOut }) {
  return (
    <div className="relative animate-rise space-y-12">
      {/* Subtle Hero Acoustic Backdrop */}
      <div className="hero-backdrop" />

      {/* Hero Section */}
      <div className="relative z-10 space-y-6 pt-4 text-center sm:text-left">
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
          <span className="inline-flex items-center gap-2.5 font-console text-xs font-semibold tracking-wider text-amber-400 drop-shadow-sm">
            <span className="flex items-end gap-0.5 h-3.5">
              <span className="w-0.5 bg-amber-400 animate-bounce" style={{ height: "60%", animationDuration: "0.8s" }} />
              <span className="w-0.5 bg-amber-400 animate-bounce" style={{ height: "100%", animationDuration: "1.1s" }} />
              <span className="w-0.5 bg-amber-400 animate-bounce" style={{ height: "45%", animationDuration: "0.7s" }} />
              <span className="w-0.5 bg-amber-400 animate-bounce" style={{ height: "85%", animationDuration: "0.9s" }} />
            </span>
            78,890 SONGS READY
          </span>
          <span className="text-white/30">·</span>
          <span className="font-console text-xs font-medium tracking-wider text-neutral-400 uppercase">
            11 MUSIC SCENES
          </span>
        </div>

        <h1 className="font-geist text-5xl font-extrabold tracking-[-2.4px] text-white leading-[1.04] sm:text-6xl drop-shadow-[0_2px_16px_rgba(0,0,0,0.8)]">
          Guess the song.
          <br />
          <span className="text-gradient-jam">Beat your squad.</span>
        </h1>

        <p className="mx-auto sm:mx-0 max-w-lg font-geist text-base font-normal leading-relaxed text-neutral-300 drop-shadow-md">
          Real-time multiplayer music trivia. Play your favorite Spotify playlists or battle with friends through underground crate cuts.
        </p>

        <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-3">
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
            className={`${BTN_GHOST} px-6 py-3 text-sm font-semibold text-white`}
          >
            Create Private Room
          </button>
        </div>

        {/* Google Sign-In / user pill */}
        <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
          {googleUser ? (
            <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-4 py-2">
              {googleUser.picture && (
                <img src={googleUser.picture} alt="" className="h-6 w-6 rounded-full" />
              )}
              <span className="font-geist text-sm text-white font-medium truncate max-w-[140px]">{googleUser.name}</span>
              <button
                type="button"
                onClick={onGoogleSignOut}
                className="font-console text-[10px] uppercase tracking-wider text-dim hover:text-white transition-colors"
              >
                Sign out
              </button>
            </div>
          ) : (
            <GoogleSignInButton onSignIn={onGoogleSignIn} />
          )}
        </div>
      </div>

      {/* Player Profile Spotlight Card with BorderGlow */}
      <BorderGlow
        animated={true}
        borderRadius={18}
        glowColor="40 90 70"
        backgroundColor="rgba(14, 13, 19, 0.85)"
      >
        <button
          type="button"
          onClick={onProfile}
          className="flex w-full items-center justify-between p-5 text-left transition-all group cursor-pointer"
        >
          <span className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-lg text-amber-400 group-hover:scale-105 transition-transform">
              ★
            </span>
            <div>
              <p className="font-geist text-sm font-semibold text-white">Player Profile & Records</p>
              <p className="font-console text-xs text-dim">Local match performance</p>
            </div>
          </span>
          <span className="font-console text-xs font-semibold tabular-nums text-amber-400">
            {stats.games} MATCHES · {stats.wins} WINS · BEST {stats.bestScore}
          </span>
        </button>
      </BorderGlow>

      {/* 3D Drifting Music Crate Wall */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <p className={EYEBROW}>11 Curated Scene Rosters</p>
            <h3 className="font-geist text-lg font-bold text-white tracking-[-0.4px]">Interactive 3D Music Crate</h3>
          </div>
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
    <BorderGlow
      borderRadius={18}
      glowColor="40 90 70"
      backgroundColor="rgba(14, 13, 19, 0.85)"
    >
      <button
        type="button"
        onClick={() => playable && onOpen(game)}
        disabled={!playable}
        className="flex h-full w-full flex-col justify-between p-5 text-left group cursor-pointer"
      >
        <div className="flex items-start justify-between gap-3">
          <span
            className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.04] font-geist text-xl font-bold text-white shadow-md group-hover:scale-105 group-hover:border-amber-400/40 group-hover:bg-white/[0.08] transition-all"
          >
            {game.glyph}
          </span>
          <span className="font-console text-xs text-dim group-hover:text-amber-400 group-hover:translate-x-0.5 transition-all">
            {playable ? "→" : "SOON"}
          </span>
        </div>

        <div className="mt-4 space-y-1">
          <h3 className="font-geist text-base font-semibold tracking-[-0.3px] text-white group-hover:text-amber-300 transition-colors">
            {game.title}
          </h3>
          <p className="font-geist text-xs leading-relaxed text-[#9e9ea8]">
            {game.sub}
          </p>
        </div>
      </button>
    </BorderGlow>
  );
}

const WHY_ITEMS = [
  { t: "Massive 78,000+ Song Catalog", d: "11 curated music scenes from Hip-Hop and Pop to Indie and Alt Rock." },
  { t: "Instant Real-Time Battles", d: "Multiplayer rooms with zero lag, instant scoring, and live reaction emojis." },
  { t: "Custom Spotify Playlists", d: "Paste any public Spotify link to instantly generate a custom trivia match." },
  { t: "Power-Ups & Streak Bonuses", d: "50:50 Eliminator, 2X Double Down Multiplier, and Streak Shields to boost your rank." },
];

function WhyDecibel() {
  return (
    <div className="space-y-4 pt-4">
      <p className={EYEBROW}>Game Highlights</p>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {WHY_ITEMS.map((item) => (
          <div key={item.t} className={`${PANEL} p-5 space-y-1`}>
            <p className="font-geist text-sm font-semibold text-white">{item.t}</p>
            <p className="font-geist text-xs leading-relaxed text-slate-300">{item.d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const FAQ_ITEMS = [
  { q: "How do custom playlists work?", a: "Paste any public Spotify playlist link when creating a room. Decibel instantly generates a custom trivia match with 30-second audio clips." },
  { q: "How does scoring calculate speed?", a: "Base score is awarded for correct answers, plus up to 350 speed bonus points based on millisecond reaction time." },
  { q: "Can I play solo?", a: "Yes! Single-player modes include Harmonies (connections), Wordzic (5-letter term), Lyricles (progression guesser), and Crosszic (5x5 crossword)." },
];

function Faq() {
  const [openIdx, setOpenIdx] = useState(null);

  return (
    <div className="space-y-4 pt-4">
      <p className={EYEBROW}>Frequently Asked Questions</p>
      <div className="space-y-2">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIdx === idx;
          return (
            <div key={item.q} className={`${PANEL} overflow-hidden`}>
              <button
                type="button"
                onClick={() => setOpenIdx(isOpen ? null : idx)}
                className="flex w-full items-center justify-between p-4 text-left font-geist text-sm font-medium text-white transition-colors hover:text-[#50e3c2]"
              >
                <span>{item.q}</span>
                <span className="font-console text-xs text-dim">{isOpen ? "▲" : "▼"}</span>
              </button>
              {isOpen && (
                <div className="border-t border-white/5 px-4 py-3 font-geist text-xs leading-relaxed text-slate-300">
                  {item.a}
                </div>
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
    <footer className="pt-8 text-center font-console text-[11px] text-dim border-t border-white/5 space-y-2">
      <p className="text-bone font-medium">Decibel · The Ultimate Multiplayer Music Guessing Game</p>
      <p className="text-[10px] text-dim">Play live with friends or test your music knowledge across every genre.</p>
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
        <span className="font-console text-xs text-amber-400 uppercase">Performance Records</span>
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
            DECIBEL<span className="text-amber-400">.</span>
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
                <span className="grid h-7 w-7 place-items-center rounded-md bg-white/5 font-bold text-xs text-amber-400">
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
            className="flex min-h-11 w-full items-center gap-3 px-3 py-2 text-left font-geist text-sm text-dim hover:text-amber-400 rounded-lg"
          >
            ★ Player Profile
          </button>
        </div>
      </nav>
    </div>
  );
}

export default Home;
