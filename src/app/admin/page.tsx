import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Users, Shield, UserCog, CalendarRange, Swords, UserCheck } from "lucide-react";

export const revalidate = 0;

export default async function AdminDashboard() {
  const supabase = createClient();

  const [
    { count: pendingPlayers },
    { count: totalPlayers },
    { count: totalTeams },
    { count: totalMatches },
    { count: totalCoaches },
    { count: totalSeasons },
  ] = await Promise.all([
    supabase.from("players").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("players").select("*", { count: "exact", head: true }).eq("status", "approved"),
    supabase.from("teams").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase.from("coaches").select("*", { count: "exact", head: true }),
    supabase.from("seasons").select("*", { count: "exact", head: true }),
  ]);

  const stats = [
    { label: "পেন্ডিং প্রোফাইল", value: pendingPlayers ?? 0, highlight: true, href: "/admin/pending" },
    { label: "অ্যাপ্রুভড প্লেয়ার", value: totalPlayers ?? 0, href: "/admin/players" },
    { label: "মোট টিম", value: totalTeams ?? 0, href: "/admin/teams" },
    { label: "মোট ম্যাচ", value: totalMatches ?? 0, href: "/admin/matches" },
    { label: "মোট কোচ", value: totalCoaches ?? 0, href: "/admin/coaches" },
    { label: "মোট সিজন", value: totalSeasons ?? 0, href: "/admin/seasons" },
  ];

  const shortcuts = [
    { href: "/admin/pending", label: "প্রোফাইল অ্যাপ্রুভ করুন", icon: UserCheck },
    { href: "/admin/players", label: "প্লেয়ার ম্যানেজ করুন", icon: Users },
    { href: "/admin/teams", label: "টিম ও স্কোয়াড", icon: Shield },
    { href: "/admin/coaches", label: "কোচ যোগ করুন", icon: UserCog },
    { href: "/admin/seasons", label: "সিজন যোগ করুন", icon: CalendarRange },
    { href: "/admin/matches", label: "ম্যাচ পরিচালনা করুন", icon: Swords },
  ];

  return (
    <div>
      <h1 className="font-display text-4xl text-chalk-100 mb-8">ড্যাশবোর্ড</h1>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-10">
        {stats.map((c) => (
          <Link key={c.label} href={c.href} className="card p-4 text-center hover:border-floodlight-500/60 transition-colors">
            <p
              className={`scoreboard-digit text-3xl font-bold ${c.highlight ? "text-crimson" : "text-floodlight-500"}`}
            >
              {c.value}
            </p>
            <p className="text-xs text-chalk-300 mt-1">{c.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="font-display text-2xl tracking-wide text-chalk-100 mb-4">দ্রুত অ্যাকশন</h2>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {shortcuts.map((s) => {
          const Icon = s.icon;
          return (
            <Link
              key={s.href}
              href={s.href}
              className="card p-4 flex items-center gap-3 hover:border-floodlight-500/60 transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-floodlight-500/15 text-floodlight-500 flex items-center justify-center shrink-0">
                <Icon size={18} />
              </div>
              <span className="text-sm text-chalk-100">{s.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
