"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { useTicTacToe } from "@/hooks/useTicTacToe";
import { api } from "@/lib/api";
import { other } from "@/lib/game";
import { sfx } from "@/lib/sound";
import { clearActiveSession } from "@/lib/storage";
import type { GameState, Mark, RoundRecord } from "@/lib/types";
import { GameBoard } from "./GameBoard";
import { PlayerCard } from "./PlayerCard";
import { RoundModal } from "./RoundModal";

export function GameSession({
  initial,
  onExit,
}: {
  initial: GameState;
  onExit: (savedGameId: string | null) => void;
}) {
  const { state, board, outcome, turn, starter, isCpuTurn, play, nextRound } = useTicTacToe(initial);
  const { config, stats, rounds } = state;

  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    const m = localStorage.getItem("ttt-muted") === "1";
    mutedRef.current = m;
    setMuted(m);
  }, []);

  // Sound effect for every new move.
  const prevMoves = useRef(state.moves.length);
  useEffect(() => {
    const len = state.moves.length;
    if (len > prevMoves.current && !mutedRef.current) {
      if (outcome?.result === "draw") sfx.draw();
      else if (outcome) sfx.win();
      else ((len - 1) % 2 === 0 ? starter : other(starter)) === "X" ? sfx.x() : sfx.o();
    }
    prevMoves.current = len;
  }, [state.moves.length, outcome, starter]);

  // Pause, let the win line animate, then show the Continue / Stop overlay.
  useEffect(() => {
    if (state.phase !== "roundOver") {
      setShowModal(false);
      return;
    }
    const t = setTimeout(() => setShowModal(true), 700);
    return () => clearTimeout(t);
  }, [state.phase, state.round]);

  const handleContinue = useCallback(() => {
    if (saving) return;
    setSaveError(null);
    nextRound();
  }, [nextRound, saving]);

  // Stop: ship the session stats to MongoDB and go back to the dashboard.
  const handleStop = useCallback(async () => {
    if (saving) return;
    setSaving(true);
    setSaveError(null);
    try {
      const saved = await api.saveGame({
        player1: config.player1,
        player2: config.player2,
        roundsPlayed: rounds.length,
        player1Wins: stats.player1Wins,
        player2Wins: stats.player2Wins,
        draws: stats.draws,
        vsComputer: config.vsComputer,
        difficulty: config.difficulty,
        startedAt: config.startedAt,
        rounds,
      });
      clearActiveSession();
      onExit(saved.id);
    } catch (e) {
      setSaveError(e instanceof Error ? e.message : "Could not save the game");
      setSaving(false);
    }
  }, [config, rounds, stats, saving, onExit]);

  function handleQuit() {
    if (rounds.length > 0 && !window.confirm("Leave without saving? This session's results will be discarded.")) {
      return;
    }
    clearActiveSession();
    onExit(null);
  }

  // Keyboard: 1-9 place a mark, Enter = Continue, Esc = Stop.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (showModal) {
        if (e.key === "Enter") {
          e.preventDefault();
          handleContinue();
        }
        if (e.key === "Escape") void handleStop();
        return;
      }
      const n = Number(e.key);
      if (n >= 1 && n <= 9 && state.phase === "playing") play(n - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showModal, state.phase, play, handleContinue, handleStop]);

  const nameOf = (m: Mark) => (m === "X" ? config.player1 : config.player2);
  const lastRound = rounds[rounds.length - 1];

  let status: ReactNode;
  if (outcome?.result === "draw") status = <span className="text-slate-300">It&apos;s a draw!</span>;
  else if (outcome)
    status = (
      <span className={outcome.result === "X" ? "text-xcolor" : "text-ocolor"}>{nameOf(outcome.result)} wins! 🎉</span>
    );
  else
    status = (
      <span>
        <span className={turn === "X" ? "text-xcolor" : "text-ocolor"}>{nameOf(turn)}</span>
        <span className="text-slate-400">{isCpuTurn ? " is thinking…" : "'s turn"}</span>
      </span>
    );

  return (
    <div className="animate-fade-up">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <button onClick={handleQuit} className="text-sm text-slate-400 hover:text-white">
          ← Quit without saving
        </button>
        <div className="flex items-center gap-2">
          <span key={state.round} className="animate-pop rounded-full border border-line bg-panel px-3 py-1 text-sm font-bold">
            Round {state.round}
          </span>
          <button
            onClick={() => {
              const m = !muted;
              setMuted(m);
              mutedRef.current = m;
              localStorage.setItem("ttt-muted", m ? "1" : "0");
            }}
            className="rounded-full border border-line bg-panel px-3 py-1 text-sm"
            aria-label={muted ? "Unmute" : "Mute"}
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      <div className="grid items-start gap-8 lg:grid-cols-[260px_1fr_260px]">
        <PlayerCard
          mark="X"
          name={config.player1}
          wins={stats.player1Wins}
          losses={stats.player2Wins}
          draws={stats.draws}
          active={!outcome && turn === "X"}
        />

        <div className="flex flex-col items-center">
          <div className="mb-5 h-8 text-center text-2xl font-black">{status}</div>
          <GameBoard
            board={board}
            winLine={outcome?.line ?? null}
            finished={Boolean(outcome)}
            turn={turn}
            interactive={state.phase === "playing" && !isCpuTurn}
            onPlay={play}
          />
          <p className="mt-4 text-center text-xs text-slate-500">
            Tip: use keys <kbd className="rounded bg-line px-1">1</kbd>–<kbd className="rounded bg-line px-1">9</kbd> to
            play. {nameOf(starter)} opens this round.
          </p>
        </div>

        <div className="space-y-6">
          <PlayerCard
            mark="O"
            name={config.player2}
            wins={stats.player2Wins}
            losses={stats.player1Wins}
            draws={stats.draws}
            active={!outcome && turn === "O"}
            cpu={config.vsComputer ? config.difficulty : null}
          />
          <RoundLog rounds={rounds} player1={config.player1} player2={config.player2} />
        </div>
      </div>

      {showModal && lastRound && (
        <RoundModal
          round={lastRound}
          player1={config.player1}
          player2={config.player2}
          stats={stats}
          vsComputer={config.vsComputer}
          saving={saving}
          error={saveError}
          onContinue={handleContinue}
          onStop={handleStop}
        />
      )}
    </div>
  );
}

function RoundLog({ rounds, player1, player2 }: { rounds: RoundRecord[]; player1: string; player2: string }) {
  if (!rounds.length) {
    return (
      <div className="rounded-3xl border border-dashed border-line p-5 text-center text-sm text-slate-500">
        Round results will appear here.
      </div>
    );
  }
  return (
    <div className="rounded-3xl border border-line bg-panel/80 p-5">
      <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-400">Round log</h3>
      <ul className="max-h-60 space-y-1.5 overflow-y-auto pr-1 text-sm">
        {[...rounds].reverse().map((r) => (
          <li key={r.number} className="flex items-center justify-between">
            <span className="text-slate-500">#{r.number}</span>
            <span
              className={`font-semibold ${
                r.result === "X" ? "text-xcolor" : r.result === "O" ? "text-ocolor" : "text-slate-400"
              }`}
            >
              {r.result === "draw" ? "Draw" : `${r.result === "X" ? player1 : player2} won`}
            </span>
            <span className="text-xs text-slate-600">{r.moves.length} moves</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
