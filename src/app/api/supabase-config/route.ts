import { getCloudflareContext } from "@opennextjs/cloudflare";

export const dynamic = "force-dynamic";

type PublicEnv = {
  NEXT_PUBLIC_SUPABASE_URL?: string;
  NEXT_PUBLIC_SUPABASE_ANON_KEY?: string;
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?: string;
};

function js(value: unknown) {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function GET() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
  let key = (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  )?.trim() || "";

  if (!url || !key) {
    try {
      const { env } = await getCloudflareContext({ async: true });
      const runtime = env as unknown as PublicEnv;

      url ||= runtime.NEXT_PUBLIC_SUPABASE_URL?.trim() || "";
      key ||= (
        runtime.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
        runtime.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
      )?.trim() || "";
    } catch (error) {
      console.error("DENTO HUB: could not read Cloudflare runtime env", error);
    }
  }

  const body =
    url && key
      ? `window.__DENTO_SUPABASE__=${js({ url, key })};`
      : `console.error("DENTO HUB: Supabase runtime configuration is missing.");`;

  return new Response(body, {
    status: 200,
    headers: {
      "content-type": "application/javascript; charset=utf-8",
      "cache-control": "no-store, no-cache, must-revalidate, max-age=0",
      pragma: "no-cache",
    },
  });
}
