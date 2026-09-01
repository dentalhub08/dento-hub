-- DENTO HUB live account persistence + admin-managed storefront controls.
-- Safe to run after 001_initial_schema.sql and the existing seed files.


-- Lock down relational catalog tables that are read publicly but edited only by Admin.
alter table public.categories enable row level security;
alter table public.courses enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_courses enable row level security;
alter table public.product_academic_years enable row level security;
alter table public.order_status_history enable row level security;

drop policy if exists "admin universities write" on public.universities;
create policy "admin universities write" on public.universities for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public categories read" on public.categories;
create policy "public categories read" on public.categories for select using (is_active or public.is_admin());
drop policy if exists "admin categories write" on public.categories;
create policy "admin categories write" on public.categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public courses read" on public.courses;
create policy "public courses read" on public.courses for select using (is_active or public.is_admin());
drop policy if exists "admin courses write" on public.courses;
create policy "admin courses write" on public.courses for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public product categories read" on public.product_categories;
create policy "public product categories read" on public.product_categories for select using (true);
drop policy if exists "admin product categories write" on public.product_categories;
create policy "admin product categories write" on public.product_categories for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public product courses read" on public.product_courses;
create policy "public product courses read" on public.product_courses for select using (true);
drop policy if exists "admin product courses write" on public.product_courses;
create policy "admin product courses write" on public.product_courses for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "public product years read" on public.product_academic_years;
create policy "public product years read" on public.product_academic_years for select using (true);
drop policy if exists "admin product years write" on public.product_academic_years;
create policy "admin product years write" on public.product_academic_years for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists "order status history own read" on public.order_status_history;
create policy "order status history own read" on public.order_status_history for select using (
  exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin()))
);
drop policy if exists "admin order status history write" on public.order_status_history;
create policy "admin order status history write" on public.order_status_history for all using (public.is_admin()) with check (public.is_admin());

-- Store settings are public-readable for checkout/display, but writable only by the single admin.
alter table public.store_settings enable row level security;

drop policy if exists "public store settings read" on public.store_settings;
create policy "public store settings read" on public.store_settings
for select using (true);

drop policy if exists "admin store settings write" on public.store_settings;
create policy "admin store settings write" on public.store_settings
for all using (public.is_admin()) with check (public.is_admin());

insert into public.store_settings(id, support_email, default_delivery_fee_egp, free_delivery_threshold_egp, default_locale)
values (1, 'dentalhub08@outlook.com', null, null, 'en')
on conflict (id) do nothing;

-- Public shoppers must never receive products that are unavailable, unpriced, or not active.
drop policy if exists "public active products" on public.products;
create policy "public active products" on public.products for select
using ((status='active' and selling_price_egp is not null and is_available=true) or public.is_admin());

-- Helpful indexes for account/cart sync and admin controls.
create index if not exists idx_products_source_row_no on public.products(source_row_no);
create index if not exists idx_cart_items_cart_id on public.cart_items(cart_id);
create index if not exists idx_wishlists_user_id on public.wishlists(user_id);
create index if not exists idx_delivery_rules_priority on public.delivery_rules(priority desc);
create index if not exists idx_homepage_banners_placement on public.homepage_banners(placement, sort_order);

-- Seed the two approved demo storefront ads into Supabase only if the banner table is still empty.
insert into public.homepage_banners(
  title_en, subtitle_en, cta_en, destination_path, placement, course_id,
  image_storage_path, is_active, sort_order
)
select
  'Operative essentials, in one place.',
  'Build your rubber dam and composite setup from the AIU supply reference.',
  'Shop Operative',
  '/shop?course=operative',
  'course_section',
  (select id from public.courses where slug='operative-dentistry' limit 1),
  '/supply-images/rubber-dam-sheets.jpg',
  true,
  10
where not exists (select 1 from public.homepage_banners);

insert into public.homepage_banners(
  title_en, subtitle_en, cta_en, destination_path, placement, course_id,
  image_storage_path, is_active, sort_order
)
select
  'Endodontics setup made simpler.',
  'Files, irrigation and obturation supplies from the uploaded AIU list.',
  'Shop Endodontics',
  '/shop?course=endo',
  'shop_top',
  (select id from public.courses where slug='endodontics' limit 1),
  '/supply-images/k-files-15-40.jpg',
  true,
  20
where not exists (
  select 1 from public.homepage_banners where title_en='Endodontics setup made simpler.'
);
