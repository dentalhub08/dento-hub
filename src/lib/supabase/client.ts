import { createBrowserClient } from "@supabase/ssr";

let cachedClient: ReturnType<typeof createBrowserClient> | null | undefined;

export function createClient() {
  if (typeof window === "undefined") return null;
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim();

  if (!url || !key) {
    console.warn("DENTO HUB: Supabase browser configuration is missing.");
    cachedClient = null;
    return null;
  }

  try {
    new URL(url);
    cachedClient = createBrowserClient(url, key);
    return cachedClient;
  } catch (error) {
    console.warn("DENTO HUB: Supabase browser client disabled", error);
    cachedClient = null;
    return null;
  }
}
