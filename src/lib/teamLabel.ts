// টিমের নাম সেট করা থাকলে সেটা দেখাবে, না থাকলে ডিপার্টমেন্ট দেখাবে (পুরনো ডেটার জন্য ব্যাকওয়ার্ড কম্প্যাটিবল)
export function teamLabel(team: { name?: string | null; department?: string | null } | null | undefined): string {
  if (!team) return "TBD";
  return team.name?.trim() || team.department || "TBD";
}
