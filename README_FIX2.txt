DENTO HUB — ADMIN FIX 2

Fixes requested:
1. Bundle editor now loads ALL catalog products immediately (not 40, and no invalid canonical_name_en query).
2. Product editor can Upload / Replace / Remove product image.
3. Uploaded product image is used on the storefront catalog and product-detail page.
4. Removing an image can also suppress the old mapped fallback image.
5. Mobile Admin/editor layout gets a second responsive pass with full-screen editors and contained scrolling.

IMPORTANT — DATABASE FIRST
Supabase > SQL Editor > New query
Run:
  supabase/migrations/006_product_image_editor.sql

APPLY PATCH
From inside dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_ADMIN_PRODUCTS_BUNDLES_MOBILE_FIX2.zip" -DestinationPath "." -Force
node .\apply-dento-admin-fix2.mjs

BUILD
npm run build:cloudflare

PUSH
 git add .
 git commit -m "Fix bundle catalog product images and admin mobile"
 git push origin main

TEST
/admin/bundles
- Create bundle
- all catalog products should appear before typing anything
- search filters the full list

/admin/products
- open an existing product
- Upload image / Replace image
- Remove image
- Save changes
- refresh storefront and product page to confirm the image

MOBILE
- open /admin on a phone
- swipe the Admin navigation row
- open Products and Bundles
- editors should occupy the full phone screen with their own scroll area
- footer buttons remain reachable
