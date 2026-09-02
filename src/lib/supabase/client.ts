import { createBrowserClient } from "@supabase/ssr";

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;
let cachedSignature = "";

export function createClient() {
  if (typeof window === "undefined") return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  const key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim() || "";

  // IMPORTANT: never cache a missing config as null.
  if (!url || !key) {
    console.error(
      "DENTO HUB: Supabase public configuration is missing from the browser build."
    );
    return null;
  }

  const signature = `${url}::${key}`;
  if (cachedClient && cachedSignature == signature) return cachedClient;

  try {
    new URL(url);
    cachedClient = createBrowserClient(url, key);
    cachedSignature = signature;
    return cachedClient;
  } catch (error) {
    console.error("DENTO HUB: invalid Supabase browser configuration", error);
    cachedClient = null;
    cachedSignature = "";
    return null;
  }
}
