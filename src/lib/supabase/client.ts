import { createBrowserClient } from "@supabase/ssr";
import {
  SUPABASE_PUBLIC_KEY,
  SUPABASE_PUBLIC_URL,
} from "./generated-public-config";

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (typeof window === "undefined") return null;

  if (cachedClient) return cachedClient;

  if (!SUPABASE_PUBLIC_URL || !SUPABASE_PUBLIC_KEY) {
    console.error("DENTO HUB: generated Supabase public config is empty.");
    return null;
  }

  cachedClient = createBrowserClient(
    SUPABASE_PUBLIC_URL,
    SUPABASE_PUBLIC_KEY
  );

  return cachedClient;
}
