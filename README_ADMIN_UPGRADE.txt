DENTO HUB — ADMIN MEDIA + BUNDLES + MOBILE UPGRADE

THIS UPGRADE CHANGES ONLY ADMIN FEATURES:
1) Mobile Admin navigation/layout
2) Ads/Banners image upload
3) Bundle creation with products, quantities, price and image

It does NOT change:
- login/auth
- Cloudflare environment variables
- customer signup
- product prices
- delivery rules
- existing orders

STEP 1 — DATABASE (one time)
Open Supabase > SQL Editor.
Paste and run:
supabase/migrations/005_admin_media_bundles.sql

This creates:
- public image bucket: dento-media
- Admin-only upload/delete storage policies
- bundle tables + RLS
- missing banner media/bilingual columns

STEP 2 — APPLY CODE
From INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_ADMIN_MEDIA_BUNDLES_MOBILE_UPGRADE.zip" -DestinationPath "." -Force

node .\apply-admin-upgrade.mjs

STEP 3 — TEST BUILD
npm run build:cloudflare

STEP 4 — PUSH
git add .
git commit -m "Upgrade admin mobile banners and bundles"
git push origin main

TEST AFTER DEPLOY
/admin on mobile:
- horizontal Admin navigation is visible and swipeable
- pages do not disappear behind the sidebar
- tables scroll inside their card, not the whole page

/admin/banners:
- New ad
- Upload image
- Save
- image appears in ad list

/admin/bundles:
- Create bundle
- choose products
- quantities
- bundle price
- package image
- Active / Available / Featured
- save and edit

SECURITY
The `dento-media` bucket is public-read because storefront images are public.
Only the authenticated single Admin can INSERT/UPDATE/DELETE files through RLS.
No service-role key is sent to the browser.
