"use client";

import { useCallback, useEffect, useReducer } from "react";
import { bestMove, boardFromMoves, getOutcome, other } from "@/lib/game";
import { saveActiveSession } from "@/lib/storage";
import type { GameState, Mark, MatchConfig } from "@/lib/types";

/** Player 1 (X) opens odd rounds, Player 2 (O) opens even rounds. */
export const starterForRound = (round: number): Mark => (round % 2 === 1 ? "X" : "O");

export function createInitialState(config: MatchConfig): GameState {
  return {
    config,
    round: 1,
    moves: [],
    stats: { player1Wins: 0, player2Wins: 0, draws: 0 },
    rounds: [],
    phase: "playing",
  };
}

type Action = { type: "move"; index: number } | { type: "continue" };

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case "move": {
      if (state.phase !== "playing") return state;
      const starter = starterForRound(state.round);
      const board = boardFromMoves(state.moves, starter);
      if (action.index < 0 || action.index > 8 || board[action.index]) return state;

      const moves = [...state.moves, action.index];
      const outcome = getOutcome(boardFromMoves(moves, starter));
      if (!outcome) return { ...state, moves };

      // Round finished: increment wins / draws and log the round.
      return {
        ...state,
        moves,
        phase: "roundOver",
        stats: {
          player1Wins: state.stats.player1Wins + (outcome.result === "X" ? 1 : 0),
          player2Wins: state.stats.player2Wins + (outcome.result === "O" ? 1 : 0),
          draws: state.stats.draws + (outcome.result === "draw" ? 1 : 0),
        },
        rounds: [
          ...state.rounds,
          { number: state.round, starter, moves, result: outcome.result, winLine: outcome.line ?? [] },
        ],
      };
    }
    case "continue":
      // Clear the board matrix and bump the round count.
      if (state.phase !== "roundOver") return state;
      return { ...state, round: state.round + 1, moves: [], phase: "playing" };
    default:
      return state;
  }
}

/** All gameplay state for an active session: board, turn, scores, round log, CPU opponent. */
export function useTicTacToe(initial: GameState) {
  const [state, dispatch] = useReducer(reducer, initial);

  const starter = starterForRound(state.round);
  const board = boardFromMoves(state.moves, starter);
  const outcome = getOutcome(board);
  const turn: Mark = state.moves.length % 2 === 0 ? starter : other(starter);
  const isCpuTurn = state.config.vsComputer && state.phase === "playing" && turn === "O";

  // Auto-save progress locally (refresh-safe).
  useEffect(() => {
    saveActiveSession(state);
  }, [state]);

  // Computer opponent plays O.
  useEffect(() => {
    if (!isCpuTurn) return;
    const t = setTimeout(
      () => {
        const current = boardFromMoves(state.moves, starter);
        dispatch({ type: "move", index: bestMove(current, "O", state.config.difficulty ?? "hard") });
      },
      450 + Math.random() * 350,
    );
    return () => clearTimeout(t);
  }, [isCpuTurn, state.moves, starter, state.config.difficulty]);

  const play = useCallback(
    (index: number) => {
      if (isCpuTurn) return;
      dispatch({ type: "move", index });
    },
    [isCpuTurn],
  );

  const nextRound = useCallback(() => dispatch({ type: "continue" }), []);

  return { state, board, outcome, turn, starter, isCpuTurn, play, nextRound };
}
