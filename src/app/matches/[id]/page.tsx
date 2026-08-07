"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Lineup from "@/components/Lineup";
import LiveRatingRow from "@/components/LiveRatingRow";
import { ClipLoader } from "react-spinners";

const eventLabel: Record<string, string> = {
  goal: "⚽ গোল",
  assist: "🎯 অ্যাসিস্ট",
  yellow_card: "🟨 হলুদ কার্ড",
  red_card: "🟥 লাল কার্ড",
  sub_in: "🔄 সাব ইন",
  sub_out: "🔄 সাব আউট",
};

export default function MatchDetailPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [match, setMatch] = useState<any>(null);
  const [eventsA, setEventsA] = useState<any[]>([]);
  const [eventsB, setEventsB] = useState<any[]>([]);
  const [squadA, setSquadA] = useState<any[]>([]);
  const [squadB, setSquadB] = useState<any[]>([]);
  const [ratingAverages, setRatingAverages] = useState<Record<string, { avg_rating: number; rating_count: number }>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data: m } = await supabase
      .from("matches")
      .select(
        "id, date, referee_name, score_a, score_b, status, team_a:team_a_id(id, department, formation), team_b:team_b_id(id, department, formation)"
      )
      .eq("id", params.id)
      .single<any>();
    setMatch(m);
    if (!m) {
      setLoading(false);
      return;
    }

    const teamAId = m.team_a?.id;
    const teamBId = m.team_b?.id;

    const [{ data: sqA }, { data: sqB }, { data: ev }, { data: ratings }] = await Promise.all([
      supabase.from("team_players").select("player:player_id(id, name, photo_url, position)").eq("team_id", teamAId),
      supabase.from("team_players").select("player:player_id(id, name, photo_url, position)").eq("team_id", teamBId),
      supabase
        .from("match_events")
        .select("id, event_type, minute, player:player_id(id, name)")
        .eq("match_id", params.id)
        .order("minute"),
      supabase.from("player_live_rating_avg").select("*").eq("match_id", params.id),
    ]);

    const squadAList = (sqA ?? []).map((r: any) => r.player).filter(Boolean);
    const squadBList = (sqB ?? []).map((r: any) => r.player).filter(Boolean);
    setSquadA(squadAList);
    setSquadB(squadBList);

    const squadAIds = new Set(squadAList.map((p: any) => p.id));
    const events = ev ?? [];
    setEventsA(events.filter((e: any) => squadAIds.has(e.player?.id)));
    setEventsB(events.filter((e: any) => !squadAIds.has(e.player?.id)));

    const avgMap: Record<string, { avg_rating: number; rating_count: number }> = {};
    (ratings ?? []).forEach((r: any) => {
      avgMap[r.player_id] = { avg_rating: r.avg_rating, rating_count: r.rating_count };
    });
    setRatingAverages(avgMap);

    setLoading(false);
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUserId(data.user?.id ?? null));
    load();

    const channel = supabase
      .channel(`match-${params.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "match_events", filter: `match_id=eq.${params.id}` }, load)
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${params.id}` }, load)
      .on("postgres_changes", { event: "*", schema: "public", table: "player_live_ratings", filter: `match_id=eq.${params.id}` }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <ClipLoader color="#FFC94A" size={36} />
      </div>
    );
  }
  if (!match) return <p className="pt-16 text-chalk-300">ম্যাচ পাওয়া যায়নি।</p>;

  const isLive = match.status === "live";
  const allPlayers = [...squadA, ...squadB];

  return (
    <div className="pt-10">
      {/* স্কোরবোর্ড */}
      <div className="card p-6 sm:p-8 text-center mb-8">
        {isLive && (
          <span className="status-pill bg-crimson/20 text-crimson inline-flex items-center gap-1.5 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-crimson animate-pulse" /> লাইভ
          </span>
        )}
        <div className="flex items-center justify-center gap-6 sm:gap-10">
          <span className="font-display text-2xl sm:text-3xl text-chalk-100">{match.team_a?.department}</span>
          <span className="scoreboard-digit text-5xl sm:text-6xl font-bold text-floodlight-500">
            {match.score_a} – {match.score_b}
          </span>
          <span className="font-display text-2xl sm:text-3xl text-chalk-100">{match.team_b?.department}</span>
        </div>
        <p className="text-chalk-300 text-sm mt-4">
          {new Date(match.date).toLocaleDateString("bn-BD", { day: "numeric", month: "long", year: "numeric" })}
          {match.referee_name && <> · রেফারি: {match.referee_name}</>}
        </p>
      </div>

      {/* লাইনআপ */}
      <h2 className="font-display text-2xl tracking-wide text-chalk-100 mb-4">লাইনআপ</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <Lineup squad={squadA} formation={match.team_a?.formation} teamName={match.team_a?.department} />
        <Lineup squad={squadB} formation={match.team_b?.formation} teamName={match.team_b?.department} />
      </div>

      {/* দুই পাশে ইভেন্ট টাইমলাইন */}
      <h2 className="font-display text-2xl tracking-wide text-chalk-100 mb-4">ম্যাচ ইভেন্ট</h2>
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        {[
          { name: match.team_a?.department, events: eventsA },
          { name: match.team_b?.department, events: eventsB },
        ].map((col, i) => (
          <div key={i} className="card">
            <p className="text-sm font-semibold text-chalk-100 px-4 pt-4 pb-2">{col.name}</p>
            {col.events.length > 0 ? (
              <ol className="divide-y divide-cardline">
                {col.events.map((e: any) => (
                  <li key={e.id} className="flex items-center gap-3 px-4 py-2.5 text-sm">
                    <span className="scoreboard-digit text-floodlight-500 w-8 text-right shrink-0">{e.minute}'</span>
                    <span className="text-chalk-100">{eventLabel[e.event_type] ?? e.event_type}</span>
                    <span className="text-chalk-300 truncate">— {e.player?.name}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-chalk-300 text-sm px-4 pb-4">এখনো কোনো ইভেন্ট নেই।</p>
            )}
          </div>
        ))}
      </div>

      {/* লাইভ দর্শক রেটিং */}
      {isLive && (
        <div>
          <h2 className="font-display text-2xl tracking-wide text-chalk-100 mb-2">লাইভ প্লেয়ার রেটিং</h2>
          {userId ? (
            <>
              <p className="text-xs text-chalk-300 mb-4">
                ম্যাচ চলাকালীন প্লেয়ারদের পারফরম্যান্স রেট করুন। ম্যাচ শেষে অ্যাডমিন আপনাদের গড় রেটিং বিবেচনা করে ফাইনাল রেটিং দেবেন।
              </p>
              <div className="card p-4">
                {allPlayers.map((p) => (
                  <LiveRatingRow
                    key={p.id}
                    matchId={params.id}
                    userId={userId}
                    player={p}
                    avgRating={ratingAverages[p.id]?.avg_rating ?? null}
                    ratingCount={ratingAverages[p.id]?.rating_count ?? 0}
                    onRated={load}
                  />
                ))}
              </div>
            </>
          ) : (
            <div className="card p-6 text-center text-chalk-300 text-sm">
              প্লেয়ারদের রেট করতে হলে{" "}
              <a href="/login" className="text-floodlight-500 hover:underline">
                লগইন
              </a>{" "}
              করুন।
            </div>
          )}
        </div>
      )}
    </div>
  );
}
