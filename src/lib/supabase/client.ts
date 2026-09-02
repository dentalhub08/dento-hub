import { createBrowserClient } from "@supabase/ssr";

let cachedClient: ReturnType<typeof createBrowserClient> | null | undefined;

export function createClient() {
  // Client Components are pre-rendered on the server too. Never construct a
  // browser Supabase client during SSR.
  if (typeof window === "undefined") return null;
  if (cachedClient !== undefined) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !key) {
    cachedClient = null;
    return null;
  }

  try {
    // Fail closed instead of taking down the storefront if env values are bad.
    new URL(url);
    cachedClient = createBrowserClient(url, key);
    return cachedClient;
  } catch (error) {
    console.error("DENTO HUB: Supabase browser client could not start", error);
    cachedClient = null;
    return null;
  }
}
