DENTO HUB — ADMIN ORDERS MOBILE V3

Fixes the damaged Admin > Orders mobile view shown in the screenshot.

WHAT CHANGES
- Removes the squeezed desktop order table.
- Uses responsive order cards instead.
- Works on desktop and mobile.
- Mobile has no horizontal order-table overflow.
- Tap any order to open full order details.
- On mobile, order details open full-screen.

ADMIN CAN NOW SEE
- order number and date
- current fulfillment status
- customer name
- customer phone
- full delivery address
- governorate
- city/area
- street
- building
- floor
- apartment
- landmark
- delivery notes
- Open in Google Maps
- every product in the order
- quantity of every product
- product price
- subtotal
- delivery fee
- final total
- payment status
- complete status history

ADMIN CAN UPDATE
Pending
→ Confirmed
→ Packaging
→ Shipped
→ Out for delivery
→ Delivered

Cancel and Reject are also available.

STEP 1 — SUPABASE
Open Supabase > SQL Editor and run:

supabase/migrations/011_admin_orders_mobile_details.sql

STEP 2 — APPLY
From inside dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_ADMIN_ORDERS_MOBILE_V3.zip" -DestinationPath "." -Force

node .\apply-admin-orders-v3.mjs

STEP 3 — BUILD

npm run build:cloudflare

STEP 4 — PUSH

git add .
git commit -m "Fix admin orders mobile and add order details"
git push origin main

TEST AFTER DEPLOY
1. Open /admin/orders on mobile.
2. Orders should appear as clean cards.
3. Tap the order.
4. Confirm the drawer shows customer, delivery location and products.
5. Change Pending -> Confirmed -> Packaging.
6. Open the customer My Orders page and refresh; the customer status should match.
