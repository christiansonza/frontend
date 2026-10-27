"use client";

import { useEffect, useState } from "react";
import { GameSession } from "@/components/GameSession";
import { HomeDashboard } from "@/components/HomeDashboard";
import { NewGameForm } from "@/components/NewGameForm";
import { createInitialState } from "@/hooks/useTicTacToe";
import { clearActiveSession, loadActiveSession } from "@/lib/storage";
import type { GameState, MatchConfig } from "@/lib/types";

type View = { name: "home" } | { name: "setup" } | { name: "playing"; initial: GameState };

/**
 * Single-page app flow:
 *   Home Dashboard -> (Start New Game) -> New Game Session form -> (Start) -> Gameplay
 *   Gameplay round end -> Continue (next round) | Stop (save to MongoDB, back to Home)
 */
export default function Page() {
  const [view, setView] = useState<View>({ name: "home" });
  const [resumable, setResumable] = useState<GameState | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  // Offer to resume a session interrupted by a refresh / closed tab.
  useEffect(() => {
    const s = loadActiveSession();
    if (s && (s.rounds.length > 0 || s.moves.length > 0)) setResumable(s);
    else if (s) clearActiveSession();
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [view.name]);

  function startMatch(config: MatchConfig) {
    clearActiveSession();
    setResumable(null);
    setSavedId(null);
    setView({ name: "playing", initial: createInitialState(config) });
  }

  function exitMatch(id: string | null) {
    setResumable(null);
    setSavedId(id);
    setView({ name: "home" });
  }

  const playing = view.name === "playing";

  return (
    <>
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-5">
        <button
          onClick={() => !playing && setView({ name: "home" })}
          className={`group flex items-center gap-2 text-lg font-black tracking-tight ${playing ? "cursor-default" : ""}`}
        >
          <span className="text-xcolor transition group-hover:rotate-12">✕</span>
          <span className="text-ocolor transition group-hover:-rotate-12">◯</span>
          <span className="ml-1">Tic·Tac·Toe Arena</span>
        </button>
        {view.name === "home" && (
          <button
            onClick={() => setView({ name: "setup" })}
            className="rounded-full border border-line bg-panel px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-xcolor/60 hover:text-white"
          >
            + New game
          </button>
        )}
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-16">
        {view.name === "home" && (
          <HomeDashboard
            onStartNew={() => setView({ name: "setup" })}
            resumable={resumable}
            onResume={() => resumable && setView({ name: "playing", initial: resumable })}
            onDiscardResume={() => {
              clearActiveSession();
              setResumable(null);
            }}
            highlightId={savedId}
          />
        )}
        {view.name === "setup" && <NewGameForm onCancel={() => setView({ name: "home" })} onStart={startMatch} />}
        {view.name === "playing" && <GameSession initial={view.initial} onExit={exitMatch} />}
      </main>

      <footer className="pb-8 text-center text-xs text-slate-600">
        Next.js · Tailwind CSS · TypeScript · Express · MongoDB
      </footer>
    </>
  );
}
