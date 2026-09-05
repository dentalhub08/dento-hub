-- DENTO HUB — Admin media + bundles upgrade
-- Run after the existing DENTO HUB migrations.
-- Safe/idempotent where practical.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Homepage banners: keep existing rows, add the fields needed by the editor.
-- ---------------------------------------------------------------------------
create table if not exists public.homepage_banners (
  id uuid primary key default gen_random_uuid(),
  title_en text not null default '',
  title_ar text,
  subtitle_en text,
  subtitle_ar text,
  cta_en text not null default 'Shop now',
  cta_ar text,
  destination_path text not null default '/shop',
  placement text not null default 'home_top',
  course_id uuid references public.courses(id) on delete set null,
  image_storage_path text,
  start_at timestamptz,
  end_at timestamptz,
  is_active boolean not null default true,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_banners add column if not exists title_ar text;
alter table public.homepage_banners add column if not exists subtitle_ar text;
alter table public.homepage_banners add column if not exists cta_ar text;
alter table public.homepage_banners add column if not exists start_at timestamptz;
alter table public.homepage_banners add column if not exists end_at timestamptz;
alter table public.homepage_banners add column if not exists image_storage_path text;
alter table public.homepage_banners add column if not exists updated_at timestamptz not null default now();

alter table public.homepage_banners enable row level security;

drop policy if exists "dento banners public read" on public.homepage_banners;
create policy "dento banners public read"
on public.homepage_banners for select
using (is_active or public.is_admin());

drop policy if exists "dento banners admin write" on public.homepage_banners;
create policy "dento banners admin write"
on public.homepage_banners for all
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_dento_banners_placement
on public.homepage_banners(placement, sort_order);

-- ---------------------------------------------------------------------------
-- Bundles / student kits.
-- ---------------------------------------------------------------------------
create table if not exists public.bundles (
  id uuid primary key default gen_random_uuid(),
  name_en text not null,
  name_ar text,
  slug text not null unique,
  description_en text,
  description_ar text,
  price_egp numeric(12,2) not null check (price_egp >= 0),
  image_storage_path text,
  is_available boolean not null default true,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.bundles add column if not exists name_ar text;
alter table public.bundles add column if not exists description_en text;
alter table public.bundles add column if not exists description_ar text;
alter table public.bundles add column if not exists image_storage_path text;
alter table public.bundles add column if not exists is_available boolean not null default true;
alter table public.bundles add column if not exists is_active boolean not null default true;
alter table public.bundles add column if not exists is_featured boolean not null default false;
alter table public.bundles add column if not exists updated_at timestamptz not null default now();

create table if not exists public.bundle_items (
  id uuid primary key default gen_random_uuid(),
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete restrict,
  variation_id uuid references public.product_variations(id) on delete restrict,
  quantity integer not null default 1 check (quantity > 0),
  sort_order integer not null default 0
);

create table if not exists public.bundle_courses (
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  course_id uuid not null references public.courses(id) on delete cascade,
  primary key(bundle_id, course_id)
);

create table if not exists public.bundle_academic_years (
  bundle_id uuid not null references public.bundles(id) on delete cascade,
  academic_year smallint not null check (academic_year between 1 and 5),
  primary key(bundle_id, academic_year)
);

alter table public.bundles enable row level security;
alter table public.bundle_items enable row level security;
alter table public.bundle_courses enable row level security;
alter table public.bundle_academic_years enable row level security;

drop policy if exists "dento bundles public read" on public.bundles;
create policy "dento bundles public read"
on public.bundles for select
using ((is_active and is_available) or public.is_admin());

drop policy if exists "dento bundles admin write" on public.bundles;
create policy "dento bundles admin write"
on public.bundles for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "dento bundle items public read" on public.bundle_items;
create policy "dento bundle items public read"
on public.bundle_items for select
using (
  public.is_admin()
  or exists (
    select 1 from public.bundles b
    where b.id = bundle_id and b.is_active and b.is_available
  )
);

drop policy if exists "dento bundle items admin write" on public.bundle_items;
create policy "dento bundle items admin write"
on public.bundle_items for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "dento bundle courses public read" on public.bundle_courses;
create policy "dento bundle courses public read"
on public.bundle_courses for select
using (
  public.is_admin()
  or exists (
    select 1 from public.bundles b
    where b.id = bundle_id and b.is_active and b.is_available
  )
);

drop policy if exists "dento bundle courses admin write" on public.bundle_courses;
create policy "dento bundle courses admin write"
on public.bundle_courses for all
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "dento bundle years public read" on public.bundle_academic_years;
create policy "dento bundle years public read"
on public.bundle_academic_years for select
using (
  public.is_admin()
  or exists (
    select 1 from public.bundles b
    where b.id = bundle_id and b.is_active and b.is_available
  )
);

drop policy if exists "dento bundle years admin write" on public.bundle_academic_years;
create policy "dento bundle years admin write"
on public.bundle_academic_years for all
using (public.is_admin())
with check (public.is_admin());

create index if not exists idx_bundle_items_bundle on public.bundle_items(bundle_id);
create index if not exists idx_bundle_items_product on public.bundle_items(product_id);

-- ---------------------------------------------------------------------------
-- Public image bucket. Upload/delete remains Admin-only through RLS.
-- The URL is public because these images are storefront media.
-- ---------------------------------------------------------------------------
insert into storage.buckets (
  id, name, public, file_size_limit, allowed_mime_types
)
values (
  'dento-media',
  'dento-media',
  true,
  8388608,
  array['image/jpeg','image/png','image/webp','image/gif']::text[]
)
on conflict (id) do update
set
  public = excluded.public,
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
