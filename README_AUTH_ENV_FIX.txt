DENTO HUB — Supabase Auth Environment Fix

This patch changes only:
- next.config.ts
- src/lib/supabase/client.ts

Purpose:
- Guarantees the public Supabase URL/key are injected into the Next.js browser bundle during Cloudflare build.
- Supports either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.
- Fails the build clearly if the required Cloudflare build variables are missing, rather than deploying a site whose login cannot connect.
- Does NOT add or expose SUPABASE_SERVICE_ROLE_KEY.

Apply from the dento-hub-app project root:
Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_SUPABASE_AUTH_ENV_FIX.zip" -DestinationPath "." -Force
npm run build:cloudflare

If the build succeeds:
git add .
git commit -m "Fix Supabase auth environment"
git push
