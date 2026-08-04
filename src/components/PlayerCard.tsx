import Link from "next/link";
import type { Player } from "@/lib/types";

const positionLabel: Record<Player["position"], string> = {
  GK: "গোলকিপার",
  DEF: "ডিফেন্ডার",
  MID: "মিডফিল্ডার",
  FWD: "ফরোয়ার্ড",
};

export default function PlayerCard({ player }: { player: Player }) {
  return (
    <Link
      href={`/players/${player.id}`}
      className="card p-4 flex items-center gap-4 hover:border-floodlight-500/60 transition-colors group"
    >
      <div className="relative shrink-0">
        <div className="w-14 h-14 rounded-full bg-pitch-700 overflow-hidden flex items-center justify-center font-display text-2xl text-chalk-300">
          {player.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            player.name.charAt(0)
          )}
        </div>
        {player.jersey_no != null && (
          <span className="absolute -bottom-1 -right-1 scoreboard-digit text-[11px] bg-floodlight-500 text-pitch-900 rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {player.jersey_no}
          </span>
        )}
      </div>
      <div className="min-w-0">
        <p className="font-semibold text-chalk-100 truncate group-hover:text-floodlight-500 transition-colors">
          {player.name}
        </p>
        <p className="text-sm text-chalk-300">
          {positionLabel[player.position]} · {player.department}
        </p>
      </div>
    </Link>
  );
}
