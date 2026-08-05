"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  LayoutDashboard,
  UserCheck,
  Users,
  Shield,
  Trophy,
  UserCog,
  CalendarRange,
  Swords,
  Menu,
  X,
} from "lucide-react";

const nav = [
  { href: "/admin", label: "ড্যাশবোর্ড", icon: LayoutDashboard, exact: true },
  { href: "/admin/pending", label: "পেন্ডিং অ্যাপ্রুভাল", icon: UserCheck },
  { href: "/admin/players", label: "প্লেয়ার", icon: Users },
  { href: "/admin/teams", label: "টিম", icon: Shield },
  { href: "/admin/coaches", label: "কোচ", icon: UserCog },
  { href: "/admin/seasons", label: "সিজন", icon: CalendarRange },
  { href: "/admin/matches", label: "ম্যাচ", icon: Swords },
  { href: "/admin/users", label: "ইউজার রোল", icon: Trophy },
];

export default function AdminShell({
  children,
  adminName,
}: {
  children: React.ReactNode;
  adminName: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(href + "/");

  return (
    <div className="pt-6 lg:pt-10 lg:flex lg:gap-8 lg:items-start">
      {/* মোবাইলে টগল বার */}
      <div className="lg:hidden flex items-center justify-between mb-4">
        <div>
          <p className="eyebrow mb-1">অ্যাডমিন প্যানেল</p>
          <p className="text-sm text-chalk-300">স্বাগতম, {adminName}</p>
        </div>
        <button onClick={() => setOpen((v) => !v)} className="btn-secondary p-2">
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* সাইডবার */}
      <aside
        className={`${open ? "block" : "hidden"} lg:block lg:w-56 shrink-0 mb-6 lg:mb-0 lg:sticky lg:top-24`}
      >
        <div className="hidden lg:block mb-4">
          <p className="eyebrow mb-1">অ্যাডমিন প্যানেল</p>
          <p className="text-sm text-chalk-300">স্বাগতম, {adminName}</p>
        </div>
        <nav className="card p-2 flex flex-col gap-0.5">
          {nav.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.href, n.exact);
            return (
              <Link
                key={n.href}
                href={n.href}
                className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors ${
                  active
                    ? "bg-floodlight-500 text-pitch-900 font-semibold"
                    : "text-chalk-300 hover:bg-cardline/40 hover:text-chalk-100"
                }`}
              >
                <Icon size={16} />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <div className="flex-1 min-w-0">{children}</div>
    </div>
  );
}
