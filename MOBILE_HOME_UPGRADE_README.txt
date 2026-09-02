DENTO HUB - Final Mobile Homepage Upgrade

Changed:
- Mobile-first homepage layout
- Removed homepage choose/list/checklist UX
- Replaced hero quick list with direct shopping cards
- Replaced kit checklist with simple kit cards
- Swipeable course/product/kit/year rails on phones
- Cleaner mobile hero, buttons, spacing, product discovery
- Mobile menu icon now opens the shop instead of doing nothing

Apply from dento-hub-app root:
Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_FINAL_MOBILE_HOME_PATCH.zip" -DestinationPath "." -Force

Then test:
npm run build

If build succeeds:
git add .
git commit -m "Final mobile homepage polish"
git push

Cloudflare should rebuild from the main branch.
No Supabase migration is required.
