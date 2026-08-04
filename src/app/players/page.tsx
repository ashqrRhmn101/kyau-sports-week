import { createClient } from "@/lib/supabase/server";
import PlayerCard from "@/components/PlayerCard";
import Link from "next/link";
import type { Player } from "@/lib/types";

export const revalidate = 20;

export default async function PlayersPage({
  searchParams,
}: {
  searchParams: { dept?: string; pos?: string };
}) {
  const supabase = createClient();

  let query = supabase.from("players").select("*").eq("status", "approved").order("name");
  if (searchParams.dept) query = query.eq("department", searchParams.dept);
  if (searchParams.pos) query = query.eq("position", searchParams.pos);

  const { data: players } = await query;
  const { data: deptRows } = await supabase.from("players").select("department").eq("status", "approved");
  const departments = Array.from(new Set((deptRows ?? []).map((d) => d.department))).sort();

  const positions = [
    { value: "GK", label: "গোলকিপার" },
    { value: "DEF", label: "ডিফেন্ডার" },
    { value: "MID", label: "মিডফিল্ডার" },
    { value: "FWD", label: "ফরোয়ার্ড" },
  ];

  return (
    <div className="pt-10">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="eyebrow mb-2">স্কোয়াড</p>
          <h1 className="font-display text-4xl text-chalk-100">সকল প্লেয়ার</h1>
        </div>
        <Link href="/players/new" className="btn-primary">
          + প্রোফাইল সাবমিট করুন
        </Link>
      </div>

      <div className="flex flex-wrap gap-2 mb-6">
        <Link
          href="/players"
          className={`status-pill px-3 py-1 ${!searchParams.dept && !searchParams.pos ? "bg-floodlight-500 text-pitch-900" : "bg-card text-chalk-300"}`}
        >
          সব
        </Link>
        {positions.map((p) => (
          <Link
            key={p.value}
            href={`/players?pos=${p.value}${searchParams.dept ? `&dept=${searchParams.dept}` : ""}`}
            className={`status-pill px-3 py-1 ${searchParams.pos === p.value ? "bg-floodlight-500 text-pitch-900" : "bg-card text-chalk-300"}`}
          >
            {p.label}
          </Link>
        ))}
      </div>

      {departments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {departments.map((d) => (
            <Link
              key={d}
              href={`/players?dept=${d}${searchParams.pos ? `&pos=${searchParams.pos}` : ""}`}
              className={`text-xs px-2.5 py-1 rounded-full border ${searchParams.dept === d ? "border-floodlight-500 text-floodlight-500" : "border-cardline text-chalk-300"}`}
            >
              {d}
            </Link>
          ))}
        </div>
      )}

      {players && players.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {(players as Player[]).map((p) => (
            <PlayerCard key={p.id} player={p} />
          ))}
        </div>
      ) : (
        <div className="card p-10 text-center text-chalk-300">
          কোনো প্লেয়ার পাওয়া যায়নি।
        </div>
      )}
    </div>
  );
}
