"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { Users, Pencil, Trash2, Save, X, UserCircle2 } from "lucide-react";
import Swal from "sweetalert2";

const positions = ["GK", "DEF", "MID", "FWD"];

export default function PlayersAdminPage() {
  const supabase = createClient();
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("players").select("*").order("name");
    setPlayers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(
    () => (filter === "all" ? players : players.filter((p) => p.status === filter)),
    [players, filter]
  );

  const startEdit = (p: any) => {
    setEditingId(p.id);
    setEditForm({ ...p });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({});
  };

  const saveEdit = async () => {
    setSaving(true);
    const { error } = await supabase
      .from("players")
      .update({
        name: editForm.name,
        department: editForm.department,
        position: editForm.position,
        jersey_no: editForm.jersey_no ? Number(editForm.jersey_no) : null,
        bio: editForm.bio || null,
        photo_url: editForm.photo_url || null,
        status: editForm.status,
      })
      .eq("id", editingId);
    setSaving(false);
    if (error) {
      Swal.fire({ icon: "error", title: "সমস্যা হয়েছে", text: error.message, background: "#0B1F17", color: "#F5F3EA" });
      return;
    }
    cancelEdit();
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
    await supabase.from("players").delete().eq("id", id);
    load();
  };

  const inputClass = "w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100 text-sm";

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-6 flex items-center gap-3">
        <Users className="text-floodlight-500" /> প্লেয়ার
      </h1>

      <div className="flex gap-2 mb-6">
        {(["all", "approved", "pending"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`status-pill px-3 py-1 ${filter === f ? "bg-floodlight-500 text-pitch-900" : "bg-card text-chalk-300"}`}
          >
            {f === "all" ? "সব" : f === "approved" ? "অ্যাপ্রুভড" : "পেন্ডিং"}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <ClipLoader color="#FFC94A" size={32} />
        </div>
      ) : filtered.length === 0 ? (
        <div className="card p-8 text-center text-chalk-300">কোনো প্লেয়ার নেই।</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => (
            <div key={p.id} className="card p-4">
              {editingId === p.id ? (
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <input
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className={inputClass}
                      placeholder="নাম"
                    />
                    <input
                      value={editForm.department}
                      onChange={(e) => setEditForm({ ...editForm, department: e.target.value })}
                      className={inputClass}
                      placeholder="ডিপার্টমেন্ট"
                    />
                    <select
                      value={editForm.position}
                      onChange={(e) => setEditForm({ ...editForm, position: e.target.value })}
                      className={inputClass}
                    >
                      {positions.map((pos) => (
                        <option key={pos} value={pos}>
                          {pos}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      value={editForm.jersey_no ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, jersey_no: e.target.value })}
                      className={inputClass}
                      placeholder="জার্সি নম্বর"
                    />
                    <input
                      value={editForm.photo_url ?? ""}
                      onChange={(e) => setEditForm({ ...editForm, photo_url: e.target.value })}
                      className={inputClass}
                      placeholder="ছবির URL"
                    />
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className={inputClass}
                    >
                      <option value="approved">অ্যাপ্রুভড</option>
                      <option value="pending">পেন্ডিং</option>
                    </select>
                  </div>
                  <textarea
                    value={editForm.bio ?? ""}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className={inputClass}
                    rows={2}
                    placeholder="বায়ো"
                  />
                  <div className="flex gap-2">
                    <button onClick={saveEdit} disabled={saving} className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5">
                      {saving ? <ClipLoader color="#0B1F17" size={14} /> : <Save size={14} />} সেভ
                    </button>
                    <button onClick={cancelEdit} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
                      <X size={14} /> বাতিল
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-pitch-800 border border-cardline overflow-hidden flex items-center justify-center shrink-0">
                      {p.photo_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                      ) : (
                        <UserCircle2 className="text-chalk-300" size={22} />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-chalk-100 font-medium truncate">
                        {p.name}{" "}
                        <span
                          className={`status-pill ml-1 ${p.status === "approved" ? "bg-floodlight-500/15 text-floodlight-500" : "bg-crimson/20 text-crimson"}`}
                        >
                          {p.status === "approved" ? "অ্যাপ্রুভড" : "পেন্ডিং"}
                        </span>
                      </p>
                      <p className="text-xs text-chalk-300 truncate">
                        {p.department} · {p.position}
                        {p.jersey_no != null && <> · #{p.jersey_no}</>}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button onClick={() => startEdit(p)} className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5">
                      <Pencil size={14} /> এডিট
                    </button>
                    <button
                      onClick={() => handleDelete(p.id, p.name)}
                      className="text-crimson hover:bg-crimson/10 p-2 rounded-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
