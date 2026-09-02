DENTO HUB — RUNTIME SUPABASE AUTH FIX

What this fixes:
- "Connect Supabase in .env.local to enable authentication" on the live Cloudflare site.
- Browser auth now receives the PUBLIC Supabase config from Cloudflare runtime variables.
- Server-side Supabase also uses the same runtime fallback.
- No service-role secret is exposed to the browser.
- The page is forced dynamic so Cloudflare runtime bindings are available per request.

Apply from INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_RUNTIME_SUPABASE_AUTH_FIX.zip" -DestinationPath "." -Force

Then:
npm run build:cloudflare

If successful:
git add .
git commit -m "Fix Supabase runtime auth config"
git push

Keep these existing Cloudflare variables:
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

Do NOT put SUPABASE_SERVICE_ROLE_KEY in browser/public config.
