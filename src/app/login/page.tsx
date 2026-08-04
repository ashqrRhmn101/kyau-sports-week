"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { Mail, Lock, User, Building2 } from "lucide-react";
import Swal from "sweetalert2";

export default function LoginPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (mode === "signin") {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (signInError) return setError(signInError.message);
      window.location.href = "/";
    } else {
      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name, role: "player", department } },
      });
      setLoading(false);
      if (signUpError) return setError(signUpError.message);

      await Swal.fire({
        icon: "success",
        title: "প্রায় হয়ে গেছে! 📩",
        html: `আপনার <b>${email}</b> ইনবক্স চেক করুন এবং ভেরিফিকেশন লিংকে ক্লিক করে অ্যাকাউন্ট সম্পূর্ণ করুন।`,
        confirmButtonText: "বুঝেছি",
        confirmButtonColor: "#FFC94A",
        background: "#0B1F17",
        color: "#F5F3EA",
      });
      setMode("signin");
    }
  };

  return (
    <div className="pt-16 max-w-md mx-auto">
      <p className="eyebrow mb-2 text-center">অ্যাকাউন্ট</p>
      <h1 className="font-display text-4xl text-chalk-100 mb-8 text-center">
        {mode === "signin" ? "লগইন করুন" : "অ্যাকাউন্ট তৈরি করুন"}
      </h1>

      <div className="flex mb-6 rounded-lg border border-cardline overflow-hidden text-sm">
        <button
          onClick={() => setMode("signin")}
          className={`flex-1 py-2 ${mode === "signin" ? "bg-floodlight-500 text-pitch-900 font-semibold" : "text-chalk-300"}`}
        >
          লগইন
        </button>
        <button
          onClick={() => setMode("signup")}
          className={`flex-1 py-2 ${mode === "signup" ? "bg-floodlight-500 text-pitch-900 font-semibold" : "text-chalk-300"}`}
        >
          সাইন আপ
        </button>
      </div>

      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        {mode === "signup" && (
          <>
            <div>
              <label className="text-sm text-chalk-300 block mb-1 flex items-center gap-1.5">
                <User size={14} /> নাম
              </label>
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
              />
            </div>
            <div>
              <label className="text-sm text-chalk-300 block mb-1 flex items-center gap-1.5">
                <Building2 size={14} /> ডিপার্টমেন্ট
              </label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
              />
            </div>
          </>
        )}
        <div>
          <label className="text-sm text-chalk-300 block mb-1 flex items-center gap-1.5">
            <Mail size={14} /> ইমেইল
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
          />
        </div>
        <div>
          <label className="text-sm text-chalk-300 block mb-1 flex items-center gap-1.5">
            <Lock size={14} /> পাসওয়ার্ড
          </label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
          />
        </div>

        {error && <p className="text-crimson text-sm">{error}</p>}

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <ClipLoader color="#0B1F17" size={16} /> : null}
          {loading ? "অপেক্ষা করুন…" : mode === "signin" ? "লগইন করুন" : "সাইন আপ করুন"}
        </button>
      </form>
    </div>
  );
}
