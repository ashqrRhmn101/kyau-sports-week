"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { ClipLoader } from "react-spinners";
import { ImagePlus, UserCircle2 } from "lucide-react";
import Swal from "sweetalert2";
import imageCompression from "browser-image-compression";

export default function NewPlayerPage() {
  const supabase = createClient();
  const router = useRouter();

  const [userId, setUserId] = useState<string | null>(null);
  const [checking, setChecking] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);

  const [form, setForm] = useState({
    name: "",
    department: "",
    position: "MID",
    jersey_no: "",
    bio: "",
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setChecking(false);
    });
  }, [supabase]);

  // ছবি বাছাই করলেই সেটা ছোট রেজুলেশনে কমপ্রেস করে প্রিভিউ দেখানো হয় —
  // এতে ডেটাবেজ/স্টোরেজে বড় সাইজের ছবি জমে জায়গা বা লোডিং স্পিড নষ্ট হবে না
  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    try {
      const compressed = await imageCompression(file, {
        maxSizeMB: 0.3,
        maxWidthOrHeight: 480,
        useWebWorker: true,
        fileType: "image/webp",
      });
      setPhotoFile(compressed);
      setPhotoPreview(URL.createObjectURL(compressed));
    } catch {
      setError("ছবি প্রসেস করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।");
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setSubmitting(true);
    setError(null);

    let photo_url: string | null = null;

    if (photoFile) {
      const path = `${userId}/${Date.now()}.webp`;
      const { error: uploadError } = await supabase.storage.from("avatars").upload(path, photoFile, {
        contentType: "image/webp",
        upsert: true,
      });
      if (uploadError) {
        setSubmitting(false);
        setError("ছবি আপলোড করতে সমস্যা হয়েছে: " + uploadError.message);
        return;
      }
      const { data: publicUrl } = supabase.storage.from("avatars").getPublicUrl(path);
      photo_url = publicUrl.publicUrl;
    }

    const { error: insertError } = await supabase.from("players").insert({
      profile_id: userId,
      name: form.name,
      department: form.department,
      position: form.position,
      jersey_no: form.jersey_no ? Number(form.jersey_no) : null,
      bio: form.bio || null,
      photo_url,
      status: "pending",
      submitted_by: userId,
    });

    setSubmitting(false);
    if (insertError) {
      setError(insertError.message);
      return;
    }

    await Swal.fire({
      icon: "success",
      title: "সাবমিট সম্পন্ন হয়েছে!",
      text: "আপনার প্রোফাইলটি রিভিউর জন্য পাঠানো হয়েছে। অ্যাডমিন অ্যাপ্রুভ করলেই এটি সবার জন্য দৃশ্যমান হবে।",
      confirmButtonText: "ঠিক আছে",
      confirmButtonColor: "#FFC94A",
      background: "#0B1F17",
      color: "#F5F3EA",
    });
    router.push("/players");
  };

  if (checking) {
    return (
      <div className="flex justify-center py-24">
        <ClipLoader color="#FFC94A" size={36} />
      </div>
    );
  }

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

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        {/* ছবি আপলোড */}
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-full bg-pitch-800 border border-cardline overflow-hidden flex items-center justify-center shrink-0">
            {compressing ? (
              <ClipLoader color="#FFC94A" size={22} />
            ) : photoPreview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photoPreview} alt="প্রিভিউ" className="w-full h-full object-cover" />
            ) : (
              <UserCircle2 className="text-chalk-300" size={36} />
            )}
          </div>
          <label className="btn-secondary cursor-pointer text-sm flex items-center gap-2">
            <ImagePlus size={16} />
            {photoPreview ? "ছবি বদলান" : "ছবি আপলোড করুন"}
            <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </label>
        </div>

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
          <label className="text-sm text-chalk-300 block mb-1">সংক্ষিপ্ত পরিচিতি</label>
          <textarea
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            rows={3}
            className="w-full bg-pitch-800 border border-cardline rounded-lg px-3 py-2 text-chalk-100"
          />
        </div>

        {error && <p className="text-crimson text-sm">{error}</p>}

        <button type="submit" disabled={submitting || compressing} className="btn-primary w-full flex items-center justify-center gap-2">
          {submitting ? <ClipLoader color="#0B1F17" size={16} /> : null}
          {submitting ? "সাবমিট হচ্ছে…" : "রিভিউর জন্য সাবমিট করুন"}
        </button>
      </form>
    </div>
  );
}
