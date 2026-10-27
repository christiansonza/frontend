"use client";

import { useEffect, useState, type ReactNode } from "react";
import { boardFromMoves, getOutcome } from "@/lib/game";
import type { GameRecord, Mark } from "@/lib/types";
import { OMark, XMark } from "./Marks";
import { MiniBoard } from "./MiniBoard";

export function ReplayModal({ game, onClose }: { game: GameRecord; onClose: () => void }) {
  const [selected, setSelected] = useState(game.rounds.length - 1);
  const round = game.rounds[selected];
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);

  useEffect(() => {
    if (!playing) return;
    if (step >= round.moves.length) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 550);
    return () => clearTimeout(t);
  }, [playing, step, round.moves.length]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const board = boardFromMoves(round.moves.slice(0, step), round.starter);
  const outcome = getOutcome(board);
  const name = (m: Mark) => (m === "X" ? game.player1 : game.player2);

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="animate-fade-up grid max-h-[90vh] w-full max-w-4xl gap-6 overflow-y-auto rounded-3xl border border-line bg-panel p-6 md:grid-cols-[1fr_320px]"
      >
        <section>
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">
                <span className="text-xcolor">{game.player1}</span> <span className="text-slate-500">vs</span>{" "}
                <span className="text-ocolor">{game.player2}</span>
              </h2>
              <p className="text-xs text-slate-500">
                {game.player1Wins} – {game.draws} – {game.player2Wins} · {game.roundsPlayed} rounds
              </p>
            </div>
            <button onClick={onClose} className="rounded-full bg-line px-3 py-1 text-sm hover:bg-slate-600" aria-label="Close">
              ✕
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {game.rounds.map((r, i) => (
              <button
                key={r.number}
                onClick={() => {
                  setSelected(i);
                  setStep(0);
                  setPlaying(true);
                }}
                className={`flex items-center gap-3 rounded-2xl border bg-ink/60 p-3 text-left transition hover:border-slate-500 ${
                  i === selected ? "border-yellow-400/60" : "border-line"
                }`}
              >
                <MiniBoard board={boardFromMoves(r.moves, r.starter)} winLine={r.winLine} />
                <div className="min-w-0">
                  <div className="text-xs text-slate-500">Round {r.number}</div>
                  <div
                    className={`truncate text-sm font-bold ${
                      r.result === "X" ? "text-xcolor" : r.result === "O" ? "text-ocolor" : "text-slate-300"
                    }`}
                  >
                    {r.result === "draw" ? "Draw" : `${name(r.result)} won`}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        <aside className="h-fit rounded-2xl border border-line bg-ink/60 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-black">Replay · Round {round.number}</h3>
            <span className="text-xs text-slate-500">
              Move {step}/{round.moves.length}
            </span>
          </div>
          <div className="mx-auto grid aspect-square w-full max-w-[260px] grid-cols-3 gap-2">
            {board.map((c, i) => (
              <div
                key={`${selected}-${i}`}
                className={`flex items-center justify-center rounded-xl border bg-panel ${
                  outcome?.line?.includes(i) ? "animate-win border-yellow-400/70" : "border-line"
                }`}
              >
                {c === "X" && <XMark className="animate-pop h-3/4 w-3/4" />}
                {c === "O" && <OMark className="animate-pop h-3/4 w-3/4" />}
              </div>
            ))}
          </div>
          <input
            type="range"
            min={0}
            max={round.moves.length}
            value={step}
            onChange={(e) => {
              setPlaying(false);
              setStep(Number(e.target.value));
            }}
            className="mt-5 w-full accent-yellow-400"
            aria-label="Replay position"
          />
          <div className="mt-3 grid grid-cols-4 gap-2 text-sm">
            <Ctl onClick={() => (setPlaying(false), setStep(0))}>⏮</Ctl>
            <Ctl onClick={() => (setPlaying(false), setStep((s) => Math.max(0, s - 1)))}>◀</Ctl>
            <Ctl
              onClick={() => {
                if (step >= round.moves.length) setStep(0);
                setPlaying((p) => !p);
              }}
            >
              {playing ? "⏸" : "▶"}
            </Ctl>
            <Ctl onClick={() => (setPlaying(false), setStep((s) => Math.min(round.moves.length, s + 1)))}>▶▶</Ctl>
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">{name(round.starter)} opened this round.</p>
        </aside>
      </div>
    </div>
  );
}

function Ctl({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button onClick={onClick} className="rounded-xl bg-line py-2 font-bold hover:bg-slate-600">
      {children}
    </button>
  );
}
