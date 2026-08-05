"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { Plus, Trash2, UserCog } from "lucide-react";
import Swal from "sweetalert2";

export default function CoachesPage() {
  const supabase = createClient();
  const [coaches, setCoaches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", department: "", playing_style_notes: "" });

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("coaches").select("*").order("name");
    setCoaches(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const { error } = await supabase.from("coaches").insert(form);
    setSaving(false);
    if (error) {
      Swal.fire({ icon: "error", title: "সমস্যা হয়েছে", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    setForm({ name: "", department: "", playing_style_notes: "" });
    load();
  };

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: `"${name}" মুছে ফেলবেন?`,
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, মুছুন",
      cancelButtonText: "বাতিল",
      confirmButtonColor: "#E24C4B",
      background: "#0B1F17",
      color: "#F5F3EA",
    });
    if (!result.isConfirmed) return;
    await supabase.from("coaches").delete().eq("id", id);
    load();
  };

  const inputClass = "w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100 text-sm";

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-8 flex items-center gap-3">
        <UserCog className="text-floodlight-500" /> কোচ
      </h1>

      <form onSubmit={handleAdd} className="card p-5 mb-8 grid sm:grid-cols-4 gap-3 items-end">
        <div>
          <label className="text-xs text-chalk-300 block mb-1">নাম</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className={inputClass}
          />
        </div>
        <div>
          <label className="text-xs text-chalk-300 block mb-1">ডিপার্টমেন্ট</label>
          <input
            required
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            className={inputClass}
          />
        </div>
        <div className="sm:col-span-1">
          <label className="text-xs text-chalk-300 block mb-1">প্লেয়িং স্টাইল নোট</label>
          <input
            value={form.playing_style_notes}
            onChange={(e) => setForm({ ...form, playing_style_notes: e.target.value })}
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
      ) : coaches.length === 0 ? (
        <div className="card p-8 text-center text-chalk-300">কোনো কোচ যোগ করা হয়নি।</div>
      ) : (
        <div className="card divide-y divide-cardline">
          {coaches.map((c) => (
            <div key={c.id} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-chalk-100 font-medium">{c.name}</p>
                <p className="text-xs text-chalk-300">
                  {c.department}
                  {c.playing_style_notes && <> · {c.playing_style_notes}</>}
                </p>
              </div>
              <button onClick={() => handleDelete(c.id, c.name)} className="text-crimson hover:bg-crimson/10 p-2 rounded-lg">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
