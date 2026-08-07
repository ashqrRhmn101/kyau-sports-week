import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Shield } from "lucide-react";
import { teamLabel } from "@/lib/teamLabel";

export const revalidate = 20;

export default async function TeamsPage() {
  const supabase = createClient();

  const { data: teams } = await supabase
    .from("teams")
    .select("id, name, department, formation, is_champion, coach:coach_id(name), season:season_id(name, year)")
    .order("department");

  const grouped = new Map<string, any[]>();
  (teams ?? []).forEach((t: any) => {
    const list = grouped.get(t.department) ?? [];
    list.push(t);
    grouped.set(t.department, list);
  });
  const departments = Array.from(grouped.keys()).sort();

  return (
    <div className="pt-10">
      <p className="eyebrow mb-2">স্কোয়াড</p>
      <h1 className="font-display text-4xl text-chalk-100 mb-2">সকল টিম</h1>
      <p className="text-chalk-300 text-sm mb-8">
        {departments.length} টা ডিপার্টমেন্ট, মোট {teams?.length ?? 0} টা টিম
      </p>

      {departments.length === 0 ? (
        <div className="card p-10 text-center text-chalk-300">কোনো টিম যোগ করা হয়নি।</div>
      ) : (
        <div className="space-y-10">
          {departments.map((dept) => {
            const deptTeams = grouped.get(dept)!;
            return (
              <section key={dept}>
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={18} className="text-floodlight-500" />
                  <h2 className="font-display text-2xl tracking-wide text-chalk-100">{dept}</h2>
                  <span className="status-pill bg-card text-chalk-300">{deptTeams.length} টিম</span>
                </div>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deptTeams.map((t: any) => (
                    <Link
                      key={t.id}
                      href={`/teams/${t.id}`}
                      className="card p-5 hover:border-floodlight-500/60 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <p className="eyebrow">{t.season?.name ?? ""}</p>
                        {t.is_champion && (
                          <span className="status-pill bg-floodlight-500/15 text-floodlight-500">🏆 চ্যাম্পিয়ন</span>
                        )}
                      </div>
                      <h3 className="font-display text-xl text-chalk-100">{teamLabel(t)}</h3>
                      <p className="text-sm text-chalk-300 mt-2">কোচ: {t.coach?.name ?? "নির্ধারিত হয়নি"}</p>
                      {t.formation && <p className="scoreboard-digit text-xs text-floodlight-500 mt-1">{t.formation}</p>}
                    </Link>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}
