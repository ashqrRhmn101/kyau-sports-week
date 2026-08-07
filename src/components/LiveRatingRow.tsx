"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { UserCircle2, Star } from "lucide-react";
import Swal from "sweetalert2";

interface Props {
  matchId: string;
  userId: string;
  player: { id: string; name: string; photo_url: string | null };
  avgRating: number | null;
  ratingCount: number;
  onRated: () => void;
}

export default function LiveRatingRow({ matchId, userId, player, avgRating, ratingCount, onRated }: Props) {
  const supabase = createClient();
  const [value, setValue] = useState(7);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const { error } = await supabase
      .from("player_live_ratings")
      .upsert(
        { match_id: matchId, player_id: player.id, rated_by: userId, rating: value },
        { onConflict: "match_id,player_id,rated_by" }
      );
    setSubmitting(false);
    if (error) {
      Swal.fire({ icon: "error", title: "রেটিং দেওয়া যায়নি", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    onRated();
  };

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-cardline last:border-none">
      <div className="w-9 h-9 rounded-full bg-pitch-800 border border-cardline overflow-hidden flex items-center justify-center shrink-0">
        {player.photo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
        ) : (
          <UserCircle2 className="text-chalk-300" size={18} />
        )}
      </div>
      <span className="text-sm text-chalk-100 flex-1 min-w-0 truncate">{player.name}</span>
      {avgRating != null && (
        <span className="text-xs text-floodlight-500 scoreboard-digit flex items-center gap-1 shrink-0">
          <Star size={12} fill="currentColor" /> {avgRating} ({ratingCount})
        </span>
      )}
      <input
        type="range"
        min={0}
        max={10}
        step={0.5}
        value={value}
        onChange={(e) => setValue(Number(e.target.value))}
        className="w-20 accent-floodlight-500 shrink-0"
      />
      <span className="scoreboard-digit text-sm text-chalk-100 w-7 shrink-0">{value}</span>
      <button
        onClick={submit}
        disabled={submitting}
        className="text-xs bg-floodlight-500 text-pitch-900 font-semibold px-2 py-1 rounded-md shrink-0"
      >
        দিন
      </button>
    </div>
  );
}
