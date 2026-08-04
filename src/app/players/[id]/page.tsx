import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const revalidate = 20;

const positionLabel: Record<string, string> = {
  GK: "গোলকিপার",
  DEF: "ডিফেন্ডার",
  MID: "মিডফিল্ডার",
  FWD: "ফরোয়ার্ড",
};

export default async function PlayerProfilePage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: player } = await supabase.from("players").select("*").eq("id", params.id).single();
  if (!player) return notFound();

  const { data: stats } = await supabase
    .from("player_season_stats")
    .select("*")
    .eq("player_id", params.id);

  const totals = (stats ?? []).reduce(
    (acc, s: any) => ({
      goals: acc.goals + (s.goals ?? 0),
      assists: acc.assists + (s.assists ?? 0),
      yellow: acc.yellow + (s.yellow_cards ?? 0),
      red: acc.red + (s.red_cards ?? 0),
      matches: acc.matches + (s.matches_played ?? 0),
    }),
    { goals: 0, assists: 0, yellow: 0, red: 0, matches: 0 }
  );

  const statCards = [
    { label: "ম্যাচ", value: totals.matches },
    { label: "গোল", value: totals.goals },
    { label: "অ্যাসিস্ট", value: totals.assists },
    { label: "হলুদ কার্ড", value: totals.yellow },
    { label: "লাল কার্ড", value: totals.red },
  ];

  return (
    <div className="pt-10">
      <div className="card p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center mb-8">
        <div className="w-24 h-24 rounded-full bg-pitch-700 overflow-hidden flex items-center justify-center font-display text-4xl text-chalk-300 shrink-0">
          {player.photo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={player.photo_url} alt={player.name} className="w-full h-full object-cover" />
          ) : (
            player.name.charAt(0)
          )}
        </div>
        <div>
          <p className="eyebrow mb-1">{positionLabel[player.position]}</p>
          <h1 className="font-display text-4xl text-chalk-100">{player.name}</h1>
          <p className="text-chalk-300 mt-1">
            {player.department}
            {player.jersey_no != null && (
              <span className="scoreboard-digit ml-2 text-floodlight-500">#{player.jersey_no}</span>
            )}
          </p>
        </div>
      </div>

      {player.bio && (
        <p className="text-chalk-300 mb-8 max-w-2xl leading-relaxed">{player.bio}</p>
      )}

      <h2 className="font-display text-2xl tracking-wide text-chalk-100 mb-4">সিজন স্ট্যাটস</h2>
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {statCards.map((s) => (
          <div key={s.label} className="card p-4 text-center">
            <p className="scoreboard-digit text-3xl font-bold text-floodlight-500">{s.value}</p>
            <p className="text-xs text-chalk-300 mt-1">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
