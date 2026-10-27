import type { GameRecord, NewGameRecord } from "./types";

export const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/+$/, "");

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
      cache: "no-store",
    });
  } catch {
    throw new Error("Can't reach the game server. Make sure the backend is running.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}

export const api = {
  /** GET /api/games - match history, newest first */
  listGames: () => request<GameRecord[]>("/api/games"),
  /** POST /api/games - save a completed session */
  saveGame: (game: NewGameRecord) =>
    request<GameRecord>("/api/games", { method: "POST", body: JSON.stringify(game) }),
};
