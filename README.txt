DENTO HUB — FINAL 6 TYPESCRIPT ERRORS FIX

Apply from inside dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_LAST_6_TS_ERRORS_FIX.zip" -DestinationPath "." -Force
node .\fix-last-6-types.mjs
npm run build:cloudflare

If the build succeeds:
git add .
git commit -m "Fix final Supabase TypeScript callbacks"
git push

This patch only changes:
- src/components/auth-account-menu.tsx
- src/components/store-provider.tsx

It does NOT change UI, Supabase settings, Cloudflare settings, shop filters, cart behavior, or authentication flow.
