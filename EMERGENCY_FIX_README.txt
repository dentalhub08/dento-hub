DENTO HUB EMERGENCY CODE FIX

This patch is intentionally code-only:
- sanitizes corrupted/old cart + wishlist localStorage
- prevents Supabase auth/network errors from crashing the root storefront
- keeps Sign in / Hi name / Admin account menu
- makes ads failures non-fatal
- fixes Shop All and course navigation state
- avoids 0 products when course mappings have not been seeded yet
- accepts either NEXT_PUBLIC_SUPABASE_ANON_KEY or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

Apply from dento-hub-app:
Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_EMERGENCY_CODE_FIX.zip" -DestinationPath "." -Force
npm run build:cloudflare

If build succeeds:
git add .
git commit -m "Emergency storefront stability fix"
git push
