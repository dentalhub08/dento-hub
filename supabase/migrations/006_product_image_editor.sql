-- DENTO HUB — Product image editor + storefront override
-- Run once after 005_admin_media_bundles.sql.

alter table public.products
  add column if not exists suppress_default_image boolean not null default false;

alter table public.product_images enable row level security;

drop policy if exists "public product images" on public.product_images;
create policy "public product images"
on public.product_images for select
using (true);

drop policy if exists "admin product image writes" on public.product_images;
create policy "admin product image writes"
on public.product_images for all
using (public.is_admin())
with check (public.is_admin());

-- Ensure the same public-read / Admin-write media bucket is available.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dento-media',
  'dento-media',
  true,
  8388608,
  array['image/jpeg','image/png','image/webp','image/gif']::text[]
)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit,
    allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "dento media public read" on storage.objects;
create policy "dento media public read"
on storage.objects for select
using (bucket_id = 'dento-media');

drop policy if exists "dento media admin insert" on storage.objects;
create policy "dento media admin insert"
on storage.objects for insert
with check (bucket_id = 'dento-media' and public.is_admin());

drop policy if exists "dento media admin update" on storage.objects;
create policy "dento media admin update"
on storage.objects for update
using (bucket_id = 'dento-media' and public.is_admin())
with check (bucket_id = 'dento-media' and public.is_admin());

drop policy if exists "dento media admin delete" on storage.objects;
create policy "dento media admin delete"
on storage.objects for delete
using (bucket_id = 'dento-media' and public.is_admin());
