"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { UserPlus, X, ArrowLeft } from "lucide-react";
import Link from "next/link";
import Swal from "sweetalert2";

import { teamLabel } from "@/lib/teamLabel";

export default function TeamManagePage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const [team, setTeam] = useState<any>(null);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [squad, setSquad] = useState<any[]>([]);
  const [allPlayers, setAllPlayers] = useState<any[]>([]);
  const [addPlayerId, setAddPlayerId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: t }, { data: s }, { data: c }, { data: sq }, { data: ap }] = await Promise.all([
      supabase.from("teams").select("*").eq("id", params.id).single(),
      supabase.from("seasons").select("id, name").order("year", { ascending: false }),
      supabase.from("coaches").select("id, name").order("name"),
      supabase.from("team_players").select("id, player:player_id(id, name, department, position)").eq("team_id", params.id),
      supabase.from("players").select("id, name, department").eq("status", "approved").order("name"),
    ]);
    setTeam(t);
    setSeasons(s ?? []);
    setCoaches(c ?? []);
    setSquad(sq ?? []);
    setAllPlayers(ap ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [params.id]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase
      .from("teams")
      .update({
        name: team.name || null,
        department: team.department,
        season_id: team.season_id,
        coach_id: team.coach_id || null,
        formation: team.formation || null,
        is_champion: team.is_champion ?? false,
      })
      .eq("id", params.id);
    setSaving(false);
    if (error) {
      Swal.fire({ icon: "error", title: "সমস্যা হয়েছে", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    Swal.fire({ icon: "success", title: "সেভ হয়েছে", timer: 1200, showConfirmButton: false, background: "#0B1F17", color: "#F5F3EA" });
    load();
  };

  const addToSquad = async () => {
    if (!addPlayerId) return;
    const { error } = await supabase.from("team_players").insert({ team_id: params.id, player_id: addPlayerId });
    if (error) {
      Swal.fire({ icon: "error", title: "যোগ করা যায়নি", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    setAddPlayerId("");
    load();
  };

  const removeFromSquad = async (rowId: string) => {
    await supabase.from("team_players").delete().eq("id", rowId);
    load();
  };

  const inputClass = "w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100 text-sm";

  if (loading || !team) {
    return (
      <div className="flex justify-center py-24">
        <ClipLoader color="#FFC94A" size={36} />
      </div>
    );
  }

  const squadPlayerIds = new Set(squad.map((s) => s.player?.id));
  const availablePlayers = allPlayers.filter((p) => !squadPlayerIds.has(p.id));

  return (
    <div className="max-w-2xl">
      <Link href="/admin/teams" className="inline-flex items-center gap-1.5 text-sm text-chalk-300 hover:text-floodlight-500 mb-4">
        <ArrowLeft size={14} /> সব টিম
      </Link>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">{teamLabel(team)} — টিম ম্যানেজ</h1>

      <form onSubmit={handleSave} className="card p-5 space-y-4 mb-8">
        <h2 className="font-display text-xl text-chalk-100">টিমের তথ্য</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-chalk-300 block mb-1">টিমের নাম</label>
            <input
              value={team.name ?? ""}
              onChange={(e) => setTeam({ ...team, name: e.target.value })}
              placeholder="যেমন: Thunder"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-chalk-300 block mb-1">ডিপার্টমেন্ট</label>
            <input
              value={team.department}
              onChange={(e) => setTeam({ ...team, department: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-xs text-chalk-300 block mb-1">সিজন</label>
            <select
              value={team.season_id ?? ""}
              onChange={(e) => setTeam({ ...team, season_id: e.target.value })}
              className={inputClass}
            >
              {seasons.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-chalk-300 block mb-1">কোচ</label>
            <select
              value={team.coach_id ?? ""}
              onChange={(e) => setTeam({ ...team, coach_id: e.target.value })}
              className={inputClass}
            >
              <option value="">নির্ধারিত নয়</option>
              {coaches.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-chalk-300 block mb-1">ফরমেশন</label>
            <input
              value={team.formation ?? ""}
              onChange={(e) => setTeam({ ...team, formation: e.target.value })}
              className={inputClass}
            />
          </div>
          <div className="flex items-center gap-2 sm:col-span-2 pt-1">
            <input
              type="checkbox"
              id="is_champion"
              checked={!!team.is_champion}
              onChange={(e) => setTeam({ ...team, is_champion: e.target.checked })}
              className="w-4 h-4 accent-floodlight-500"
            />
            <label htmlFor="is_champion" className="text-sm text-chalk-100">
              🏆 এই টিম এই সিজনের চ্যাম্পিয়ন
            </label>
          </div>
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-1.5">
          {saving && <ClipLoader color="#0B1F17" size={14} />} সেভ করুন
        </button>
      </form>

      <div className="card p-5">
        <h2 className="font-display text-xl text-chalk-100 mb-4">স্কোয়াড ({squad.length})</h2>

        <div className="flex gap-2 mb-4">
          <select value={addPlayerId} onChange={(e) => setAddPlayerId(e.target.value)} className={inputClass}>
            <option value="">প্লেয়ার নির্বাচন করুন…</option>
            {availablePlayers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.department})
              </option>
            ))}
          </select>
          <button onClick={addToSquad} className="btn-primary shrink-0 flex items-center gap-1.5 px-3">
            <UserPlus size={16} /> যোগ করুন
          </button>
        </div>

        {squad.length === 0 ? (
          <p className="text-chalk-300 text-sm">স্কোয়াডে কোনো প্লেয়ার নেই।</p>
        ) : (
          <div className="divide-y divide-cardline">
            {squad.map((row) => (
              <div key={row.id} className="flex items-center justify-between py-2.5">
                <span className="text-sm text-chalk-100">
                  {row.player?.name}{" "}
                  <span className="text-chalk-300">
                    · {row.player?.position} · {row.player?.department}
                  </span>
                </span>
                <button onClick={() => removeFromSquad(row.id)} className="text-crimson hover:bg-crimson/10 p-1.5 rounded-lg">
                  <X size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
