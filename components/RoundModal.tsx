"use client";

import type { RoundRecord, Stats } from "@/lib/types";
import { Confetti } from "./Confetti";

export function RoundModal({
  round,
  player1,
  player2,
  stats,
  vsComputer,
  saving,
  error,
  onContinue,
  onStop,
}: {
  round: RoundRecord;
  player1: string;
  player2: string;
  stats: Stats;
  vsComputer: boolean;
  saving: boolean;
  error: string | null;
  onContinue: () => void;
  onStop: () => void;
}) {
  const winnerName = round.result === "X" ? player1 : round.result === "O" ? player2 : null;
  const cpuWon = vsComputer && round.result === "O";

  return (
    <>
      {winnerName && !cpuWon && <Confetti />}
      <div
        role="dialog"
        aria-modal="true"
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <div className="animate-fade-up w-full max-w-sm rounded-3xl border border-line bg-panel p-7 text-center shadow-2xl">
          <div className="text-5xl">{!winnerName ? "🤝" : cpuWon ? "🤖" : "🏆"}</div>
          <h2 className="mt-3 text-2xl font-black">
            {winnerName ? `${winnerName} wins round ${round.number}!` : `Round ${round.number} is a draw!`}
          </h2>
          <p className="mt-1 text-sm text-slate-400">Keep playing or end the session?</p>

          <div className="mt-5 grid grid-cols-3 rounded-2xl bg-ink p-3">
            <div>
              <div className="text-2xl font-black text-xcolor">{stats.player1Wins}</div>
              <div className="truncate text-[10px] uppercase text-slate-500">{player1}</div>
            </div>
            <div>
              <div className="text-2xl font-black text-slate-300">{stats.draws}</div>
              <div className="text-[10px] uppercase text-slate-500">Draws</div>
            </div>
            <div>
              <div className="text-2xl font-black text-ocolor">{stats.player2Wins}</div>
              <div className="truncate text-[10px] uppercase text-slate-500">{player2}</div>
            </div>
          </div>

          {error && (
            <p className="animate-shake mt-4 rounded-xl bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>
          )}

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={onStop}
              disabled={saving}
              className="rounded-2xl border border-line py-3 font-bold text-slate-300 transition hover:border-rose-400 hover:text-rose-300 disabled:opacity-50"
            >
              {saving ? "Saving…" : error ? "Retry Stop" : "Stop"}
            </button>
            <button
              autoFocus
              onClick={onContinue}
              disabled={saving}
              className="rounded-2xl bg-gradient-to-r from-xcolor to-ocolor py-3 font-black text-ink transition hover:scale-[1.03] disabled:opacity-50"
            >
              Continue
            </button>
          </div>
          <p className="mt-3 text-[11px] text-slate-500">Enter to continue · Esc to stop &amp; save</p>
        </div>
      </div>
    </>
  );
}
