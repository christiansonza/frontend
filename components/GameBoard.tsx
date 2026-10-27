"use client";

import type { Cell } from "@/lib/game";
import type { Mark } from "@/lib/types";
import { OMark, XMark } from "./Marks";

function cellCenter(i: number) {
  return { x: ((i % 3) * 2 + 1) * (100 / 6), y: (Math.floor(i / 3) * 2 + 1) * (100 / 6) };
}

export function GameBoard({
  board,
  winLine,
  finished,
  turn,
  interactive,
  onPlay,
}: {
  board: Cell[];
  winLine: number[] | null;
  finished: boolean;
  turn: Mark;
  interactive: boolean;
  onPlay: (index: number) => void;
}) {
  const line =
    winLine && winLine.length === 3
      ? (() => {
          const a = cellCenter(winLine[0]);
          const b = cellCenter(winLine[2]);
          const dx = (b.x - a.x) * 0.18;
          const dy = (b.y - a.y) * 0.18;
          return { x1: a.x - dx, y1: a.y - dy, x2: b.x + dx, y2: b.y + dy };
        })()
      : null;

  return (
    <div className="relative aspect-square w-full max-w-[min(440px,90vw)]">
      <div className="grid h-full w-full grid-cols-3 gap-3">
        {board.map((cell, i) => {
          const isWin = winLine?.includes(i);
          const clickable = interactive && !cell && !finished;
          return (
            <button
              key={i}
              onClick={() => onPlay(i)}
              disabled={!clickable}
              aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ""}`}
              className={`group relative flex items-center justify-center rounded-2xl border bg-panel transition ${
                isWin ? "animate-win border-yellow-400/70" : "border-line"
              } ${clickable ? "cursor-pointer hover:border-slate-500 hover:bg-[#1a1e36]" : "cursor-default"} ${
                finished && !isWin ? "opacity-50" : ""
              }`}
            >
              {cell === "X" && <XMark className="animate-pop h-3/4 w-3/4" />}
              {cell === "O" && <OMark className="animate-pop h-3/4 w-3/4" />}
              {!cell && clickable && (
                <span
                  className={`pointer-events-none text-5xl font-black opacity-0 transition group-hover:opacity-20 ${
                    turn === "X" ? "text-xcolor" : "text-ocolor"
                  }`}
                >
                  {turn === "X" ? "✕" : "◯"}
                </span>
              )}
              <span className="absolute left-2 top-1.5 font-mono text-[10px] text-slate-600">{i + 1}</span>
            </button>
          );
        })}
      </div>
      {line && (
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100">
          <line
            {...line}
            stroke="#facc15"
            strokeWidth="2.5"
            strokeLinecap="round"
            pathLength={100}
            className="draw-stroke"
            style={{ filter: "drop-shadow(0 0 4px rgba(250,204,21,0.8))" }}
          />
        </svg>
      )}
    </div>
  );
}
