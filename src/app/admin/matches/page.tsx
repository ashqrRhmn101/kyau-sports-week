"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { Swords, Plus, Trash2, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

const statusLabel: Record<string, string> = { scheduled: "নির্ধারিত", live: "লাইভ", completed: "সম্পন্ন" };
const statusStyle: Record<string, string> = {
  scheduled: "bg-pitch-600/30 text-chalk-300",
  live: "bg-crimson/20 text-crimson",
  completed: "bg-floodlight-500/15 text-floodlight-500",
};

export default function MatchesAdminPage() {
  const supabase = createClient();
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("matches")
      .select("id, date, score_a, score_b, status, team_a:team_a_id(department), team_b:team_b_id(department)")
      .order("date", { ascending: false });
    setMatches(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const result = await Swal.fire({
      icon: "warning",
      title: "ম্যাচ মুছে ফেলবেন?",
      text: "এই ম্যাচের সব ইভেন্ট ও স্ট্যাটসও মুছে যাবে।",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছুন",
      cancelButtonText: "বাতিল",
      confirmButtonColor: "#E24C4B",
      background: "#0B1F17",
      color: "#F5F3EA",
    });
    if (!result.isConfirmed) return;
    await supabase.from("matches").delete().eq("id", id);
    load();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-4xl text-chalk-100 flex items-center gap-3">
          <Swords className="text-floodlight-500" /> ম্যাচ
        </h1>
        <Link href="/admin/matches/new" className="btn-primary flex items-center gap-1.5 text-sm">
          <Plus size={16} /> নতুন ম্যাচ
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <ClipLoader color="#FFC94A" size={32} />
        </div>
      ) : matches.length === 0 ? (
        <div className="card p-8 text-center text-chalk-300">কোনো ম্যাচ যোগ করা হয়নি।</div>
      ) : (
        <div className="card divide-y divide-cardline">
          {matches.map((m: any) => (
            <Link
              key={m.id}
              href={`/admin/matches/${m.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-cardline/20 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className={`status-pill shrink-0 ${statusStyle[m.status]}`}>{statusLabel[m.status]}</span>
                <span className="text-sm text-chalk-100 truncate">
                  {m.team_a?.department} <span className="scoreboard-digit text-floodlight-500">{m.score_a}-{m.score_b}</span> {m.team_b?.department}
                </span>
                <span className="text-xs text-chalk-300 hidden sm:inline shrink-0">
                  {new Date(m.date).toLocaleDateString("bn-BD", { day: "numeric", month: "short" })}
                </span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={(e) => handleDelete(m.id, e)} className="text-crimson hover:bg-crimson/10 p-2 rounded-lg">
                  <Trash2 size={16} />
                </button>
                <ChevronRight size={16} className="text-chalk-300" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
