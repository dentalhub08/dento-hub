-- DENTO HUB: Admin order management permissions.
-- Run after 002_live_accounts_admin_controls.sql.

-- Customers keep read-only access to their own orders. Only the single Admin may update order status/fulfillment fields.
drop policy if exists "admin orders update" on public.orders;
create policy "admin orders update" on public.orders
for update using (public.is_admin()) with check (public.is_admin());

-- Admin can review and resolve cancellation requests from the same operations area later.
drop policy if exists "admin cancellation update" on public.cancellation_requests;
create policy "admin cancellation update" on public.cancellation_requests
for update using (public.is_admin()) with check (public.is_admin());

create index if not exists idx_orders_created_at_desc on public.orders(created_at desc);
create index if not exists idx_orders_status_created_at on public.orders(status, created_at desc);
