DENTO HUB — REAL PLACE ORDER FIX

WHY THE BUTTON WAS DISABLED
The previous address-book checkout intentionally left the final button disabled:
"Address selected — ready for order review".
There was no safe server-side order mutation attached yet.

THIS FIX ADDS THE REAL ORDER FLOW
- Place Order button becomes active after selecting an address
- Cash on Delivery
- authenticated customers only
- complete profile check
- address ownership validation
- cart product validation
- product availability validation
- prices re-read from Supabase
- delivery fee re-read from delivery_rules
- Alexandria / AIU rules therefore use the current database value (75 EGP)
- free-delivery threshold respected
- order created as pending
- immutable order item price/name snapshots
- customer notification
- Admin notification
- database cart cleared transactionally
- customer sees order confirmation + order number

STEP 1 — SUPABASE SQL
Open Supabase > SQL Editor and run:

supabase/migrations/009_place_order_rpc.sql

STEP 2 — CODE
From INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_REAL_PLACE_ORDER_FIX.zip" -DestinationPath "." -Force

node .\apply-place-order-fix.mjs

STEP 3 — BUILD

npm run build:cloudflare

STEP 4 — PUSH

git add .
git commit -m "Enable secure order placement"
git push origin main

AFTER DEPLOY
Add products -> Checkout -> choose address.
The button should read:
Place order — Cash on delivery

Clicking it should:
1. create a pending order
2. show the DENTO HUB order number
3. clear the cart
4. make the order visible in Admin > Orders
5. make it visible to the customer in Account > Orders

SECURITY
Do NOT replace this with direct browser inserts into public.orders.
The RPC is SECURITY DEFINER and calculates prices/delivery from the database.
