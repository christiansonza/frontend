import type { Cell } from "@/lib/game";

export function MiniBoard({
  board,
  winLine,
  size = "sm",
}: {
  board: Cell[];
  winLine?: number[] | null;
  size?: "sm" | "md";
}) {
  const dim = size === "sm" ? "h-14 w-14 text-[10px]" : "h-28 w-28 text-lg";
  return (
    <div className={`grid shrink-0 grid-cols-3 gap-[2px] rounded-md bg-line p-[2px] ${dim}`}>
      {board.map((c, i) => (
        <div
          key={i}
          className={`flex items-center justify-center rounded-[3px] font-black ${
            winLine?.includes(i) ? "bg-yellow-400/25" : "bg-panel"
          } ${c === "X" ? "text-xcolor" : "text-ocolor"}`}
        >
          {c === "X" ? "✕" : c === "O" ? "◯" : ""}
        </div>
      ))}
    </div>
  );
}
