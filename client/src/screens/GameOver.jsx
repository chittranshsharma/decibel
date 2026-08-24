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
      <div className="text-center space-y-2">
        <span className="inline-block rounded-full border border-[#50e3c2]/30 bg-[#50e3c2]/10 px-3.5 py-1 font-console text-[11px] font-bold text-[#50e3c2] uppercase tracking-wider">
          Match Concluded
        </span>
        <h2 className="font-geist text-4xl font-extrabold tracking-[-1.5px] text-white">
          Final Leaderboard
        </h2>
      </div>

      {champ && (
        <BorderGlow
          animated={true}
          borderRadius={24}
          glowColor="168 76 60"
          backgroundColor="rgba(14, 14, 20, 0.9)"
          colors={['#50e3c2', '#ff0080', '#00dfd8']}
        >
          <div className="p-6 text-center space-y-3">
            <p className="font-console text-xs font-bold text-[#50e3c2] uppercase tracking-widest">
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
