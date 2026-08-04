"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function NewPlayerPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: "",
    department: "",
    position: "MID",
    jersey_no: "",
    bio: "",
    photo_url: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setChecking(false);
    });
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setError(null);

    const { error: insertError } = await supabase.from("players").insert({
      profile_id: userId,
      name: form.name,
      department: form.department,
      position: form.position,
      jersey_no: form.jersey_no ? Number(form.jersey_no) : null,
      bio: form.bio || null,
      photo_url: form.photo_url || null,
      status: "pending",
      submitted_by: userId,
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }
    router.push("/players?submitted=1");
  };

  if (checking) return <p className="pt-16 text-chalk-300">লোড হচ্ছে…</p>;

  if (!userId) {
    return (
      <div className="pt-16 card p-8 max-w-md">
        <p className="text-chalk-100 font-medium mb-2">প্রোফাইল সাবমিট করতে লগইন করুন</p>
        <p className="text-chalk-300 text-sm mb-4">
          প্লেয়ার প্রোফাইল তৈরি করতে হলে আগে আপনাকে সাইন ইন করতে হবে।
        </p>
        <a href="/login" className="btn-primary">
          লগইন করুন
        </a>
      </div>
    );
  }

  return (
    <div className="pt-10 max-w-xl">
      <p className="eyebrow mb-2">প্লেয়ার প্রোফাইল</p>
      <h1 className="font-display text-4xl text-chalk-100 mb-2">আপনার প্রোফাইল সাবমিট করুন</h1>
      <p className="text-chalk-300 mb-8 text-sm">
        সাবমিট করার পর প্রোফাইলটি "পেন্ডিং" অবস্থায় থাকবে। অ্যাডমিন অ্যাপ্রুভ করলে এটি পাবলিকলি
        দেখা যাবে।
      </p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="text-sm text-chalk-300 block mb-1">নাম *</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-chalk-300 block mb-1">ডিপার্টমেন্ট *</label>
            <input
              required
              value={form.department}
              onChange={(e) => setForm({ ...form, department: e.target.value })}
              className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
            />
          </div>
          <div>
            <label className="text-sm text-chalk-300 block mb-1">জার্সি নম্বর</label>
            <input
              type="number"
              value={form.jersey_no}
              onChange={(e) => setForm({ ...form, jersey_no: e.target.value })}
              className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-chalk-300 block mb-1">পজিশন *</label>
          <select
            value={form.position}
            onChange={(e) => setForm({ ...form, position: e.target.value })}
            className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
          >
            <option value="GK">গোলকিপার</option>
            <option value="DEF">ডিফেন্ডার</option>
            <option value="MID">মিডফিল্ডার</option>
            <option value="FWD">ফরোয়ার্ড</option>
          </select>
        </div>
        <div>
          <label className="text-sm text-chalk-300 block mb-1">ছবির URL (ঐচ্ছিক)</label>
          <input
            value={form.photo_url}
            onChange={(e) => setForm({ ...form, photo_url: e.target.value })}
            placeholder="https://..."
            className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
          />
        </div>
        <div>
          <label className="text-sm text-chalk-300 block mb-1">সংক্ষিপ্ত পরিচিতি</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
          />
        </div>

        {error && <p className="text-crimson text-sm">{error}</p>}

        <button type="submit" disabled={submitting} className="btn-primary w-full">
          {submitting ? "সাবমিট হচ্ছে…" : "রিভিউর জন্য সাবমিট করুন"}
        </button>
      </form>
    </div>
  );
}
