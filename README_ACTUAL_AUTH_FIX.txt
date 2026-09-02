DENTO HUB — ACTUAL AUTH FIX

This patch is based on the current GitHub main branch.

It changes ONLY:
1) next.config.ts
2) src/lib/supabase/client.ts

Why:
- Current next.config.ts does not explicitly inject the Supabase public env variables.
- Current browser client caches missing configuration as null.
- The new code supports both ANON_KEY and PUBLISHABLE_KEY.

Apply from INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_ACTUAL_AUTH_FIX.zip" -DestinationPath "." -Force

Then:
npm run build:cloudflare

If the build FAILS with "Missing Supabase build variables":
Cloudflare Build Variables are not actually set and must be corrected.

If the build SUCCEEDS:
git add .
git commit -m "Fix live Supabase browser auth"
git push

Do not change Supabase settings or Cloudflare commands.
