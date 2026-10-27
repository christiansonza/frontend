"use client";

import { useState, type CSSProperties } from "react";

const COLORS = ["#22d3ee", "#f472b6", "#facc15", "#a78bfa", "#34d399"];

export function Confetti({ count = 80 }: { count?: number }) {
  const [pieces] = useState(() =>
    Array.from({ length: count }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      color: COLORS[i % COLORS.length],
      dur: 2.2 + Math.random() * 1.8,
      delay: Math.random() * 0.6,
      drift: (Math.random() - 0.5) * 200,
      round: Math.random() > 0.6,
    })),
  );
  return (
    <>
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti"
          style={
            {
              left: `${p.left}vw`,
              background: p.color,
              borderRadius: p.round ? "999px" : "2px",
              "--dur": `${p.dur}s`,
              "--delay": `${p.delay}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </>
  );
}
