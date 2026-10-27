import type { Difficulty, Mark } from "@/lib/types";
import { OMark, XMark } from "./Marks";

export function PlayerCard({
  mark,
  name,
  wins,
  losses,
  draws,
  active,
  cpu,
}: {
  mark: Mark;
  name: string;
  wins: number;
  losses: number;
  draws: number;
  active: boolean;
  cpu?: Difficulty | null;
}) {
  const accent = mark === "X" ? "border-xcolor shadow-xcolor/20" : "border-ocolor shadow-ocolor/20";
  return (
    <div className={`rounded-3xl border bg-panel/80 p-5 transition ${active ? `${accent} shadow-lg` : "border-line"}`}>
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-ink">
          {mark === "X" ? <XMark className="h-8 w-8" /> : <OMark className="h-8 w-8" />}
        </div>
        <div className="min-w-0">
          <div className="truncate text-lg font-black">
            {cpu ? "🤖 " : ""}
            {name}
          </div>
          <div className="text-xs text-slate-500">
            {mark === "X" ? "Player 1" : "Player 2"}
            {cpu ? ` · ${cpu === "hard" ? "unbeatable" : cpu}` : ""}
          </div>
        </div>
        {active && <span className="ml-auto h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-400" />}
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <Stat value={wins} label="Wins" color="text-emerald-400" />
        <Stat value={losses} label="Losses" color="text-rose-400" />
        <Stat value={draws} label="Draws" color="text-slate-300" />
      </div>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="rounded-xl bg-ink py-2">
      <div key={value} className={`animate-pop text-xl font-black ${color}`}>
        {value}
      </div>
      <div className="text-[10px] uppercase tracking-wider text-slate-500">{label}</div>
    </div>
  );
}
