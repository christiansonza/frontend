"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { boardFromMoves } from "@/lib/game";
import type { GameRecord, GameState } from "@/lib/types";
import { MiniBoard } from "./MiniBoard";
import { ReplayModal } from "./ReplayModal";

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function duration(game: GameRecord) {
  if (!game.startedAt) return null;
  const mins = Math.round((Date.parse(game.createdAt) - Date.parse(game.startedAt)) / 60000);
  return mins < 1 ? "<1 min" : `${mins} min`;
}

export function HomeDashboard({
  onStartNew,
  resumable,
  onResume,
  onDiscardResume,
  highlightId,
}: {
  onStartNew: () => void;
  resumable: GameState | null;
  onResume: () => void;
  onDiscardResume: () => void;
  highlightId: string | null;
}) {
  const [games, setGames] = useState<GameRecord[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [replay, setReplay] = useState<GameRecord | null>(null);
  const [slow, setSlow] = useState(false);

  const load = useCallback(async () => {
    setError(null);
    setSlow(false);
    const t = setTimeout(() => setSlow(true), 4000);
    try {
      setGames(await api.listGames());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load games");
    } finally {
      clearTimeout(t);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const all = useMemo(() => games ?? [], [games]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return all;
    return all.filter((g) => {
      const p1 = (g.player1 || "").toLowerCase();
      const p2 = (g.player2 || "").toLowerCase();
      return p1.includes(q) || p2.includes(q);
    });

  }, [all, query]);

  const totals = useMemo(
    () => ({
      sessions: all.length,
      rounds: all.reduce((n, g) => n + g.roundsPlayed, 0),
      draws: all.reduce((n, g) => n + g.draws, 0),
    }),
    [all],
  );

  const leaders = useMemo(() => {
    const table = new Map<string, { name: string; w: number; l: number; d: number; sessions: number }>();
    for (const g of all) {
      const sides: [string, number, number][] = [
        [g.player1, g.player1Wins, g.player2Wins],
        [g.player2, g.player2Wins, g.player1Wins],
      ];
      for (const [name, w, l] of sides) {
        if (!name) continue; 

        const key = name.toLowerCase();
        const row = table.get(key) ?? { name, w: 0, l: 0, d: 0, sessions: 0 };
        row.w += w;
        row.l += l;
        row.d += g.draws;
        row.sessions += 1;
        table.set(key, row);
      }
    }
    return [...table.values()].sort((a, b) => b.w - a.w || a.l - b.l || b.d - a.d).slice(0, 6);
  }, [all]);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="relative overflow-hidden rounded-3xl border border-line bg-panel/80 p-8 sm:p-12">
        <div className="pointer-events-none absolute -right-10 -top-10 select-none text-[14rem] font-black leading-none text-xcolor/5">
          ✕
        </div>
        <div className="pointer-events-none absolute -bottom-20 right-40 select-none text-[14rem] font-black leading-none text-ocolor/5">
          ◯
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-xcolor">Three in a row wins</p>
        <h1 className="mt-3 max-w-xl text-4xl font-black leading-tight sm:text-5xl">
          Challenge a friend or face the <span className="text-ocolor">unbeatable</span> CPU.
        </h1>
        <p className="mt-4 max-w-lg text-slate-400">
          Every round counts toward wins, losses and draws. Press Stop whenever you like and the session is saved
          here, with a move-by-move replay.
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-6">
          <button
            onClick={onStartNew}
            className="rounded-2xl bg-gradient-to-r from-xcolor to-ocolor px-7 py-4 text-lg font-black text-ink shadow-lg shadow-ocolor/20 transition hover:scale-[1.03] active:scale-[0.98]"
          >
            Start New Game →
          </button>
          <div className="flex gap-6 text-sm">
            <Stat label="Sessions" value={totals.sessions} />
            <Stat label="Rounds" value={totals.rounds} />
            <Stat label="Draws" value={totals.draws} />
          </div>
        </div>
      </section>

      {resumable && (
        <div className="animate-fade-up flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
          <p className="text-sm">
            <span className="font-bold text-emerald-300">Unfinished session:</span>{" "}
            <span className="text-xcolor">{resumable.config.player1}</span> vs{" "}
            <span className="text-ocolor">{resumable.config.player2}</span>{" "}
            <span className="text-slate-400">
              ({resumable.stats.player1Wins}–{resumable.stats.draws}–{resumable.stats.player2Wins}, round{" "}
              {resumable.round})
            </span>
          </p>
          <div className="flex gap-2">
            <button onClick={onDiscardResume} className="rounded-lg px-3 py-1.5 text-sm text-slate-400 hover:text-white">
              Discard
            </button>
            <button
              onClick={onResume}
              className="rounded-lg bg-emerald-500 px-4 py-1.5 text-sm font-bold text-ink hover:bg-emerald-400"
            >
              Resume
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* History */}
        <section>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-black">Previous games</h2>
            {all.length > 0 && (
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search player…"
                className="w-48 rounded-xl border border-line bg-panel px-3 py-2 text-sm outline-none placeholder:text-slate-600 focus:border-xcolor"
              />
            )}
          </div>

          {error ? (
            <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-6 text-center">
              <p className="text-rose-200">⚠️ {error}</p>
              <button onClick={load} className="mt-3 rounded-xl bg-rose-500 px-4 py-2 text-sm font-bold text-white">
                Try again
              </button>
            </div>
          ) : games === null ? (
            <div className="space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-24 animate-pulse rounded-2xl border border-line bg-panel/60" />
              ))}
              {slow && (
                <p className="text-center text-xs text-slate-500">
                  Still connecting to the game server… make sure the backend is running.
                </p>
              )}
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-line p-10 text-center text-slate-400">
              {all.length === 0 ? (
                <>
                  No games yet. Hit <span className="font-semibold text-white">Start New Game</span> to play the first
                  one!
                </>
              ) : (
                <>No games match “{query}”.</>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {filtered.map((g, idx) => (
                <GameRow
                  key={g.id}
                  game={g}
                  idx={idx}
                  highlighted={g.id === highlightId}
                  onReplay={() => setReplay(g)}
                />
              ))}
            </ul>
          )}
        </section>

        {/* Leaderboard */}
        <aside>
          <h2 className="mb-4 text-xl font-black">Hall of fame</h2>
          <div className="rounded-2xl border border-line bg-panel/80 p-4">
            {leaders.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">Play a session to get on the board.</p>
            ) : (
              <ol className="space-y-2">
                {leaders.map((p, i) => (
                  <li key={p.name} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-white/5">
                    <span className="w-6 text-center text-lg">{["🥇", "🥈", "🥉"][i] ?? `${i + 1}.`}</span>
                    <div className="min-w-0 flex-1">
                      <div className="truncate font-bold">{p.name}</div>
                      <div className="text-xs text-slate-500">
                        {p.sessions} session{p.sessions === 1 ? "" : "s"} ·{" "}
                        {Math.round((p.w / Math.max(1, p.w + p.l + p.d)) * 100)}% win rate
                      </div>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-emerald-400">{p.w}W</span> <span className="text-rose-400">{p.l}L</span>{" "}
                      <span className="text-slate-400">{p.d}D</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </aside>
      </div>

      {replay && <ReplayModal game={replay} onClose={() => setReplay(null)} />}
    </div>
  );
}

function GameRow({
  game: g,
  idx,
  highlighted,
  onReplay,
}: {
  game: GameRecord;
  idx: number;
  highlighted: boolean;
  onReplay: () => void;
}) {
  const last = g.rounds[g.rounds.length - 1];
  const leader = g.player1Wins > g.player2Wins ? g.player1 : g.player2Wins > g.player1Wins ? g.player2 : null;
  const time = duration(g);

  return (
    <li
      className={`animate-fade-up flex flex-col gap-4 rounded-2xl border bg-panel/80 p-4 transition hover:border-slate-600 sm:flex-row sm:items-center ${
        highlighted ? "border-emerald-400/60 ring-2 ring-emerald-400/20" : "border-line"
      }`}
      style={{ animationDelay: `${Math.min(idx, 10) * 40}ms` }}
    >
      {last ? (
        <MiniBoard board={boardFromMoves(last.moves, last.starter)} winLine={last.winLine} />
      ) : (
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-md border border-dashed border-line text-xs text-slate-500">
          —
        </div>
      )}
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate font-bold text-xcolor">{g.player1}</span>
          <span className="text-slate-500">vs</span>
          <span className="truncate font-bold text-ocolor">
            {g.vsComputer ? "🤖 " : ""}
            {g.player2}
          </span>
          {g.vsComputer && g.difficulty && (
            <span className="rounded-full bg-line px-2 py-0.5 text-[10px] uppercase tracking-wider text-slate-300">
              {g.difficulty}
            </span>
          )}
          {highlighted && (
            <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-400">
              Just saved
            </span>
          )}
        </div>
        <div className="mt-1 text-xs text-slate-500">
          {formatDate(g.createdAt)} · {g.roundsPlayed} round{g.roundsPlayed === 1 ? "" : "s"}
          {time ? ` · ${time}` : ""} ·{" "}
          {leader ? <span className="text-yellow-300">🏆 {leader}</span> : "Tied"}
        </div>
        <div className="mt-2 flex flex-wrap gap-1">
          {g.rounds.slice(0, 30).map((r) => (
            <span
              key={r.number}
              title={`Round ${r.number}: ${r.result === "draw" ? "Draw" : r.result === "X" ? g.player1 : g.player2}`}
              className={`h-2 w-2 rounded-full ${
                r.result === "X" ? "bg-xcolor" : r.result === "O" ? "bg-ocolor" : "bg-slate-500"
              }`}
            />
          ))}
          {g.rounds.length > 30 && <span className="text-[10px] text-slate-500">+{g.rounds.length - 30}</span>}
        </div>
      </div>
      <div className="flex items-center gap-4">
        <div className="grid grid-cols-3 gap-3 text-center">
          <Score 
            label={`${(g.player1 || "Player 1").slice(0, 8)} W`} 
            value={g.player1Wins} 
            color="text-xcolor" 
          />
          <Score label="Draws" value={g.draws} color="text-slate-300" />
          <Score 
            label={`${(g.player2 || "Player 2").slice(0, 8)} W`} 
            value={g.player2Wins} 
            color="text-ocolor" 
          />

        </div>
        {g.rounds.length > 0 && (
          <button
            onClick={onReplay}
            className="rounded-lg bg-line px-3 py-1.5 text-xs font-bold text-white hover:bg-slate-600"
          >
            Replay
          </button>
        )}
      </div>
    </li>
  );
}

function Stat({ label, value, color }: { label: string; value: any; color?: string }) {
  // If the value is NaN or missing, turn it into 0 so React can print it cleanly
  const safeValue = isNaN(Number(value)) ? 0 : value;

  return (
    <div>
      <div className="text-2xl font-black">{safeValue}</div>
      <div className="text-xs uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}

function Score({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="w-14">
      <div className={`text-xl font-black ${color}`}>{value}</div>
      <div className="truncate text-[10px] uppercase tracking-wide text-slate-500">{label}</div>
    </div>
  );
}
