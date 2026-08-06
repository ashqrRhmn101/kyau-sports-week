import { createClient } from "@/lib/supabase/server";
import MatchCard from "@/components/MatchCard";
import Link from "next/link";

export const revalidate = 20;

export default async function HomePage() {
  const supabase = createClient();

  const { data: matches } = await supabase
    .from("matches")
    .select("id, date, score_a, score_b, status, team_a:team_a_id(department), team_b:team_b_id(department)")
    .order("date", { ascending: false })
    .limit(6);

  const { data: topScorers } = await supabase
    .from("player_season_stats")
    .select("player_id, name, department, goals")
    .order("goals", { ascending: false })
    .limit(5);

  return (
    <div>
      {/* Hero */}
      <section className="pt-5 pb-10 sm:pt-7 sm:pb-14">
        <p className="eyebrow mb-5">সিজন ২০২৬ · স্প্রিং</p>
        <h1 className="font-display text-4xl sm:text-6xl leading-[0.95] text-chalk-100 max-w-3xl">
          প্রতিটা ট্যাকল, প্রতিটা গোল —
          <span className="text-floodlight-500"> এক জায়গায়।</span>
        </h1>
        <p className="mt-5 text-chalk-300 max-w-xl">
          ইউনিভার্সিটি স্পোর্টস উইক ফুটবল টুর্নামেন্টের প্লেয়ার, টিম, ম্যাচ ও লাইভ স্ট্যাটস — সব
          একটা প্ল্যাটফর্মে।
        </p>
        <div className="mt-7 flex gap-3">
          <Link href="/matches" className="btn-primary">
            ম্যাচ দেখুন
          </Link>
          <Link href="/players" className="btn-secondary">
            প্লেয়ার তালিকা
          </Link>
        </div>
      </section>

      <div className="grid lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl tracking-wide text-chalk-100">সাম্প্রতিক ম্যাচ</h2>
            <Link href="/matches" className="text-sm text-floodlight-500 hover:text-floodlight-400">
              সব দেখুন →
            </Link>
          </div>
          {matches && matches.length > 0 ? (
            <div className="grid sm:grid-cols-2 gap-4">
              {matches.map((m: any) => (
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
            <div className="card p-8 text-center text-chalk-300">
              এখনো কোনো ম্যাচ যোগ করা হয়নি।
            </div>
          )}
        </section>

        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl tracking-wide text-chalk-100">টপ স্কোরার</h2>
            <Link href="/leaderboard" className="text-sm text-floodlight-500 hover:text-floodlight-400">
              লিডারবোর্ড →
            </Link>
          </div>
          <div className="card p-2">
            {topScorers && topScorers.length > 0 ? (
              <ol>
                {topScorers.map((p: any, i: number) => (
                  <li
                    key={p.player_id}
                    className="flex items-center justify-between px-3 py-2.5 border-b border-cardline last:border-none"
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="scoreboard-digit text-floodlight-500 w-5 text-sm">{i + 1}</span>
                      <span className="truncate">
                        <Link href={`/players/${p.player_id}`} className="text-chalk-100 hover:text-floodlight-500">
                          {p.name}
                        </Link>
                        <span className="block text-xs text-chalk-300">{p.department}</span>
                      </span>
                    </span>
                    <span className="scoreboard-digit font-bold text-chalk-100">{p.goals}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-chalk-300 text-sm p-4">এখনো কোনো ডেটা নেই।</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
