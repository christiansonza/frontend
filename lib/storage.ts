import type { GameState } from "./types";

const KEY = "ttt-active-session-v1";

/** Persist the in-progress session so a page refresh doesn't lose the match. */
export function saveActiveSession(state: GameState) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage unavailable */
  }
}

export function loadActiveSession(): GameState | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as GameState;
    if (
      typeof s?.config?.player1 !== "string" ||
      typeof s?.config?.player2 !== "string" ||
      !Array.isArray(s.moves) ||
      !Array.isArray(s.rounds) ||
      typeof s.round !== "number" ||
      typeof s.stats?.draws !== "number"
    ) {
      return null;
    }
    return s;
  } catch {
    return null;
  }
}

export function clearActiveSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
