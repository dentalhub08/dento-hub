-- DENTO HUB — Admin order detail/mobile management permissions
-- Safe to run more than once.
-- Keeps customer ownership rules intact while guaranteeing the single Admin can
-- read/update orders, inspect items and write status history.

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;
alter table public.profiles enable row level security;

drop policy if exists "dento admin orders manage" on public.orders;
create policy "dento admin orders manage"
on public.orders
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "dento admin order items read" on public.order_items;
create policy "dento admin order items read"
on public.order_items
for select
using (public.is_admin());

drop policy if exists "dento admin order history manage" on public.order_status_history;
create policy "dento admin order history manage"
on public.order_status_history
for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "dento admin profiles read" on public.profiles;
create policy "dento admin profiles read"
on public.profiles
for select
using (public.is_admin());
