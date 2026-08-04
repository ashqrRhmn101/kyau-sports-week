import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export const revalidate = 0;

export default async function TeamsPage() {
  const supabase = createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, department, formation, coach:coach_id(name), season:season_id(name, year)")
    .order("department");

  return (
    <div className="pt-10">
      <p className="eyebrow mb-2">স্কোয়াড</p>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">সকল টিম</h1>

      {teams && teams.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {teams.map((t: any) => (
            <Link
              key={t.id}
              href={`/teams/${t.id}`}
              className="card p-5 hover:border-floodlight-500/60 transition-colors"
            >
              <p className="eyebrow mb-1">{t.season?.name ?? ""}</p>
              <h2 className="font-display text-2xl text-chalk-100">{t.department}</h2>
              <p className="text-sm text-chalk-300 mt-2">
                কোচ: {t.coach?.name ?? "নির্ধারিত হয়নি"}
              </p>
              {t.formation && (
                <p className="scoreboard-digit text-xs text-floodlight-500 mt-1">{t.formation}</p>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-chalk-300">কোনো টিম যোগ করা হয়নি।</div>
      )}
    </div>
  );
}
