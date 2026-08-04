"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const links = [
  { href: "/players", label: "প্লেয়ার" },
  { href: "/teams", label: "টিম" },
  { href: "/matches", label: "ম্যাচ" },
  { href: "/leaderboard", label: "লিডারবোর্ড" },
];

export default function Navbar() {
  const supabase = createClient();
  const [profile, setProfile] = useState<Profile | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setProfile(null);
      const { data } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();
      setProfile(data as Profile | null);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  return (
    <header className="border-b border-cardline sticky top-0 z-40 bg-pitch-900/85 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-3xl leading-none tracking-wide text-chalk-100">
            SPORTS<span className="text-floodlight-500">WEEK</span>
          </span>
          <span className="hidden sm:inline text-[11px] uppercase tracking-widest2 text-chalk-300">
            Football
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-sm text-chalk-300 hover:text-floodlight-500 transition-colors"
            >
              {l.label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className="text-sm text-floodlight-500 hover:text-floodlight-400 transition-colors"
            >
              অ্যাডমিন
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {profile ? (
            <>
              <span className="hidden sm:inline text-sm text-chalk-300">
                {profile.name}
              </span>
              <button onClick={handleSignOut} className="btn-secondary text-sm px-3 py-1.5">
                সাইন আউট
              </button>
            </>
          ) : (
            <Link href="/login" className="btn-primary text-sm px-3 py-1.5">
              লগইন
            </Link>
          )}
        </div>
      </div>
      <nav className="md:hidden flex items-center gap-4 px-4 pb-3 overflow-x-auto">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="text-sm text-chalk-300 whitespace-nowrap">
            {l.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
