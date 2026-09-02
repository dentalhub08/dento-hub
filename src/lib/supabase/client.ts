import { createBrowserClient } from "@supabase/ssr";

type BrowserRuntimeConfig = {
  url?: string;
  key?: string;
};

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;
let cachedSignature = "";

function readPublicConfig() {
  if (typeof window === "undefined") return { url: "", key: "" };

  const runtime = (
    window as Window & {
      __DENTO_SUPABASE__?: BrowserRuntimeConfig;
    }
  ).__DENTO_SUPABASE__;

  const url =
    runtime?.url?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    "";

  const key =
    runtime?.key?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ||
    "";

  return { url, key };
}

export function createClient() {
  if (typeof window === "undefined") return null;

  const { url, key } = readPublicConfig();

  // Do not permanently cache a missing configuration. A later call can recover.
  if (!url || !key) {
    console.warn("DENTO HUB: Supabase public runtime config is not available yet.");
    return null;
  }

  const signature = `${url}::${key}`;
  if (cachedClient && cachedSignature === signature) return cachedClient;

  try {
    new URL(url);
    cachedClient = createBrowserClient(url, key);
    cachedSignature = signature;
    return cachedClient;
  } catch (error) {
    console.error("DENTO HUB: Supabase browser client could not start", error);
    cachedClient = null;
    cachedSignature = "";
    return null;
  }
}
