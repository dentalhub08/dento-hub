DENTO HUB — BUNDLE PRODUCT PICKER FIX

Cause fixed:
AdminBundles previously loaded products and all bundle tables in one Promise.all.
If ANY bundle table query failed, the function returned before setProducts(),
leaving the picker at "0 shown / 0 total".

This patch:
- loads products FIRST and independently
- uses a fallback product query for older schemas
- keeps all catalog products visible even if a bundle table has an error
- loads courses independently
- shows bundle migration errors without wiping the catalog picker

Apply from inside dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_BUNDLE_PRODUCTS_VISIBLE_FIX.zip" -DestinationPath "." -Force

npm run build:cloudflare

If successful:
git add src/components/admin-bundles.tsx
git commit -m "Fix bundle product picker loading"
git push origin main

No Cloudflare/Supabase auth settings are changed.
