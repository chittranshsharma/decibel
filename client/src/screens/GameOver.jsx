// Game over: champion podium card, high scores, round history, chat, restart.
import { useState } from "react";
import { EYEBROW, PANEL, BTN_AMBER, Avatar, Chat, Leaderboard, useCountUp } from "../ui";
import BorderGlow from "../components/BorderGlow";

export function GameOver({ gameOver, players, myId, onRestart, messages, onChat }) {
  const rows =
    gameOver?.leaderboard ??
    players.toSorted((a, b) => b.score - a.score).map((p, i) => ({ rank: i + 1, ...p }));
  const champ = rows[0];
  const rest = rows.slice(1);
  const history = gameOver?.roundHistory ?? null;
  const avatarOf = {};
  for (const p of players ?? []) avatarOf[p.id] = p.avatar;
  const shownScore = useCountUp(champ?.score ?? 0, 900);

  return (
    <div className="space-y-8 animate-rise">
      <div className="text-center space-y-1">
        <p className={EYEBROW}>Match Concluded</p>
        <h2 className="font-geist text-4xl font-extrabold tracking-[-1.5px] text-white">
          Final Leaderboard
        </h2>
      </div>

      {/* DJ Decibel Final Verdict Card */}
      {gameOver?.djVerdict && (
        <div className="relative overflow-hidden rounded-2xl border border-amber-400/30 bg-gradient-to-r from-amber-400/10 via-black/40 to-amber-400/5 p-5 backdrop-blur-md transition-all shadow-[0_0_30px_rgba(245,166,35,0.12)] animate-rise">
          <div className="flex items-center gap-2 pb-2">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-400"></span>
            </span>
            <span className="font-console text-xs font-bold uppercase tracking-widest text-amber-400">
              🎙️ DJ DECIBEL'S MATCH VERDICT
            </span>
          </div>
          <p className="font-geist text-base font-semibold tracking-tight text-white/95 leading-relaxed">
            "{gameOver.djVerdict}"
          </p>
        </div>
      )}

      {champ && (
        <BorderGlow
          animated={true}
          borderRadius={24}
          glowColor="40 90 70"
          backgroundColor="rgba(14, 13, 19, 0.9)"
        >
          <div className="p-6 text-center space-y-3">
            <p className="font-console text-xs font-bold text-amber-400 uppercase tracking-widest">
              👑 Match Champion
            </p>
            <div className="flex items-center justify-center gap-3">
              <Avatar name={champ.name} src={avatarOf[champ.id]} size={36} />
              <p className="font-geist text-2xl font-bold text-white">{champ.name}</p>
            </div>
            <p className="font-geist text-5xl font-extrabold tabular-nums text-white">
              {shownScore} <span className="text-sm font-normal text-dim">PTS</span>
            </p>
          </div>
        </BorderGlow>
      )}

      {rest.length > 0 && (
        <div className="space-y-2" style={{ animationDelay: "220ms" }}>
          <p className={EYEBROW}>Rankings</p>
          <ol className={`${PANEL} divide-y divide-white/5 overflow-hidden`}>
            {rest.map((r, i) => (
              <li key={r.id ?? r.name ?? i} className="flex items-center justify-between px-5 py-3">
                <span className="flex items-center gap-3">
                  <span className="w-6 font-console text-xs text-dim">{String(r.rank ?? i + 2).padStart(2, "0")}</span>
                  <span className="font-geist text-sm font-medium text-dim">{r.name}</span>
                </span>
                <span className="font-console text-sm font-semibold tabular-nums text-bone">{r.score}</span>
              </li>
            ))}
          </ol>
        </div>
      )}

      {history && history.length > 0 && <RoundHistory history={history} />}

      <Chat messages={messages} onChat={onChat} myId={myId} title="Post-Match Chat" />

      <button type="button" onClick={onRestart} className={`${BTN_AMBER} w-full`}>
        Play Again ↻
      </button>
    </div>
  );
}

function RoundHistory({ history }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={`${EYEBROW} flex min-h-11 w-full items-center justify-between text-left hover:text-white`}
      >
        <span>Match Timeline & Track Recap</span>
        <span className="text-dim font-console text-xs">{open ? "Hide ▲" : "View ▼"}</span>
      </button>
      {open && (
        <ol className={`${PANEL} divide-y divide-white/5 overflow-hidden`}>
          {history.map((h, i) => (
            <li key={i} className="flex items-center justify-between gap-3 px-4 py-3 font-geist text-xs">
              <span className="flex min-w-0 items-center gap-3">
                <span className="w-5 font-console text-dim">{String(i + 1).padStart(2, "0")}</span>
                <span className="truncate text-dim">
                  <span className="text-white font-medium">{h.artistName}</span> — {h.trackName}
                </span>
              </span>
              <span className="shrink-0 font-console font-semibold uppercase text-[#50e3c2]">
                {h.winner || "No one"}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

export default GameOver;
