"use client";

import { ClipLoader } from "react-spinners";

export default function PageSpinner({ label = "লোড হচ্ছে…" }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-chalk-300">
      <ClipLoader color="#FFC94A" size={36} speedMultiplier={0.9} />
      <p className="text-sm">{label}</p>
    </div>
  );
}
