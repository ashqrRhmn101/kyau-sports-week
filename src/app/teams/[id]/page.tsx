import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import PlayerCard from "@/components/PlayerCard";
import { teamLabel } from "@/lib/teamLabel";

export const revalidate = 20;

export default async function TeamDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("id, name, department, formation, is_champion, coach:coach_id(name, playing_style_notes), season:season_id(name)")
    .eq("id", params.id)
    .single();

  if (!team) return notFound();

  const { data: squadRows } = await supabase
    .from("team_players")
    .select("player:player_id(*)")
    .eq("team_id", params.id);

  const squad = (squadRows ?? []).map((r: any) => r.player).filter((p: any) => p?.status === "approved");

  return (
    <div className="pt-10">
      <p className="eyebrow mb-2">{(team as any).season?.name}</p>
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-5xl text-chalk-100">{teamLabel(team)}</h1>
        {team.is_champion && (
          <span className="status-pill bg-floodlight-500/15 text-floodlight-500 text-sm">🏆 চ্যাম্পিয়ন</span>
        )}
      </div>
      <p className="text-chalk-300 text-sm mb-2">{team.department}</p>
      {team.formation && (
        <p className="scoreboard-digit text-floodlight-500 mb-6">ফরমেশন: {team.formation}</p>
      )}

      <div className="card p-5 mb-8 max-w-lg">
        <p className="eyebrow mb-1">কোচ</p>
        <p className="text-chalk-100 font-medium">{(team as any).coach?.name ?? "নির্ধারিত হয়নি"}</p>
        {(team as any).coach?.playing_style_notes && (
          <p className="text-sm text-chalk-300 mt-2">{(team as any).coach.playing_style_notes}</p>
        )}
      </div>

      <h2 className="font-display text-2xl tracking-wide text-chalk-100 mb-4">স্কোয়াড</h2>
      {squad.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {squad.map((p: any) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center text-chalk-300">স্কোয়াড এখনো যোগ করা হয়নি।</div>
      )}
    </div>
  );
}
