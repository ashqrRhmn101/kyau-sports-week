"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { Swords } from "lucide-react";
import Swal from "sweetalert2";
import { teamLabel } from "@/lib/teamLabel";

export default function NewMatchPage() {
  const supabase = createClient();
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [seasons, setSeasons] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    season_id: "",
    team_a_id: "",
    team_b_id: "",
    date: "",
    referee_name: "",
    status: "scheduled",
  });

  useEffect(() => {
    supabase.from("seasons").select("id, name").order("year", { ascending: false }).then(({ data }) => setSeasons(data ?? []));
    supabase.from("teams").select("id, name, department").order("department").then(({ data }) => setTeams(data ?? []));
  }, []);

  const createMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.team_a_id === form.team_b_id) {
      Swal.fire({ icon: "error", title: "টিম A ও B একই হতে পারবে না", background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    setSaving(true);
    const { data, error } = await supabase
      .from("matches")
      .insert({
        season_id: form.season_id,
        team_a_id: form.team_a_id,
        team_b_id: form.team_b_id,
        date: form.date,
        referee_name: form.referee_name || null,
        status: form.status,
      })
      .select()
      .single();
    setSaving(false);
    if (error) {
      Swal.fire({ icon: "error", title: "সমস্যা হয়েছে", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    router.push(`/admin/matches/${data.id}`);
  };

  const inputClass = "w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100";

  return (
    <div className="max-w-xl">
      <h1 className="font-display text-4xl text-chalk-100 mb-8 flex items-center gap-3">
        <Swords className="text-floodlight-500" /> নতুন ম্যাচ
      </h1>

      <form onSubmit={createMatch} className="card p-6 space-y-4">
        <div>
          <label className="text-sm text-chalk-300 block mb-1">সিজন</label>
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-chalk-300 block mb-1">টিম A</label>
            <select
              required
              value={form.team_a_id}
              onChange={(e) => setForm({ ...form, team_a_id: e.target.value })}
              className={inputClass}
            >
              <option value="">নির্বাচন করুন</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {teamLabel(t)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm text-chalk-300 block mb-1">টিম B</label>
            <select
              required
              value={form.team_b_id}
              onChange={(e) => setForm({ ...form, team_b_id: e.target.value })}
              className={inputClass}
            >
              <option value="">নির্বাচন করুন</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {teamLabel(t)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-chalk-300 block mb-1">তারিখ ও সময়</label>
            <input
              type="datetime-local"
              required
              value={form.date}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm text-chalk-300 block mb-1">অবস্থা</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={inputClass}
            >
              <option value="scheduled">নির্ধারিত</option>
              <option value="live">লাইভ</option>
              <option value="completed">সম্পন্ন</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm text-chalk-300 block mb-1">রেফারি</label>
          <input
            value={form.referee_name}
            onChange={(e) => setForm({ ...form, referee_name: e.target.value })}
            className={inputClass}
          />
        </div>
        <button type="submit" disabled={saving} className="btn-primary w-full flex items-center justify-center gap-2">
          {saving && <ClipLoader color="#0B1F17" size={16} />} ম্যাচ তৈরি করুন ও ইভেন্ট যোগ করতে যান
        </button>
      </form>
    </div>
  );
}
