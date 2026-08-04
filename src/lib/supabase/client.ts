import { createBrowserClient } from "@supabase/ssr";

// ব্রাউজারে (Client Components) ব্যবহারের জন্য Supabase ক্লায়েন্ট
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
