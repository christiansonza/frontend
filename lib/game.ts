import type { Difficulty, Mark, RoundResult } from "./types";

export type Cell = Mark | null;

export const LINES: number[][] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export const other = (m: Mark): Mark => (m === "X" ? "O" : "X");

export function boardFromMoves(moves: number[], starter: Mark): Cell[] {
  const board: Cell[] = Array(9).fill(null);
  moves.forEach((idx, i) => {
    board[idx] = i % 2 === 0 ? starter : other(starter);
  });
  return board;
}

export function getWinner(board: Cell[]): { winner: Mark; line: number[] } | null {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a] as Mark, line };
    }
  }
  return null;
}

export function getOutcome(board: Cell[]): { result: RoundResult; line: number[] | null } | null {
  const w = getWinner(board);
  if (w) return { result: w.winner, line: w.line };
  if (board.every(Boolean)) return { result: "draw", line: null };
  return null;
}

function minimax(board: Cell[], turn: Mark, ai: Mark, depth: number): number {
  const outcome = getOutcome(board);
  if (outcome) {
    if (outcome.result === "draw") return 0;
    return outcome.result === ai ? 10 - depth : depth - 10;
  }
  const scores: number[] = [];
  for (let i = 0; i < 9; i++) {
    if (board[i]) continue;
    board[i] = turn;
    scores.push(minimax(board, other(turn), ai, depth + 1));
    board[i] = null;
  }
  return turn === ai ? Math.max(...scores) : Math.min(...scores);
}

export function bestMove(board: Cell[], ai: Mark, difficulty: Difficulty): number {
  const empty = board.map((c, i) => (c ? -1 : i)).filter((i) => i >= 0);
  const randomPick = () => empty[Math.floor(Math.random() * empty.length)];
  if (difficulty === "easy" && Math.random() < 0.8) return randomPick();
  if (difficulty === "medium" && Math.random() < 0.4) return randomPick();

  let best = -Infinity;
  let choices: number[] = [];
  const copy = [...board];
  for (const i of empty) {
    copy[i] = ai;
    const score = minimax(copy, other(ai), ai, 1);
    copy[i] = null;
    if (score > best) {
      best = score;
      choices = [i];
    } else if (score === best) {
      choices.push(i);
    }
  }
  return choices[Math.floor(Math.random() * choices.length)];
}
