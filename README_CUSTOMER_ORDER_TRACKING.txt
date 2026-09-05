DENTO HUB — CUSTOMER ORDER TRACKING

This fixes the 404 shown after clicking "View my orders".

WHAT IT ADDS
- /account/orders
- /account/orders/[id]
- live order status from Supabase
- status labels:
  Pending
  Confirmed
  Packaging
  Shipped
  Out for delivery
  Delivered
  Cancelled / Rejected
- visual order journey
- order items
- quantities and prices
- delivery address
- Cash on Delivery details
- subtotal, delivery, total
- status history
- mobile-friendly layout
- manual Refresh status button
- account Orders shortcut when the existing markup matches

IMPORTANT
The customer only reads their own orders.
The customer CANNOT change order status.
Admin remains responsible for changing the order status.

STEP 1 — SUPABASE
Supabase > SQL Editor > New query

Run:
supabase/migrations/010_customer_order_tracking.sql

STEP 2 — APPLY THE FILES
Run from INSIDE dento-hub-app:

Expand-Archive "$env:USERPROFILE\Downloads\DENTO_HUB_CUSTOMER_ORDER_TRACKING.zip" -DestinationPath "." -Force

node .\apply-customer-order-tracking.mjs

STEP 3 — BUILD

npm run build:cloudflare

STEP 4 — PUSH

git add .
git commit -m "Add customer order tracking"
git push origin main

TEST
1. Place an order.
2. Open /account/orders
3. Open the order.
4. In Admin > Orders, change the status.
5. Return to the customer order page and press Refresh.
6. The new status should appear.

Friendly status mapping:
pending          -> Pending / Order received
confirmed        -> Confirmed
preparing        -> Packaging
shipped          -> Shipped
out_for_delivery -> Out for delivery
delivered        -> Delivered
cancelled        -> Cancelled
rejected         -> Rejected
