import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/");

  return (
    <div className="pt-10">
      <p className="eyebrow mb-2">অ্যাডমিন প্যানেল</p>
      <div className="flex flex-wrap gap-2 mb-8">
        <Link href="/admin" className="text-sm text-chalk-300 hover:text-floodlight-500 px-3 py-1.5 card">
          ড্যাশবোর্ড
        </Link>
        <Link href="/admin/pending" className="text-sm text-chalk-300 hover:text-floodlight-500 px-3 py-1.5 card">
          পেন্ডিং অ্যাপ্রুভাল
        </Link>
        <Link
          href="/admin/matches/new"
          className="text-sm text-chalk-300 hover:text-floodlight-500 px-3 py-1.5 card"
        >
          + ম্যাচ এন্ট্রি
        </Link>
      </div>
      {children}
    </div>
  );
}
