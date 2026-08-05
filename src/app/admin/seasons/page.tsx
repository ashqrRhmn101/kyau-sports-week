"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { Plus, Trash2, CalendarRange } from "lucide-react";
import Swal from "sweetalert2";

export default function SeasonsPage() {
  const supabase = createClient();
  const [seasons, setSeasons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ year: new Date().getFullYear(), term: "", name: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("seasons").select("*").order("year", { ascending: false });
    setSeasons(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("seasons").insert(form);
    setSaving(false);
    if (error) {
      Swal.fire({ icon: "error", title: "সমস্যা হয়েছে", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    setForm({ year: new Date().getFullYear(), term: "", name: "" });
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `"${name}" মুছে ফেলবেন?`,
      text: "এই সিজনের সাথে যুক্ত টিম/ম্যাচ থাকলে সেগুলোও প্রভাবিত হতে পারে।",
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছুন",
      cancelButtonText: "বাতিল",
      confirmButtonColor: "#E24C4B",
      background: "#0B1F17",
      color: "#F5F3EA",
    });
    if (!result.isConfirmed) return;
    await supabase.from("seasons").delete().eq("id", id);
    load();
  };

  const inputClass = "w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100 text-sm";

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-8 flex items-center gap-3">
        <CalendarRange className="text-floodlight-500" /> সিজন
      </h1>

      <form onSubmit={handleAdd} className="card p-5 mb-8 grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-chalk-300 block mb-1">বছর</label>
          <input
            type="number"
            required
            value={form.year}
            onChange={(e) => setForm({ ...form, year: Number(e.target.value) })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-chalk-300 block mb-1">টার্ম</label>
          <input
            required
            placeholder="যেমন: Spring"
            value={form.term}
            onChange={(e) => setForm({ ...form, term: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-chalk-300 block mb-1">নাম</label>
          <input
            required
            placeholder="যেমন: Spring 2026"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
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
      ) : seasons.length === 0 ? (
        <div className="card p-8 text-center text-chalk-300">কোনো সিজন যোগ করা হয়নি।</div>
      ) : (
        <div className="card divide-y divide-cardline">
          {seasons.map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-chalk-100 font-medium">{s.name}</p>
                <p className="text-xs text-chalk-300">
                  {s.term} · {s.year}
                </p>
              </div>
              <button onClick={() => handleDelete(s.id, s.name)} className="text-crimson hover:bg-crimson/10 p-2 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
