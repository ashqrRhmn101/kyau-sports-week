"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X, Shield, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { Profile } from "@/lib/types";

const links = [
  { href: "/", label: "হোম" },
  { href: "/players", label: "প্লেয়ার" },
  { href: "/teams", label: "টিম" },
  { href: "/matches", label: "ম্যাচ" },
  { href: "/leaderboard", label: "লিডারবোর্ড" },
  { href: "/champions", label: "চ্যাম্পিয়ন" },
];

function initials(name: string) {
  return name.trim().charAt(0).toUpperCase();
}

export default function Navbar() {
  const supabase = createClient();
  const pathname = usePathname();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return setProfile(null);
      const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
      setProfile(data as Profile | null);
    };
    load();
    const { data: sub } = supabase.auth.onAuthStateChange(() => load());
    return () => sub.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname?.startsWith(href));

  return (
    <header className="border-b border-cardline sticky top-0 z-40 bg-pitch-900/90 backdrop-blur">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-baseline gap-2 shrink-0">
          <span className="font-display text-3xl leading-none tracking-wide text-chalk-100">
            SPORTS<span className="text-floodlight-500">WEEK</span>
          </span>
          <span className="hidden sm:inline text-[11px] uppercase tracking-widest2 text-chalk-300">
            Football
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                isActive(l.href)
                  ? "bg-floodlight-500 text-pitch-900 font-semibold"
                  : "text-chalk-300 hover:bg-card hover:text-chalk-100"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className={`text-sm px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                isActive("/admin")
                  ? "bg-floodlight-500 text-pitch-900 font-semibold"
                  : "text-floodlight-500 hover:bg-card"
              }`}
            >
              <Shield size={14} /> অ্যাডমিন
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-3">
          {profile ? (
            <div className="hidden sm:flex items-center gap-2">
              <div
                title={profile.name}
                className="w-9 h-9 rounded-full bg-floodlight-500 text-pitch-900 font-bold flex items-center justify-center text-sm shrink-0"
              >
                {initials(profile.name)}
              </div>
              <span className="text-sm text-chalk-300 max-w-[110px] truncate">{profile.name}</span>
              <button
                onClick={handleSignOut}
                className="btn-secondary text-sm px-3 py-1.5 flex items-center gap-1.5"
              >
                <LogOut size={14} /> সাইন আউট
              </button>
            </div>
          ) : (
            <Link href="/login" className="hidden sm:inline-flex btn-primary text-sm px-3 py-1.5">
              লগইন
            </Link>
          )}

          <button
            className="md:hidden p-2 rounded-lg text-chalk-100 hover:bg-card"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="মেনু"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* মোবাইল ড্রয়ার মেনু */}
      {menuOpen && (
        <nav className="md:hidden border-t border-cardline px-4 py-3 space-y-1 bg-pitch-900">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`block text-sm px-3 py-2.5 rounded-lg ${
                isActive(l.href) ? "bg-floodlight-500 text-pitch-900 font-semibold" : "text-chalk-300"
              }`}
            >
              {l.label}
            </Link>
          ))}
          {profile?.role === "admin" && (
            <Link
              href="/admin"
              className={`block text-sm px-3 py-2.5 rounded-lg flex items-center gap-1.5 ${
                isActive("/admin") ? "bg-floodlight-500 text-pitch-900 font-semibold" : "text-floodlight-500"
              }`}
            >
              <Shield size={14} /> অ্যাডমিন
            </Link>
          )}

          <div className="pt-2 border-t border-cardline mt-2">
            {profile ? (
              <div className="flex items-center justify-between px-1">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-floodlight-500 text-pitch-900 font-bold flex items-center justify-center text-sm">
                    {initials(profile.name)}
                  </div>
                  <span className="text-sm text-chalk-300">{profile.name}</span>
                </div>
                <button onClick={handleSignOut} className="btn-secondary text-sm px-3 py-1.5">
                  সাইন আউট
                </button>
              </div>
            ) : (
              <Link href="/login" className="btn-primary w-full text-sm">
                লগইন
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
}
