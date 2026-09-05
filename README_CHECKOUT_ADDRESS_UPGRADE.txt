DENTO HUB — SHOPIFY-STYLE CHECKOUT ADDRESS BOOK

What this upgrade adds:
- Choose from saved addresses during checkout
- Add a new address without leaving checkout
- Edit an existing saved address
- Country / region (Egypt)
- Recipient full name
- Phone
- All 27 Egyptian governorates
- City / area
- Street
- Building / villa
- Floor
- Apartment / unit
- Postal code
- Landmark
- Optional university/campus delivery
- Delivery notes
- Default-address toggle
- Address-driven delivery-rule preview
- Mobile bottom-sheet checkout address UI

STEP 1 — Supabase SQL
Open Supabase > SQL Editor and run:

supabase/migrations/007_checkout_address_upgrade.sql

This only adds:
- country
- postal_code
- updated_at
to the existing addresses table.

STEP 2 — Apply code
From INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_CHECKOUT_SHOPIFY_ADDRESS_UPGRADE.zip" -DestinationPath "." -Force

node .\apply-checkout-address-upgrade.mjs

STEP 3 — Test build

npm run build:cloudflare

STEP 4 — Push

git add .
git commit -m "Add Shopify style checkout addresses"
git push origin main

IMPORTANT
This upgrade does NOT create orders client-side.
The existing server-verified order creation requirement remains unchanged.
It only makes delivery-address collection, saving, selection and delivery-fee preview real.
