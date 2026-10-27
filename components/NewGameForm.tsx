"use client";

import { useState, type FormEvent } from "react";
import type { Difficulty, MatchConfig } from "@/lib/types";

export function NewGameForm({ onCancel, onStart }: { onCancel: () => void; onStart: (config: MatchConfig) => void }) {
  const [mode, setMode] = useState<"pvp" | "cpu">("pvp");
  const [player1, setPlayer1] = useState("");
  const [player2, setPlayer2] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [error, setError] = useState<string | null>(null);

  const p1 = player1.trim().replace(/\s+/g, " ");
  const p2 = mode === "cpu" ? "Computer" : player2.trim().replace(/\s+/g, " ");
  const canStart = Boolean(p1 && p2);

  function submit(e: FormEvent) {
    e.preventDefault();
    if (!p1 || !p2) return setError("Both player names are required");
    if (p1.toLowerCase() === p2.toLowerCase()) return setError("Players need different names");
    onStart({
      player1: p1,
      player2: p2,
      vsComputer: mode === "cpu",
      difficulty: mode === "cpu" ? difficulty : null,
      startedAt: new Date().toISOString(),
    });
  }

  return (
    <div className="mx-auto max-w-lg animate-fade-up pt-2">
      <button onClick={onCancel} className="text-sm text-slate-400 hover:text-white">
        ← Back home
      </button>
      <h1 className="mt-4 text-3xl font-black">New game session</h1>
      <p className="mt-1 text-slate-400">Who&apos;s playing?</p>

      <form onSubmit={submit} className="mt-6 space-y-5 rounded-3xl border border-line bg-panel/80 p-6">
        <div className="grid grid-cols-2 gap-2 rounded-2xl bg-ink p-1">
          {(
            [
              ["pvp", "👥 2 Players"],
              ["cpu", "🤖 vs Computer"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => {
                setMode(value);
                setError(null);
              }}
              className={`rounded-xl py-2.5 text-sm font-bold transition ${
                mode === value ? "bg-line text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <label className="block">
          <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-300">
            <span className="font-black text-xcolor">✕</span> Player 1
          </span>
          <input
            autoFocus
            value={player1}
            onChange={(e) => {
              setPlayer1(e.target.value);
              setError(null);
            }}
            maxLength={24}
            placeholder="Enter name"
            className="w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-xcolor"
          />
        </label>

        {mode === "pvp" ? (
          <label className="block">
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <span className="font-black text-ocolor">◯</span> Player 2
            </span>
            <input
              value={player2}
              onChange={(e) => {
                setPlayer2(e.target.value);
                setError(null);
              }}
              maxLength={24}
              placeholder="Enter name"
              className="w-full rounded-xl border border-line bg-ink px-4 py-3 outline-none transition placeholder:text-slate-600 focus:border-ocolor"
            />
          </label>
        ) : (
          <div>
            <span className="mb-1.5 flex items-center gap-2 text-sm font-semibold text-slate-300">
              <span className="font-black text-ocolor">◯</span> Computer difficulty
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(["easy", "medium", "hard"] as const).map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`rounded-xl border py-2.5 text-sm font-bold capitalize transition ${
                    difficulty === d
                      ? "border-ocolor bg-ocolor/10 text-ocolor"
                      : "border-line text-slate-400 hover:text-white"
                  }`}
                >
                  {d === "hard" ? "Unbeatable" : d}
                </button>
              ))}
            </div>
          </div>
        )}

        {error && <p className="animate-shake rounded-xl bg-rose-500/10 px-4 py-2.5 text-sm text-rose-300">{error}</p>}

        <button
          type="submit"
          disabled={!canStart}
          className="w-full rounded-2xl bg-gradient-to-r from-xcolor to-ocolor py-4 text-lg font-black text-ink transition enabled:hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-40"
        >
          Start
        </button>
        <p className="text-center text-xs text-slate-500">
          Player 1 plays ✕, Player 2 plays ◯. The opening move alternates each round.
        </p>
      </form>
    </div>
  );
}
