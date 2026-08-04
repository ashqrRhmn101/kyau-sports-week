"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function PendingApprovalsPage() {
  const supabase = createClient();
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
    await supabase.from("players").update({ status: "approved" }).eq("id", id);
    load();
  };

  const reject = async (id: string) => {
    await supabase.from("players").delete().eq("id", id);
    load();
  };

  if (loading) return <p className="text-chalk-300">লোড হচ্ছে…</p>;

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">পেন্ডিং প্রোফাইল অ্যাপ্রুভাল</h1>

      {pending.length === 0 ? (
        <div className="card p-10 text-center text-chalk-300">কোনো পেন্ডিং প্রোফাইল নেই।</div>
      ) : (
        <div className="space-y-4">
          {pending.map((p) => (
            <div key={p.id} className="card p-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-chalk-100 font-medium">
                  {p.name} <span className="text-chalk-300 font-normal">· {p.department}</span>
                </p>
                <p className="text-sm text-chalk-300">
                  পজিশন: {p.position}
                  {p.jersey_no != null && <> · জার্সি #{p.jersey_no}</>}
                </p>
                {p.bio && <p className="text-sm text-chalk-300 mt-1 max-w-md">{p.bio}</p>}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => approve(p.id)} className="btn-primary text-sm px-3 py-1.5">
                  অ্যাপ্রুভ
                </button>
                <button
                  onClick={() => reject(p.id)}
                  className="btn-secondary text-sm px-3 py-1.5 border-crimson/50 text-crimson hover:bg-crimson/10"
                >
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
