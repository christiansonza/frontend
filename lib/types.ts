export type Mark = "X" | "O";
export type RoundResult = Mark | "draw";
export type Difficulty = "easy" | "medium" | "hard";

export type RoundRecord = {
  number: number;
  starter: Mark;
  moves: number[];
  result: RoundResult;
  winLine: number[];
};

/** A saved game as returned by the Express API. */
export type GameRecord = {
  id: string;
  player1: string;
  player2: string;
  roundsPlayed: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  vsComputer: boolean;
  difficulty: Difficulty | null;
  rounds: RoundRecord[];
  startedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

/** Body sent to POST /api/games when players press "Stop". */
export type NewGameRecord = {
  player1: string;
  player2: string;
  roundsPlayed: number;
  player1Wins: number;
  player2Wins: number;
  draws: number;
  vsComputer: boolean;
  difficulty: Difficulty | null;
  startedAt: string;
  rounds: RoundRecord[];
};

export type MatchConfig = {
  player1: string;
  player2: string;
  vsComputer: boolean;
  difficulty: Difficulty | null;
  startedAt: string;
};

export type Stats = { player1Wins: number; player2Wins: number; draws: number };

/** Live state of an in-progress session (held in the useTicTacToe hook). */
export type GameState = {
  config: MatchConfig;
  round: number;
  moves: number[];
  stats: Stats;
  rounds: RoundRecord[];
  phase: "playing" | "roundOver";
};
