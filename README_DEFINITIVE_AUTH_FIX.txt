DENTO HUB — DEFINITIVE LIVE AUTH FIX

Cause:
src/lib/supabase/client.ts already reads window.__DENTO_SUPABASE__,
but the current root layout never injects that runtime configuration.

This patch:
1. Creates /api/supabase-config
2. Reads NEXT_PUBLIC_SUPABASE_URL + public key from Cloudflare runtime bindings.
3. Loads that script before React hydration.
4. Leaves your current auth form and Supabase client logic intact.

Apply from INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_DEFINITIVE_AUTH_FIX.zip" -DestinationPath "." -Force

Then test:
npm run build:cloudflare

If successful:
git add .
git commit -m "Fix live Supabase config injection"
git push

After Cloudflare deploys, hard-refresh the login page once (Ctrl+Shift+R).

Do not run any older auth patch after this one.
