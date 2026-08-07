import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { UserCircle2 } from "lucide-react";

export const revalidate = 20;

function Board({
  title,
  rows,
  valueKey,
  unit,
}: {
  title: string;
  rows: any[];
  valueKey: string;
  unit: string;
}) {
  return (
    <div className="card">
      <h3 className="font-display text-xl tracking-wide text-chalk-100 px-4 pt-4 pb-2">{title}</h3>
      {rows.length > 0 ? (
        <ol>
          {rows.map((r, i) => (
            <li
              key={r.player_id}
              className="flex items-center justify-between px-4 py-2.5 border-t border-cardline"
            >
              <span className="flex items-center gap-3 min-w-0">
                <span className="scoreboard-digit text-floodlight-500 w-5 text-sm shrink-0">{i + 1}</span>
                <span className="w-8 h-8 rounded-full bg-pitch-800 border border-cardline overflow-hidden flex items-center justify-center shrink-0">
                  {r.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={r.photo_url} alt={r.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 className="text-chalk-300" size={18} />
                  )}
                </span>
                <Link href={`/players/${r.player_id}`} className="truncate text-chalk-100 hover:text-floodlight-500">
                  {r.name}
                  <span className="block text-xs text-chalk-300">{r.department}</span>
                </Link>
              </span>
              <span className="scoreboard-digit font-bold text-chalk-100 shrink-0">
                {r[valueKey]} <span className="text-xs text-chalk-300 font-normal">{unit}</span>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-chalk-300 text-sm px-4 pb-4">এখনো কোনো ডেটা নেই।</p>
      )}
    </div>
  );
}

export default async function LeaderboardPage() {
  const supabase = createClient();
  const { data: all } = await supabase.from("player_season_stats").select("*");

  const rows = all ?? [];
  const topScorers = [...rows].sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0)).slice(0, 10);
  const topAssists = [...rows].sort((a, b) => (b.assists ?? 0) - (a.assists ?? 0)).slice(0, 10);
  const topRated = [...rows]
    .filter((r) => r.avg_rating != null)
    .sort((a, b) => (b.avg_rating ?? 0) - (a.avg_rating ?? 0))
    .slice(0, 10);
  const mostCards = [...rows]
    .map((r) => ({ ...r, total_cards: (r.yellow_cards ?? 0) + (r.red_cards ?? 0) }))
    .sort((a, b) => b.total_cards - a.total_cards)
    .slice(0, 10);

  return (
    <div className="pt-10">
      <p className="eyebrow mb-2">র‍্যাংকিং</p>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">লিডারবোর্ড</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <Board title="টপ স্কোরার" rows={topScorers} valueKey="goals" unit="গোল" />
        <Board title="টপ অ্যাসিস্ট" rows={topAssists} valueKey="assists" unit="অ্যাসিস্ট" />
        <Board title="সর্বোচ্চ গড় রেটিং" rows={topRated} valueKey="avg_rating" unit="রেটিং" />
        <Board title="সর্বোচ্চ কার্ড" rows={mostCards} valueKey="total_cards" unit="কার্ড" />
      </div>
    </div>
  );
}
