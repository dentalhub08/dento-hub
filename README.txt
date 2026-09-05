DENTO HUB — ADMIN TOP RIGHT BAR FIX

This patch only appends/restores CSS for the existing AdminTopControls component.
It does not change Supabase, auth, products, prices, orders, or Cloudflare configuration.

From inside dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_ADMIN_TOP_RIGHT_BAR_FIX.zip" -DestinationPath "." -Force

node .\fix-admin-topbar.mjs

npm run build:cloudflare

If successful:
git add src/app/globals.css
git commit -m "Fix admin top right bar"
git push origin main
