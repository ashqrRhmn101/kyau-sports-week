import { createClient } from "@/lib/supabase/server";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = createClient();

  const [{ count: pendingPlayers }, { count: totalPlayers }, { count: totalTeams }, { count: totalMatches }] =
    await Promise.all([
      supabase.from("players").select("*", { count: "exact", head: true }).eq("status", "pending"),
      supabase.from("players").select("*", { count: "exact", head: true }).eq("status", "approved"),
      supabase.from("teams").select("*", { count: "exact", head: true }),
      supabase.from("matches").select("*", { count: "exact", head: true }),
    ]);

  const cards = [
    { label: "পেন্ডিং প্রোফাইল", value: pendingPlayers ?? 0, highlight: true },
    { label: "অ্যাপ্রুভড প্লেয়ার", value: totalPlayers ?? 0 },
    { label: "মোট টিম", value: totalTeams ?? 0 },
    { label: "মোট ম্যাচ", value: totalMatches ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">ড্যাশবোর্ড</h1>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5 text-center">
            <p
              className={`scoreboard-digit text-4xl font-bold ${c.highlight ? "text-crimson" : "text-floodlight-500"}`}
            >
              {c.value}
            </p>
            <p className="text-xs text-chalk-300 mt-1">{c.label}</p>
          </div>
        ))}
      </div>
      <p className="text-chalk-300 text-sm mt-8">
        নতুন সিজন, টিম বা কোচ যোগ করতে চাইলে আপাতত Supabase Table Editor থেকে সরাসরি এন্ট্রি
        করুন — এই ধাপগুলো README-এ বলা আছে। প্লেয়ার প্রোফাইল অ্যাপ্রুভাল ও ম্যাচ এন্ট্রির জন্য
        উপরের মেনু ব্যবহার করুন।
      </p>
    </div>
  );
}
