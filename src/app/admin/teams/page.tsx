"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { Plus, Trash2, Shield, ChevronRight } from "lucide-react";
import Swal from "sweetalert2";

export default function TeamsAdminPage() {
  const supabase = createClient();
  const [teams, setTeams] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ department: "", season_id: "", coach_id: "", formation: "" });

  const load = async () => {
    setLoading(true);
    const [{ data: t }, { data: s }, { data: c }] = await Promise.all([
      supabase
        .from("teams")
        .select("id, department, formation, season:season_id(name), coach:coach_id(name)")
        .order("department"),
      supabase.from("seasons").select("id, name").order("year", { ascending: false }),
      supabase.from("coaches").select("id, name").order("name"),
    ]);
    setTeams(t ?? []);
    setSeasons(s ?? []);
    setCoaches(c ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("teams").insert({
      department: form.department,
      season_id: form.season_id,
      coach_id: form.coach_id || null,
      formation: form.formation || null,
    });
    setSaving(false);
    if (error) {
      Swal.fire({ icon: "error", title: "সমস্যা হয়েছে", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    setForm({ department: "", season_id: "", coach_id: "", formation: "" });
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `"${name}" টিম মুছে ফেলবেন?`,
      text: "এই টিমের স্কোয়াড ও সংশ্লিষ্ট ম্যাচও প্রভাবিত হবে।",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছুন",
      cancelButtonText: "বাতিল",
      confirmButtonColor: "#E24C4B",
      background: "#0B1F17",
      color: "#F5F3EA",
    });
    if (!result.isConfirmed) return;
    await supabase.from("teams").delete().eq("id", id);
    load();
  };

  const inputClass = "w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100 text-sm";

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-8 flex items-center gap-3">
        <Shield className="text-floodlight-500" /> টিম
      </h1>

      <form onSubmit={handleAdd} className="card p-5 mb-8 grid sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="text-xs text-chalk-300 block mb-1">ডিপার্টমেন্ট</label>
          <input
            required
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-chalk-300 block mb-1">সিজন</label>
          <select
            required
            value={form.season_id}
            onChange={(e) => setForm({ ...form, season_id: e.target.value })}
            className={inputClass}
          >
            <option value="">নির্বাচন করুন</option>
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
            value={form.coach_id}
            onChange={(e) => setForm({ ...form, coach_id: e.target.value })}
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
            placeholder="4-4-2"
            value={form.formation}
            onChange={(e) => setForm({ ...form, formation: e.target.value })}
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary flex items-center justify-center gap-1.5 h-[38px]">
          {saving ? <ClipLoader color="#0B1F17" size={14} /> : <Plus size={16} />} যোগ করুন
        </button>
      </form>

      {loading ? (
        <div className="flex justify-center py-16">
          <ClipLoader color="#FFC94A" size={32} />
        </div>
      ) : teams.length === 0 ? (
        <div className="card p-8 text-center text-chalk-300">কোনো টিম যোগ করা হয়নি।</div>
      ) : (
        <div className="card divide-y divide-cardline">
          {teams.map((t: any) => (
            <div key={t.id} className="flex items-center justify-between px-4 py-3">
              <Link href={`/admin/teams/${t.id}`} className="flex items-center gap-2 min-w-0 group">
                <div className="min-w-0">
                  <p className="text-chalk-100 font-medium group-hover:text-floodlight-500 transition-colors">
                    {t.department}
                  </p>
                  <p className="text-xs text-chalk-300">
                    {t.season?.name} · কোচ: {t.coach?.name ?? "নির্ধারিত নয়"}
                    {t.formation && <> · {t.formation}</>}
                  </p>
                </div>
                <ChevronRight size={16} className="text-chalk-300 group-hover:text-floodlight-500 shrink-0" />
              </Link>
              <button onClick={() => handleDelete(t.id, t.department)} className="text-crimson hover:bg-crimson/10 p-2 rounded-lg shrink-0">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-xs text-chalk-300 mt-4">টিমে ক্লিক করে স্কোয়াডে প্লেয়ার যোগ/বাদ দিতে পারবেন।</p>
    </div>
  );
}
