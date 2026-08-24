// Reveal: round answer, winner card, per-player results, leaderboard.
import { EYEBROW, PANEL, Avatar, Leaderboard, ReactionBar, useCountUp } from "../ui";
import BorderGlow from "../components/BorderGlow";

export function Reveal({ reveal, myId, onReact, players }) {
  const results = reveal?.results ?? [];
  const winner = reveal?.roundWinner ?? null;
  const round = reveal?.round ?? 0;
  const avatarOf = {};
  for (const p of players ?? []) avatarOf[p.id] = p.avatar;
  const total = reveal?.totalRounds ?? 10;
  const track = reveal?.track ?? null;
  const isArtist = reveal?.mode === "ARTIST";
  const leaderboard =
    reveal?.leaderboard ??
    results.toSorted((a, b) => b.score - a.score).map((p, i) => ({ rank: i + 1, ...p }));
  const winnerResult = winner ? results.find((r) => r.name === winner.name) : null;
  const winnerPoints = winnerResult?.pointsEarned ?? 0;
  const winnerStreak = winnerResult?.streakBonus ?? 0;
  const shownPoints = useCountUp(winnerPoints);

  return (
    <div className="space-y-6 animate-rise">
      <div className="flex items-center justify-between">
        <span className={EYEBROW}>
          Round {String(round).padStart(2, "0")} / {String(total).padStart(2, "0")} Results
        </span>
      </div>

      {track && (
        <div className={`${PANEL} p-5 space-y-1`} style={{ animationDelay: "80ms" }}>
          <p className={EYEBROW}>Correct Answer</p>
          <p className="font-geist text-xl font-bold tracking-tight text-white">
            <span className={isArtist ? "text-[#50e3c2]" : ""}>{track.artistName}</span>
            <span className="text-dim"> — </span>
            <span className={isArtist ? "" : "text-[#50e3c2]"}>{track.trackName}</span>
          </p>
        </div>
      )}

      {/* AI Live Hype DJ Commentary Card */}
      {reveal?.djCommentary && (
        <div
          className="relative overflow-hidden rounded-2xl border border-[#f5a623]/30 bg-gradient-to-r from-[#f5a623]/10 via-[#7928ca]/10 to-[#50e3c2]/10 p-4 backdrop-blur-md transition-all animate-rise"
          style={{ animationDelay: "120ms" }}
        >
          <div className="flex items-center gap-2 pb-1.5">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#50e3c2] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#50e3c2]"></span>
            </span>
            <span className="font-console text-[10px] font-bold uppercase tracking-widest text-[#f5a623]">
              🎙️ DJ DECIBEL (LIVE)
            </span>
          </div>
          <p className="font-geist text-sm font-semibold tracking-tight text-white/95 italic">
            "{reveal.djCommentary}"
          </p>
        </div>
      )}

      {/* Winner Spotlight Card */}
      {winner ? (
        <BorderGlow
          animated={true}
          borderRadius={20}
          glowColor="168 76 60"
          backgroundColor="rgba(80, 227, 194, 0.06)"
          colors={['#50e3c2', '#00dfd8', '#7928ca']}
        >
          <div className="p-6">
            <div className="flex items-center justify-between">
              <span className="font-console text-xs font-semibold text-[#50e3c2] uppercase tracking-wider">
                Fastest Correct Answer
              </span>
              {winnerStreak > 0 && (
                <span className="font-console text-xs font-bold text-[#f5a623]">
                  🔥 Streak +{winnerStreak}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-end justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate font-geist text-2xl font-bold text-white">
                  {winner.name}
                </p>
                <p className="mt-1 font-console text-xs tabular-nums text-dim">{winner.answerTimeSeconds}s response time</p>
              </div>
              <p className="shrink-0 font-geist text-4xl font-extrabold tabular-nums text-[#50e3c2]">
                +{shownPoints}
              </p>
            </div>
          </div>
        </BorderGlow>
      ) : (
        <div
          className={`${PANEL} p-6 text-center border-[#ee0000]/40 bg-[#ee0000]/5`}
          style={{ animationDelay: "160ms" }}
        >
          <p className="font-geist text-xl font-bold text-[#ee0000]">No Correct Answers</p>
        </div>
      )}

      {/* Per-player results */}
      <div className="space-y-2" style={{ animationDelay: "260ms" }}>
        <p className={EYEBROW}>Round Breakdown</p>
        <ul className={`${PANEL} divide-y divide-white/5 overflow-hidden`}>
          {results.map((r, ri) => {
            const answered = r.answerTimeSeconds != null;
            const isMe = myId && r.id === myId;
            return (
              <li
                key={r.id ?? r.name}
                className={`flex items-center justify-between gap-3 px-4 py-3 ${
                  r.correct ? "bg-[#3df07a]/5" : isMe ? "bg-white/5" : ""
                }`}
                style={{ animationDelay: `${300 + ri * 50}ms` }}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <StatusDot correct={r.correct} answered={answered} delay={300 + ri * 50 + 140} />
                  <Avatar name={r.name} src={avatarOf[r.id]} size={24} />
                  <span className="truncate font-geist text-sm font-medium text-white">{r.name}</span>
                  {r.currentStreak > 1 && (
                    <span className="font-console text-xs font-bold text-[#f5a623]">
                      🔥 x{r.currentStreak}
                    </span>
                  )}
                </span>
                <span className="flex items-center gap-4 font-console text-xs tabular-nums">
                  <span className="text-dim">{answered ? `${r.answerTimeSeconds}s` : "—"}</span>
                  <span className={r.correct ? "text-[#3df07a] font-semibold" : "text-dim"}>
                    +{r.pointsEarned}
                  </span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <div style={{ animationDelay: "380ms" }}>
        <Leaderboard rows={leaderboard} myId={myId} title="Match Leaderboard" />
      </div>

      <ReactionBar onReact={onReact} />
    </div>
  );
}

function StatusDot({ correct, answered, delay = 0 }) {
  const cls = !answered ? "text-dim" : correct ? "text-[#3df07a]" : "text-[#ee0000]";
  const mark = !answered ? "○" : correct ? "✓" : "✗";
  return (
    <span className={`w-4 text-center font-geist font-bold text-sm ${cls}`}>
      <span className="inline-block animate-popin" style={{ animationDelay: `${delay}ms` }}>
        {mark}
      </span>
    </span>
  );
}

export default Reveal;
