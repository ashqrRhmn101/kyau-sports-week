import { createClient } from "@/lib/supabase/server";
import MatchCard from "@/components/MatchCard";

export const revalidate = 0;

export default async function MatchesPage() {
  const supabase = createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, date, score_a, score_b, status, team_a:team_a_id(department), team_b:team_b_id(department)")
    .order("date", { ascending: false });

  const live = (matches ?? []).filter((m: any) => m.status === "live");
  const rest = (matches ?? []).filter((m: any) => m.status !== "live");

  return (
    <div className="pt-10">
      <p className="eyebrow mb-2">ফিক্সচার</p>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">সকল ম্যাচ</h1>

      {live.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-2xl tracking-wide text-crimson mb-4">এখন লাইভ</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {live.map((m: any) => (
              <MatchCard
                key={m.id}
                id={m.id}
                teamAName={m.team_a?.department ?? "TBD"}
                teamBName={m.team_b?.department ?? "TBD"}
                scoreA={m.score_a}
                scoreB={m.score_b}
                status={m.status}
                date={m.date}
              />
            ))}
          </div>
        </section>
      )}

      {rest.length > 0 ? (
        <div className="grid sm:grid-cols-2 gap-4">
          {rest.map((m: any) => (
            <MatchCard
              key={m.id}
              id={m.id}
              teamAName={m.team_a?.department ?? "TBD"}
              teamBName={m.team_b?.department ?? "TBD"}
              scoreA={m.score_a}
              scoreB={m.score_b}
              status={m.status}
              date={m.date}
            />
          ))}
        </div>
      ) : (
        live.length === 0 && (
          <div className="card p-10 text-center text-chalk-300">এখনো কোনো ম্যাচ যোগ করা হয়নি।</div>
        )
      )}
    </div>
  );
}
