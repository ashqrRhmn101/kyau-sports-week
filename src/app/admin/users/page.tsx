"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { Trophy, UserCircle2 } from "lucide-react";
import Swal from "sweetalert2";

export default function UsersAdminPage() {
  const supabase = createClient();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data: authUser } = await supabase.auth.getUser();
    setCurrentUserId(authUser.user?.id ?? null);
    const { data } = await supabase.from("profiles").select("*").order("name");
    setUsers(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const changeRole = async (id: string, name: string, role: string) => {
    if (id === currentUserId && role !== "admin") {
      const result = await Swal.fire({
        icon: "warning",
        title: "নিজের অ্যাডমিন অ্যাক্সেস সরিয়ে ফেলবেন?",
        text: "এটা করলে আপনি সাথে সাথে অ্যাডমিন প্যানেল থেকে বের হয়ে যাবেন। আরেকজন অ্যাডমিন না থাকলে আবার ঢুকতে Supabase SQL Editor ব্যবহার করতে হবে।",
        showCancelButton: true,
        confirmButtonText: "হ্যাঁ, নিশ্চিত",
        cancelButtonText: "বাতিল",
        confirmButtonColor: "#E24C4B",
        background: "#0B1F17",
        color: "#F5F3EA",
      });
      if (!result.isConfirmed) return;
    }
    setBusyId(id);
    await supabase.from("profiles").update({ role }).eq("id", id);
    setBusyId(null);
    load();
    if (id === currentUserId && role !== "admin") window.location.href = "/";
  };

  const roleStyle: Record<string, string> = {
    admin: "bg-floodlight-500/15 text-floodlight-500",
    player: "bg-pitch-600/30 text-chalk-300",
    viewer: "bg-cardline/40 text-chalk-300",
  };

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-2 flex items-center gap-3">
        <Trophy className="text-floodlight-500" /> ইউজার রোল
      </h1>
      <p className="text-sm text-chalk-300 mb-8">
        কাউকে অ্যাডমিন বানাতে বা প্লেয়ার/ভিউয়ার রোল পরিবর্তন করতে এখান থেকেই করুন।
      </p>

      {loading ? (
        <div className="flex justify-center py-16">
          <ClipLoader color="#FFC94A" size={32} />
        </div>
      ) : (
        <div className="card divide-y divide-cardline">
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <UserCircle2 className="text-chalk-300 shrink-0" size={26} />
                <div className="min-w-0">
                  <p className="text-chalk-100 font-medium truncate">
                    {u.name} {u.id === currentUserId && <span className="text-xs text-floodlight-500">(আপনি)</span>}
                  </p>
                  <p className="text-xs text-chalk-300 truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {busyId === u.id && <ClipLoader color="#FFC94A" size={14} />}
                <select
                  value={u.role}
                  onChange={(e) => changeRole(u.id, u.name, e.target.value)}
                  disabled={busyId === u.id}
                  className={`status-pill px-2.5 py-1 border-none ${roleStyle[u.role]}`}
                >
                  <option value="admin">অ্যাডমিন</option>
                  <option value="player">প্লেয়ার</option>
                  <option value="viewer">ভিউয়ার</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
