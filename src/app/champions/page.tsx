import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Trophy } from "lucide-react";

export const revalidate = 20;

export default async function ChampionsPage() {
  const supabase = createClient();

  const { data: champions } = await supabase
    .from("teams")
    .select("id, department, formation, coach:coach_id(name), season:season_id(name, year)")
    .eq("is_champion", true)
    .order("season(year)", { ascending: false });

  return (
    <div className="pt-10">
      <p className="eyebrow mb-2">সম্মাননা</p>
      <h1 className="font-display text-4xl text-chalk-100 mb-8 flex items-center gap-3">
        <Trophy className="text-floodlight-500" /> চ্যাম্পিয়নদের তালিকা
      </h1>

      {!champions || champions.length === 0 ? (
        <div className="card p-10 text-center text-chalk-300">
          এখনো কোনো সিজনের চ্যাম্পিয়ন ঘোষণা করা হয়নি।
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {champions.map((t: any) => (
            <Link
              key={t.id}
              href={`/teams/${t.id}`}
              className="card p-6 text-center hover:border-floodlight-500/60 transition-colors"
            >
              <Trophy className="text-floodlight-500 mx-auto mb-3" size={32} />
              <p className="eyebrow mb-1">{t.season?.name}</p>
              <h2 className="font-display text-2xl text-chalk-100">{t.department}</h2>
              <p className="text-sm text-chalk-300 mt-2">কোচ: {t.coach?.name ?? "—"}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
