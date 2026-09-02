import { getCloudflareContext } from "@opennextjs/cloudflare";

type PublicSupabaseEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

export async function getSupabaseRuntimeConfig() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  let key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim() || "";

  if (url && key) return { url, key };

  try {
    const { env } = await getCloudflareContext({ async: true });
    const runtime = env as unknown as PublicSupabaseEnv;

    url ||= runtime.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
    key ||= (
      runtime.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      runtime.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
    )?.trim() || "";
  } catch (error) {
    console.warn("DENTO HUB: Cloudflare runtime env unavailable", error);
  }

  return { url, key };
}
