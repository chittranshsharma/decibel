// Lobby: player list, room code, host settings, Spotify playlist import, AI vibe generator, chat.
import { useState } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST, Avatar, Chat } from "../ui";

export const GENRES = [
  { label: "HIP-HOP", value: "hip-hop" },
  { label: "OLD SCHOOL RAP", value: "oldschool-hiphop" },
  { label: "TRAP & RAGE", value: "trap" },
  { label: "HYPERPOP & DIGICORE", value: "hyperpop" },
  { label: "DESI HIP HOP", value: "desi-hip-hop" },
  { label: "ROCK & ALT", value: "rock" },
  { label: "INDIE", value: "indie" },
  { label: "BEDROOM POP", value: "bedroom-pop" },
  { label: "R&B & SOUL", value: "rnb" },
  { label: "POP", value: "pop" },
  { label: "DESI INDIE", value: "desi-indie" },
  { label: "SPOTIFY PLAYLIST", value: "spotify" },
  { label: "🪄 AI VIBE CRATE", value: "ai-vibe" },
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
          <span className="font-console text-xs text-[#50e3c2] font-semibold">
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
                  <span className="text-[#50e3c2] text-xs font-bold" title="Google verified">
                    ✓
                  </span>
                )}
              </span>
              <span className="font-console text-xs text-dim">
                {p.isHost ? (
                  <span className="font-console text-xs font-bold text-[#f5a623]">
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
            <p className={EYEBROW}>Select Genre / Source</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = g.value === genre;
                const isSpecial = g.value === "spotify" || g.value === "ai-vibe";
                return (
                  <button
                    type="button"
                    key={g.value}
                    onClick={() => handleGenreChange(g.value)}
                    aria-pressed={active}
                    className={`rounded-xl px-4 py-2.5 font-geist text-xs font-semibold uppercase tracking-wider transition-all active:scale-95 ${
                      active
                        ? g.value === "ai-vibe"
                          ? "bg-gradient-to-r from-[#50e3c2] to-[#7928ca] text-black font-bold shadow-[0_0_20px_rgba(80,227,194,0.5)]"
                          : isSpecial
                          ? "bg-[#50e3c2] text-black shadow-[0_0_20px_rgba(80,227,194,0.4)]"
                          : "bg-white text-black shadow-[0_0_20px_rgba(255,255,255,0.3)]"
                        : g.value === "ai-vibe"
                        ? "border border-[#7928ca]/50 bg-[#7928ca]/10 text-[#50e3c2] hover:border-[#50e3c2]"
                        : isSpecial
                        ? "border border-[#50e3c2]/40 bg-[#50e3c2]/5 text-[#50e3c2] hover:border-[#50e3c2]"
                        : "border border-white/10 bg-[#121218]/90 text-bone hover:border-white/25 hover:bg-[#181822]"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Vibe Crate Input */}
          {genre === "ai-vibe" && (
            <div className={`${PANEL} p-5 space-y-4 border-[#50e3c2]/30 bg-gradient-to-b from-[#50e3c2]/5 to-transparent`}>
              <div className="flex items-center justify-between">
                <p className={EYEBROW}>🪄 Prompt-to-Crate Engine</p>
                <span className="font-console text-[10px] font-bold text-[#50e3c2] uppercase tracking-wider bg-[#50e3c2]/10 px-2 py-0.5 rounded border border-[#50e3c2]/20">
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
                    className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 font-geist text-[11px] text-bone hover:border-[#50e3c2]/50 hover:text-[#50e3c2] transition-colors"
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
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 font-geist text-xs text-bone placeholder:text-dim focus:border-[#50e3c2] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={vibeStatus?.loading || !vibePrompt.trim()}
                  className="rounded-lg bg-gradient-to-r from-[#50e3c2] to-[#00dfd8] px-4 py-2 font-geist text-xs font-bold text-black transition-all hover:opacity-90 disabled:opacity-50 shrink-0"
                >
                  {vibeStatus?.loading ? "Curating…" : "Generate"}
                </button>
              </form>

              {vibeStatus?.loading && (
                <div className="flex items-center gap-2 font-console text-xs uppercase tracking-wider text-[#f5a623] animate-pulse">
                  <span className="inline-block h-2 w-2 rounded-full bg-[#f5a623]"></span>
                  {vibeStatus.message || "Generating vibe crate with Groq AI…"}
                </div>
              )}

              {vibeStatus?.error && (
                <p className="font-console text-xs text-[#ee0000]">{vibeStatus.error}</p>
              )}

              {vibeStatus?.ready && (
                <div className="rounded-xl border border-[#50e3c2]/30 bg-[#50e3c2]/10 p-3.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-geist text-sm font-bold text-white">
                      🎵 {vibeStatus.vibeTitle}
                    </span>
                    <span className="font-console text-[10px] font-semibold text-[#50e3c2]">
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
            <div className={`${PANEL} p-5 space-y-3 border-[#50e3c2]/30`}>
              <p className={EYEBROW}>Spotify Playlist URL</p>
              <form onSubmit={handleLoadPlaylist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://open.spotify.com/playlist/..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/60 px-3 py-2.5 font-geist text-xs text-bone placeholder:text-dim focus:border-[#50e3c2] focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={playlistStatus?.loading || !spotifyUrl.trim()}
                  className="rounded-lg bg-[#50e3c2] px-4 py-2 font-geist text-xs font-semibold text-black transition-opacity disabled:opacity-50 shrink-0"
                >
                  {playlistStatus?.loading ? "Loading…" : "Load"}
                </button>
              </form>
              {playlistStatus?.loading && (
                <p className="font-console text-xs uppercase tracking-wider text-[#f5a623] animate-pulse">
                  Extracting tracks & finding audio snippets…
                </p>
              )}
              {playlistStatus?.error && (
                <p className="font-console text-xs text-[#ee0000]">{playlistStatus.error}</p>
              )}
              {playlistStatus?.tracksCount && (
                <p className="font-console text-xs text-[#50e3c2]">
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
            <SettingRow label="Answers" options={OPTION_OPTS} value={settings.optionsCount} onChange={setField("optionsCount")} />
            {!isCustomSource && (
              <SettingRow label="Era" options={availableDecades} value={settings.decade} onChange={setField("decade")} />
            )}
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
          className={`${BTN_GHOST} w-full text-center text-dim hover:text-[#ee0000] hover:border-[#ee0000]/40`}
        >
          Leave Lobby
        </button>
      </div>
    </div>
  );
}

function SettingRow({ label, options, value, onChange }) {
  return (
    <div>
      <p className={EYEBROW}>{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
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
                  ? "bg-[#50e3c2]/10 border-[#50e3c2] text-white shadow-[0_0_12px_rgba(80,227,194,0.2)]"
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

