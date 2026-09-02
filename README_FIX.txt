DENTO HUB SHOP FILTER FIX

What this fixes:
1) Header course links now update ShopClient state when URL search params change.
2) "Shop all" correctly resets the course to All courses.
3) If product_courses mappings are not seeded yet, selecting a course no longer produces an empty 0-product page. It safely shows the available catalog until mappings are added in Supabase.
4) Once mappings exist for that course, the filter automatically becomes strict and shows only mapped products.

Apply from inside dento-hub-app:
  Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_SHOP_FILTER_FIX.zip" -DestinationPath "." -Force
  npm run build:cloudflare
  git add .
  git commit -m "Fix shop course filters"
  git push
