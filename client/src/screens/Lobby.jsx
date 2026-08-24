// Lobby: player list, room code, host settings, Spotify playlist import, chat.
import { useState } from "react";
import { EYEBROW, PANEL, BTN_AMBER, BTN_GHOST, Avatar, Chat } from "../ui";

// Accurately categorized 11 curated genres + Custom Spotify Playlist
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
];

export const VIBE_OPTS = [
  { label: "All", value: "all" },
  { label: "Mainstream", value: "mainstream" },
  { label: "Underground", value: "underground" },
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

// ---------- Lobby ----------
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
}) {
  const [copied, setCopied] = useState(false);
  const [genre, setGenre] = useState(GENRES[0].value);
  const [spotifyUrl, setSpotifyUrl] = useState("");

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

  return (
    <div className="space-y-8">
      <div>
        <p className={EYEBROW}>Players {String(players.length).padStart(2, "0")} / 08</p>
        <ul className={`mt-3 ${PANEL} divide-y divide-rule`}>
          {players.map((p, i) => (
            <li
              key={p.id}
              className={`flex items-center justify-between px-4 py-3 ${i % 2 ? "bg-void/40" : ""}`}
            >
              <span className="flex min-w-0 items-center gap-3">
                <Avatar name={p.name} src={p.avatar} />
                <span className="font-console text-xs text-cyan">{i + 1}UP</span>
                <span className="truncate font-console uppercase tracking-wide text-bone">{p.name}</span>
                {p.google && (
                  <span className="shrink-0 text-good" title="Google verified" role="img" aria-label="Google verified">
                    ✓
                  </span>
                )}
              </span>
              <span className="flex items-center gap-3 font-console text-[11px] uppercase tracking-[0.2em]">
                {p.id === myId && <span className="text-dim">· You</span>}
                {i === 0 && <span className="text-amber">[Host]</span>}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <div className={`${PANEL} p-4 border border-rule/80`}>
        <p className={EYEBROW}>Room Access Code</p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="font-marquee text-4xl font-black tracking-[0.25em] phosphor">{code}</span>
          <button type="button" onClick={copy} className={BTN_GHOST}>
            {copied ? "✓ Copied" : "Copy Link"}
          </button>
          <span className="sr-only" role="status">
            {copied ? "Join link copied to clipboard" : ""}
          </span>
        </div>
        <p className="mt-2 font-console text-xs text-dim">Share this code or direct link with friends to join.</p>
      </div>

      {isHost ? (
        <div className="space-y-5">
          <div>
            <p className={EYEBROW}>Genre & Source</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {GENRES.map((g) => {
                const active = g.value === genre;
                const isSpotify = g.value === "spotify";
                return (
                  <button
                    type="button"
                    key={g.value}
                    onClick={() => handleGenreChange(g.value)}
                    aria-pressed={active}
                    className={`min-h-11 px-3.5 py-2 font-console text-xs uppercase tracking-[0.16em] transition-all active:scale-[.96] ${
                      active
                        ? isSpotify
                          ? "bg-good text-black font-bold shadow-[0_0_20px_-3px_#3DF07A]"
                          : "bg-pink text-black font-bold shadow-[0_0_20px_-3px_#FF3D7F]"
                        : isSpotify
                        ? "border border-good/50 bg-cabinet/80 text-good hover:border-good hover:shadow-[0_0_15px_-4px_#3DF07A]"
                        : "border border-rule/80 bg-cabinet/80 text-dim hover:border-pink hover:text-pink"
                    }`}
                  >
                    {g.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Spotify Playlist URL Input */}
          {genre === "spotify" && (
            <div className="space-y-3 rounded-none border border-good/40 bg-cabinet p-4">
              <p className={EYEBROW}>Spotify Playlist Link</p>
              <form onSubmit={handleLoadPlaylist} className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://open.spotify.com/playlist/..."
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  className="w-full border border-rule bg-void px-3 py-2 font-console text-xs text-bone placeholder:text-dim focus:border-good focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={playlistStatus?.loading || !spotifyUrl.trim()}
                  className="border border-good bg-good px-4 py-2 font-console text-xs uppercase tracking-wider text-black transition-opacity disabled:opacity-50"
                >
                  {playlistStatus?.loading ? "Loading…" : "Load"}
                </button>
              </form>
              {playlistStatus?.loading && (
                <p className="font-console text-xs uppercase tracking-wider text-amber animate-pulse">
                  Extracting tracks & finding audio snippets…
                </p>
              )}
              {playlistStatus?.error && (
                <p className="font-console text-xs text-bad">{playlistStatus.error}</p>
              )}
              {playlistStatus?.tracksCount && (
                <p className="font-console text-xs text-good">
                  ✓ Ready: "{playlistStatus.name}" ({playlistStatus.tracksCount} playable songs)
                </p>
              )}
            </div>
          )}

          {/* Vibe Selector: Mainstream / Underground / All */}
          {genre !== "spotify" && (
            <SettingRow label="Vibe" options={VIBE_OPTS} value={settings.vibe} onChange={setField("vibe")} />
          )}

          <SettingRow label="Mode" options={MODE_OPTS} value={settings.mode} onChange={setField("mode")} />
          <SettingRow label="Clip" options={CLIP_OPTS} value={settings.clip} onChange={setField("clip")} />
          <SettingRow label="Rounds" options={ROUND_OPTS} value={settings.rounds} onChange={setField("rounds")} />
          <SettingRow label="Timer" options={TIMER_OPTS} value={settings.roundMs} onChange={setField("roundMs")} />
          <SettingRow label="Answers" options={OPTION_OPTS} value={settings.optionsCount} onChange={setField("optionsCount")} />
          {genre !== "spotify" && (
            <SettingRow label="Era" options={availableDecades} value={settings.decade} onChange={setField("decade")} />
          )}

          <button type="button" onClick={handleStart} className={`${BTN_AMBER} w-full`}>
            <span aria-hidden="true">▶ </span>Start Game
          </button>
        </div>
      ) : (
        <p className={`${EYEBROW} text-center`}>
          <span className="animate-blink text-amber">▍</span> Waiting for host
        </p>
      )}

      <button type="button" onClick={onLeave} className={`${BTN_GHOST} w-full`}>
        <span aria-hidden="true">✕ </span>Leave Room
      </button>

      <Chat messages={messages} onChat={onChat} myId={myId} title="Lobby chat" />
    </div>
  );
}

function SettingRow({ label, options, value, onChange }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={EYEBROW}>{label}</p>
      <div className="flex flex-wrap justify-end gap-1.5">
        {options.map((o) => {
          const active = o.value === value;
          return (
            <button
              type="button"
              key={String(o.value)}
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={`min-h-11 min-w-[2.75rem] px-2.5 py-1.5 font-console text-xs uppercase tracking-[0.12em] transition-[color,border-color,background-color,transform] active:scale-[.96] ${
                active
                  ? "bg-pink text-black"
                  : "border border-rule text-dim hover:border-pink hover:text-pink"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default Lobby;
