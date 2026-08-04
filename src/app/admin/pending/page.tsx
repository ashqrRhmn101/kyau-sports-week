"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { CheckCircle2, XCircle, UserCircle2 } from "lucide-react";
import Swal from "sweetalert2";

export default function PendingApprovalsPage() {
  const supabase = createClient();
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("players")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: true });
    setPending(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const approve = async (id: string) => {
    setBusyId(id);
    await supabase.from("players").update({ status: "approved" }).eq("id", id);
    setBusyId(null);
    load();
  };

  const reject = async (id: string, name: string) => {
    const result = await Swal.fire({
      icon: "warning",
      title: "প্রোফাইল রিজেক্ট করবেন?",
      text: `"${name}"-এর সাবমিট করা প্রোফাইলটি স্থায়ীভাবে মুছে যাবে।`,
      showCancelButton: true,
      confirmButtonText: "হ্যাঁ, রিজেক্ট করুন",
      cancelButtonText: "বাতিল",
      confirmButtonColor: "#E24C4B",
      cancelButtonColor: "#1B4229",
      background: "#0B1F17",
      color: "#F5F3EA",
    });
    if (!result.isConfirmed) return;

    setBusyId(id);
    await supabase.from("players").delete().eq("id", id);
    setBusyId(null);
    load();
  };

  if (loading) {
    return (
      <div className="flex justify-center py-24">
        <ClipLoader color="#FFC94A" size={36} />
      </div>
    );
  }

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">পেন্ডিং প্রোফাইল অ্যাপ্রুভাল</h1>

      {pending.length === 0 ? (
        <div className="card p-10 text-center text-chalk-300">কোনো পেন্ডিং প্রোফাইল নেই।</div>
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-12 h-12 rounded-full bg-pitch-800 border border-cardline overflow-hidden flex items-center justify-center shrink-0">
                  {p.photo_url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.photo_url} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <UserCircle2 className="text-chalk-300" size={26} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-chalk-100 font-medium truncate">
                    {p.name} <span className="text-chalk-300 font-normal">· {p.department}</span>
                  </p>
                  <p className="text-sm text-chalk-300">
                    পজিশন: {p.position}
                    {p.jersey_no != null && <> · জার্সি #{p.jersey_no}</>}
                  </p>
                  {p.bio && <p className="text-sm text-chalk-300 mt-1 max-w-md">{p.bio}</p>}
                </div>
              </div>
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => approve(p.id)}
                  disabled={busyId === p.id}
                  className="btn-primary text-sm px-3 py-1.5 flex items-center gap-1.5"
                >
                  {busyId === p.id ? <ClipLoader color="#0B1F17" size={14} /> : <CheckCircle2 size={16} />}
                  অ্যাপ্রুভ
                </button>
                <button
                  onClick={() => reject(p.id, p.name)}
                  disabled={busyId === p.id}
                  className="btn-secondary text-sm px-3 py-1.5 border-crimson/50 text-crimson hover:bg-crimson/10 flex items-center gap-1.5"
                >
                  <XCircle size={16} />
                  রিজেক্ট
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
