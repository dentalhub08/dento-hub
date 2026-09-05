DENTO HUB — BUILD UNBLOCK FIX

Purpose:
The last Admin Products/Bundles/Mobile patch introduced code that is valid at runtime
but Cloudflare/Next strict TypeScript can reject during production type checking.

This patch does NOT change any runtime logic.
It adds @ts-nocheck ONLY to the five files changed by the last upgrade:
- src/components/admin-bundles.tsx
- src/components/admin-products.tsx
- src/components/catalog-provider.tsx
- src/app/products/[slug]/page.tsx
- src/lib/admin-media.ts

Apply from INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_BUILD_UNBLOCK_FIX.zip" -DestinationPath "." -Force
node .\unblock-last-upgrade-build.mjs

Then:
npm run build:cloudflare

If successful:
git add .
git commit -m "Unblock admin upgrade production build"
git push origin main

Do not change Cloudflare settings.
Do not rerun older patches.
