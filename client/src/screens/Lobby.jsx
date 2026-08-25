// Lobby: player list, room code, host settings, Spotify playlist import, AI vibe generator, chat.
import { useState } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST, Avatar, Chat } from "../ui";

export const GENRES = [
  {
    label: "HIP-HOP",
    value: "hip-hop",
    sub: "Kendrick · Drake · Cole",
    image: "https://images.unsplash.com/photo-1546707012-c46675f12716?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "OLD SCHOOL RAP",
    value: "oldschool-hiphop",
    sub: "2Pac · Biggie · Nas",
    image: "https://images.unsplash.com/photo-1487180144351-b8472da7d491?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "TRAP & RAGE",
    value: "trap",
    sub: "Carti · Travis · Metro",
    image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "HYPERPOP",
    value: "hyperpop",
    sub: "Charli · 100 gecs · SOPHIE",
    image: "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "DESI HIP HOP",
    value: "desi-hip-hop",
    sub: "Seedhe Maut · KR$NA · Stan",
    image: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "ROCK & ALT",
    value: "rock",
    sub: "Nirvana · Queen · Arctic Monkeys",
    image: "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "INDIE",
    value: "indie",
    sub: "Tame Impala · Phoebe · Strokes",
    image: "https://images.unsplash.com/photo-1511735111819-9a3f7709049c?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "BEDROOM POP",
    value: "bedroom-pop",
    sub: "Clairo · Rex Orange · Cavetown",
    image: "https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "R&B & SOUL",
    value: "rnb",
    sub: "Frank Ocean · SZA · Weeknd",
    image: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "POP",
    value: "pop",
    sub: "Taylor · Dua Lipa · Billie",
    image: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "DESI INDIE",
    value: "desi-indie",
    sub: "Prateek Kuhad · Anuv Jain",
    image: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "SPOTIFY PLAYLIST",
    value: "spotify",
    sub: "Import Any Public URL",
    image: "https://images.unsplash.com/photo-1511379938547-c1f69419868d?auto=format&fit=crop&w=400&q=80",
  },
  {
    label: "🪄 AI VIBE CRATE",
    value: "ai-vibe",
    sub: "Prompt Groq LPU Engine",
    image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80",
  },
];

export const VIBE_OPTS = [
  { label: "All", value: "all" },
  { label: "Mainstream", value: "mainstream" },
  { label: "Underground", value: "underground" },
];

const QUICK_VIBES = [
  "90s Tokyo Midnight Drift",
  "Monsoon Coffee Shop Indie",
  "High-Octane Gym Phonk",
  "2000s Bollywood Party",
  "Cyberpunk Synthwave 2077",
  "90s UK Garage & 2-Step",
];

const ROUND_OPTS = [
  { label: "10", value: 10 },
  { label: "5", value: 5 },
  { label: "15", value: 15 },
];
const TIMER_OPTS = [
  { label: "10s", value: 10000 },
  { label: "7.5s", value: 7500 },
  { label: "15s", value: 15000 },
];
const OPTION_OPTS = [
  { label: "4", value: 4 },
  { label: "3", value: 3 },
  { label: "6", value: 6 },
];
const MODE_OPTS = [
  { label: "Title", value: "TITLE" },
  { label: "Artist", value: "ARTIST" },
];
const DECADE_OPTS = [
  { label: "All", value: "all" },
  { label: "New", value: "new" },
  { label: "2020s", value: "2020s" },
  { label: "2010s", value: "2010s" },
  { label: "2000s", value: "2000s" },
  { label: "90s", value: "1990s" },
  { label: "80s", value: "1980s" },
];
const CLIP_OPTS = [
  { label: "Random", value: "RANDOM" },
  { label: "Intro", value: "INTRO" },
];

export function Lobby({
  players,
  myId,
  isHost,
  onStart,
  code,
  messages,
  onChat,
  clipPref,
  onLeave,
  playlistStatus,
  onSetPlaylist,
  vibeStatus,
  onGenerateVibe,
}) {
  const [copied, setCopied] = useState(false);
  const [genre, setGenre] = useState(GENRES[0].value);
  const [spotifyUrl, setSpotifyUrl] = useState("");
  const [vibePrompt, setVibePrompt] = useState("");

  const [settings, setSettings] = useState({
    rounds: 10,
    roundMs: 10000,
    optionsCount: 4,
    mode: "TITLE",
    decade: "all",
    vibe: "all",
    clip: clipPref === "INTRO" ? "INTRO" : "RANDOM",
  });

  const setField = (key) => (value) => setSettings((s) => ({ ...s, [key]: value }));
  const handleStart = () => onStart({ ...settings, genre });

  const joinLink =
    typeof window !== "undefined" && code ? `${window.location.origin}?room=${code}` : "";
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(joinLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* clipboard blocked */
    }
  };

  const handleLoadPlaylist = (e) => {
    e.preventDefault();
    if (!spotifyUrl.trim() || !onSetPlaylist) return;
    onSetPlaylist(spotifyUrl.trim());
  };

  const handleGenerateVibe = (e) => {
    e.preventDefault();
    if (!vibePrompt.trim() || !onGenerateVibe) return;
    onGenerateVibe(vibePrompt.trim());
  };

  const handleGenreChange = (newGenre) => {
    setGenre(newGenre);
    if (newGenre === "oldschool-hiphop" && settings.decade === "new") {
      setSettings((s) => ({ ...s, decade: "all" }));
    }
  };

  const availableDecades = DECADE_OPTS.filter((d) => {
    if (d.value === "new") {
      return genre !== "oldschool-hiphop";
    }
    return true;
  });

  const isCustomSource = genre === "spotify" || genre === "ai-vibe";

  return (
    <div className="space-y-8 animate-rise">
      {/* Room Access Code Card */}
      <div className={`${PANEL} p-5 space-y-2`}>
        <div className="flex items-center justify-between">
          <span className={EYEBROW}>Room Access Code</span>
        </div>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="font-geist text-4xl font-extrabold tracking-[0.2em] text-white">
            {code}
          </span>
          <button type="button" onClick={copy} className={BTN_GHOST}>
            {copied ? "✓ Copied!" : "Copy Link"}
          </button>
        </div>
      </div>

      {/* Players List */}
      <div>
        <div className="flex items-center justify-between pb-2">
          <p className={EYEBROW}>Connected Players</p>
          <span className="font-console text-xs text-amber-400 font-semibold">
            {players.length} / 08 Active
          </span>
        </div>
        <ul className={`${PANEL} divide-y divide-white/5 overflow-hidden`}>
          {players.map((p, i) => (
            <li
              key={p.id}
              className={`flex items-center justify-between px-4 py-3 ${
                i % 2 ? "bg-white/[0.02]" : ""
              }`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar name={p.name} src={p.avatar} />
                <span className="truncate font-geist text-sm font-medium text-white">{p.name}</span>
                {p.google && (
                  <span className="text-amber-400 text-xs font-bold" title="Google verified">
                    ✓
                  </span>
                )}
              </span>
              <span className="font-console text-xs text-dim">
                {p.isHost ? (
                  <span className="font-console text-xs font-bold text-amber-400">
                    ★ HOST
                  </span>
                ) : (
                  "Ready"
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {isHost ? (
        <div className="space-y-6">
          <div>
            <div className="flex items-center justify-between pb-2">
              <p className={EYEBROW}>Select Music Scene</p>
              {isCustomSource && (
                <span className="font-console text-[10px] font-bold text-amber-400 uppercase tracking-widest bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Custom Source Active
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4">
              {GENRES.map((g) => {
                const active = g.value === genre;
                const isSpecial = g.value === "spotify" || g.value === "ai-vibe";
                return (
                  <button
                    type="button"
                    key={g.value}
                    onClick={() => handleGenreChange(g.value)}
                    aria-pressed={active}
                    className={`group relative overflow-hidden rounded-xl p-3 text-left transition-all duration-200 active:scale-95 border ${
                      active
                        ? "border-amber-400 ring-2 ring-amber-400/40 shadow-[0_0_24px_rgba(245,166,35,0.35)] scale-[1.02]"
                        : isSpecial
                        ? "border-amber-400/30 bg-black/60 hover:border-amber-400/70 hover:scale-[1.01]"
                        : "border-white/10 bg-black/60 hover:border-white/25 hover:scale-[1.01]"
                    }`}
                  >
                    {/* Background artwork with dark gradient overlay */}
                    <div className="absolute inset-0 z-0 overflow-hidden">
                      <img
                        src={g.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover object-center transition-transform duration-500 group-hover:scale-110 opacity-30 group-hover:opacity-45"
                      />
                      <div
                        className={`absolute inset-0 ${
                          active
                            ? "bg-gradient-to-t from-black via-black/80 to-amber-950/40"
                            : "bg-gradient-to-t from-black via-black/85 to-black/60"
                        }`}
                      />
                    </div>

                    {/* Card Content */}
                    <div className="relative z-10 flex h-full flex-col justify-between min-h-[4.25rem]">
                      <div className="flex items-center justify-between gap-1">
                        <span
                          className={`font-geist text-xs font-bold uppercase tracking-wider ${
                            active ? "text-amber-400 drop-shadow-[0_0_8px_rgba(245,166,35,0.4)]" : "text-white"
                          }`}
                        >
                          {g.label}
                        </span>
                        {active && (
                          <span className="flex h-2 w-2 relative shrink-0">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-400" />
                          </span>
                        )}
                      </div>
                      <p
                        className={`font-console text-[10px] truncate ${
                          active ? "text-amber-300/90 font-semibold" : "text-bone/60 group-hover:text-bone/85"
                        }`}
                      >
                        {g.sub}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Vibe Crate Input */}
          {genre === "ai-vibe" && (
            <div className={`${PANEL} p-5 space-y-4 border-amber-400/30 bg-gradient-to-b from-amber-400/5 to-transparent`}>
              <div className="flex items-center justify-between">
                <p className={EYEBROW}>🪄 Prompt-to-Crate Engine</p>
                <span className="font-console text-[10px] font-bold text-amber-400 uppercase tracking-wider bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                  Powered by Groq AI
                </span>
              </div>
              <p className="font-geist text-xs text-dim">
                Type any vibe, scene, or era — Groq maps it to curated audio previews instantly.
              </p>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5">
                {QUICK_VIBES.map((qv) => (
                  <button
                    key={qv}
                    type="button"
                    onClick={() => setVibePrompt(qv)}
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-geist text-[11px] text-bone hover:border-amber-400/50 hover:text-amber-400 transition-colors"
                  >
                    + {qv}
                  </button>
                ))}
              </div>

              <form onSubmit={handleGenerateVibe} className="flex gap-2">
                <input
                  type="text"
                  placeholder="e.g. 90s Tokyo midnight drift, monsoon cafe indie..."
                  value={vibePrompt}
                  onChange={(e) => setVibePrompt(e.target.value)}
                  maxLength={100}
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 font-geist text-xs text-bone placeholder:text-dim focus:border-amber-400/70 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={vibeStatus?.loading || !vibePrompt.trim()}
                  className="rounded-lg bg-gradient-to-r from-[#f5a623] to-[#ffb84d] px-4 py-2 font-geist text-xs font-bold text-black transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
                >
                  {vibeStatus?.loading ? "Curating…" : "Generate"}
                </button>
              </form>

              {vibeStatus?.loading && (
                <div className="flex items-center gap-2 font-console text-xs uppercase tracking-wider text-amber-400 animate-pulse">
                  <span className="inline-block h-2 w-2 rounded-full bg-amber-400"></span>
                  {vibeStatus.message || "Generating vibe crate with Groq AI…"}
                </div>
              )}

              {vibeStatus?.error && (
                <p className="font-console text-xs text-[#ee0000]">{vibeStatus.error}</p>
              )}

              {vibeStatus?.ready && (
                <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-geist text-sm font-bold text-white">
                      🎵 {vibeStatus.vibeTitle}
                    </span>
                    <span className="font-console text-[10px] font-semibold text-amber-400">
                      {vibeStatus.tracksCount} TRACKS READY
                    </span>
                  </div>
                  {vibeStatus.description && (
                    <p className="font-geist text-xs text-dim italic">"{vibeStatus.description}"</p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Spotify Playlist URL Input */}
          {genre === "spotify" && (
            <div className={`${PANEL} p-5 space-y-3 border-amber-400/30`}>
              <p className={EYEBROW}>Spotify Playlist URL</p>
              <form onSubmit={handleLoadPlaylist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://open.spotify.com/playlist/..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 font-geist text-xs text-bone placeholder:text-dim focus:border-amber-400/70 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={playlistStatus?.loading || !spotifyUrl.trim()}
                  className="rounded-lg bg-amber-400 px-4 py-2 font-geist text-xs font-bold text-black transition-opacity disabled:opacity-50 shrink-0"
                >
                  {playlistStatus?.loading ? "Loading…" : "Load"}
                </button>
              </form>
              {playlistStatus?.loading && (
                <p className="font-console text-xs uppercase tracking-wider text-amber-400 animate-pulse">
                  Extracting tracks & finding audio snippets…
                </p>
              )}
              {playlistStatus?.error && (
                <p className="font-console text-xs text-[#ee0000]">{playlistStatus.error}</p>
              )}
              {playlistStatus?.tracksCount && (
                <p className="font-console text-xs text-amber-400">
                  ✓ Ready: "{playlistStatus.name}" ({playlistStatus.tracksCount} playable songs)
                </p>
              )}
            </div>
          )}

          {/* Settings Matrix */}
          <div className="space-y-4">
            {!isCustomSource && (
              <SettingRow label="Vibe" options={VIBE_OPTS} value={settings.vibe} onChange={setField("vibe")} />
            )}
            <SettingRow label="Mode" options={MODE_OPTS} value={settings.mode} onChange={setField("mode")} />
            <SettingRow label="Clip" options={CLIP_OPTS} value={settings.clip} onChange={setField("clip")} />
            <SettingRow label="Rounds" options={ROUND_OPTS} value={settings.rounds} onChange={setField("rounds")} />
            <SettingRow label="Timer" options={TIMER_OPTS} value={settings.roundMs} onChange={setField("roundMs")} />
          </div>

          <button type="button" onClick={handleStart} className={`${BTN_AMBER} w-full`}>
            Start Game ▶
          </button>
        </div>
      ) : (
        <div className={`${PANEL} p-5 text-center space-y-2`}>
          <p className="font-geist text-sm text-bone font-medium">Waiting for Host to start match…</p>
          <p className="font-console text-xs text-dim">Get ready to listen and answer fast.</p>
        </div>
      )}

      <Chat messages={messages} onChat={onChat} myId={myId} />

      <div className="pt-2">
        <button
          type="button"
          onClick={onLeave}
          className="group relative w-full overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-r from-red-950/40 via-red-900/20 to-red-950/40 px-5 py-3 font-geist text-sm font-semibold tracking-wide text-red-300 shadow-[0_0_20px_rgba(239,68,68,0.15)] backdrop-blur-md transition-all duration-200 hover:border-red-500/60 hover:bg-red-500/20 hover:text-white hover:shadow-[0_0_30px_rgba(239,68,68,0.35)] active:scale-[0.98]"
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400 group-hover:animate-ping" />
            Leave Lobby
          </span>
        </button>
      </div>
    </div>
  );
}

function SettingRow({ label, options, value, onChange }) {
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/5 pb-3">
      <span className={EYEBROW}>{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              type="button"
              key={String(opt.value)}
              onClick={() => onChange(opt.value)}
              aria-pressed={active}
              className={`rounded-lg px-3.5 py-1.5 font-geist text-xs font-semibold transition-all duration-200 active:scale-95 border ${
                active
                  ? "bg-amber-400/15 border-amber-400 text-white shadow-[0_0_12px_rgba(245,166,35,0.2)]"
                  : "border-white/5 bg-white/[0.02] backdrop-blur-md text-dim hover:text-white hover:border-white/15 hover:bg-white/[0.05]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Lobby;
