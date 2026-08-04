"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

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
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data: m } = await supabase
        .from("matches")
        .select(
          "id, date, referee_name, score_a, score_b, status, team_a:team_a_id(department), team_b:team_b_id(department)"
        )
        .eq("id", params.id)
        .single();
      setMatch(m);

      const { data: ev } = await supabase
        .from("match_events")
        .select("id, event_type, minute, player:player_id(name)")
        .eq("match_id", params.id)
        .order("minute", { ascending: true });
      setEvents(ev ?? []);
      setLoading(false);
    };
    load();

    // ম্যাচ লাইভ থাকলে রিয়েল-টাইম ইভেন্ট আপডেট পাওয়ার জন্য সাবস্ক্রিপশন
    const channel = supabase
      .channel(`match-${params.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "match_events", filter: `match_id=eq.${params.id}` },
        () => load()
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "matches", filter: `id=eq.${params.id}` },
        () => load()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [params.id, supabase]);

  if (loading) return <p className="pt-16 text-chalk-300">লোড হচ্ছে…</p>;
  if (!match) return <p className="pt-16 text-chalk-300">ম্যাচ পাওয়া যায়নি।</p>;

  return (
    <div className="pt-10">
      <div className="card p-6 sm:p-8 text-center mb-8">
        {match.status === "live" && (
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

      <h2 className="font-display text-2xl tracking-wide text-chalk-100 mb-4">ম্যাচ টাইমলাইন</h2>
      {events.length > 0 ? (
        <ol className="card divide-y divide-cardline">
          {events.map((e) => (
            <li key={e.id} className="flex items-center gap-4 px-4 py-3">
              <span className="scoreboard-digit text-floodlight-500 w-10 text-right">{e.minute}'</span>
              <span className="text-chalk-100">{eventLabel[e.event_type] ?? e.event_type}</span>
              <span className="text-chalk-300">— {e.player?.name}</span>
            </li>
          ))}
        </ol>
      ) : (
        <div className="card p-8 text-center text-chalk-300">এখনো কোনো ইভেন্ট রেকর্ড হয়নি।</div>
      )}
    </div>
  );
}
