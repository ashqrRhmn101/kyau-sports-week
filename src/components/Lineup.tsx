"use client";

import { UserCircle2 } from "lucide-react";

interface LineupPlayer {
  id: string;
  name: string;
  photo_url: string | null;
  position: "GK" | "DEF" | "MID" | "FWD";
}

// "4-3-3" স্ট্রিং থেকে DEF/MID/FWD এর সংখ্যা বের করা হয়
// "4-2-3-1"-এর মতো ৪-সংখ্যার ফরমেশন হলে মাঝের দুইটা লাইন MID হিসেবে একসাথে গণনা করা হয়
function parseFormation(formation: string | null): { def: number; mid: number; fwd: number } {
  const fallback = { def: 4, mid: 4, fwd: 2 };
  if (!formation) return fallback;
  const parts = formation
    .split(/[-x,]/)
    .map((n) => parseInt(n.trim(), 10))
    .filter((n) => !isNaN(n) && n > 0);
  if (parts.length === 3) return { def: parts[0], mid: parts[1], fwd: parts[2] };
  if (parts.length === 4) return { def: parts[0], mid: parts[1] + parts[2], fwd: parts[3] };
  if (parts.length === 2) return { def: parts[0], mid: parts[1], fwd: 0 };
  return fallback;
}

function PlayerIcon({ player }: { player: LineupPlayer }) {
  return (
    <div className="flex flex-col items-center gap-1 w-14 shrink-0">
      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-pitch-900 border-2 border-chalk-100/80 overflow-hidden flex items-center justify-center shadow">
        {player.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
        ) : (
          <UserCircle2 className="text-chalk-300" size={20} />
        )}
      </div>
      <span className="text-[10px] leading-tight text-chalk-100 text-center truncate w-full">
        {player.name.split(" ")[0]}
      </span>
      <span className="scoreboard-digit text-[9px] leading-none text-floodlight-500/90">{player.position}</span>
    </div>
  );
}

export default function Lineup({
  squad,
  formation,
  teamName,
}: {
  squad: LineupPlayer[];
  formation: string | null;
  teamName: string;
}) {
  const { def, mid, fwd } = parseFormation(formation);
  const gk = squad.filter((p) => p.position === "GK").slice(0, 1);
  const defenders = squad.filter((p) => p.position === "DEF").slice(0, def);
  const midfielders = squad.filter((p) => p.position === "MID").slice(0, mid);
  const forwards = squad.filter((p) => p.position === "FWD").slice(0, fwd);

  const rows = [forwards, midfielders, defenders, gk].filter((r) => r.length > 0);

  return (
    <div className="rounded-xl overflow-hidden border border-cardline">
      <div className="bg-pitch-700 px-3 py-2 text-center">
        <p className="text-xs text-chalk-100 font-semibold">{teamName}</p>
        {formation && <p className="text-[10px] text-chalk-300 scoreboard-digit">{formation}</p>}
      </div>
      <div
        className="p-3 sm:p-5 flex flex-col justify-between gap-4 sm:gap-6 min-h-[300px]"
        style={{
          background:
            "repeating-linear-gradient(0deg, #1F6E43, #1F6E43 40px, #22753f 40px, #22753f 80px)",
        }}
      >
        {rows.length === 0 ? (
          <p className="text-center text-chalk-100/80 text-sm py-10">স্কোয়াড এখনো যোগ করা হয়নি।</p>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="flex justify-around">
              {row.map((p) => (
                <PlayerIcon key={p.id} player={p} />
              ))}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
