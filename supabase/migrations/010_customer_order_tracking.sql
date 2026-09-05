-- DENTO HUB — customer order tracking permissions
-- Safe to run multiple times.
-- This does not let customers modify order status; it only lets them read their own data.

alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "orders own read" on public.orders;
create policy "orders own read"
on public.orders
for select
using (user_id = auth.uid() or public.is_admin());

drop policy if exists "order items own read" on public.order_items;
create policy "order items own read"
on public.order_items
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);

drop policy if exists "order status history own read" on public.order_status_history;
create policy "order status history own read"
on public.order_status_history
for select
using (
  exists (
    select 1
    from public.orders o
    where o.id = order_id
      and (o.user_id = auth.uid() or public.is_admin())
  )
);
