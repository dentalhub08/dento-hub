DENTO HUB — FINAL DELIVERY PRICE = 75 EGP

Final business rule:
- ALL Alexandria Governorate deliveries = 75 EGP
- Alamein International University = 75 EGP

1) SUPABASE
Open Supabase > SQL Editor.
Run:

supabase/migrations/008_alexandria_aiu_75.sql

This updates:
- Alexandria governorate rule -> 75
- existing Alexandria city rules -> 75
- Alamein International University override -> 75
- creates the missing rule if needed

2) OPTIONAL CODE FALLBACK
From inside dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_FINAL_DELIVERY_75.zip" -DestinationPath "." -Force

node .\set-delivery-fallback-75.mjs

3) BUILD
npm run build:cloudflare

4) PUSH
git add .
git commit -m "Set Alexandria and AIU delivery to 75 EGP"
git push origin main

After deploy:
- choose any Alexandria address -> Delivery should show EGP 75
- choose Alamein International University -> Delivery should show EGP 75
