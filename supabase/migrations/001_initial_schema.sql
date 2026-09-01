create extension if not exists pgcrypto;

create type public.product_status as enum ('draft','active','archived');
create type public.order_status as enum ('pending','confirmed','preparing','shipped','out_for_delivery','delivered','cancelled','rejected');
create type public.cancel_request_status as enum ('pending','approved','rejected');

create table public.universities (
  id uuid primary key default gen_random_uuid(), name_en text not null unique, name_ar text, category text,
  governorate text, city text, is_active boolean not null default true, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade, full_name text, phone text,
  university_id uuid references public.universities(id), academic_year smallint check (academic_year between 1 and 5), preferred_language text default 'en' check (preferred_language in ('en','ar')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  singleton_key boolean not null default true unique check (singleton_key = true), created_at timestamptz not null default now()
);
create table public.categories (id uuid primary key default gen_random_uuid(), name_en text not null, name_ar text, slug text unique not null, is_active boolean default true, sort_order int default 0);
create table public.courses (id uuid primary key default gen_random_uuid(), name_en text not null, name_ar text, slug text unique not null, source_code text, is_active boolean default true);
create table public.products (
 id uuid primary key default gen_random_uuid(), source_row_no int, source_name text, canonical_name_en text, canonical_name_ar text,
 source_togary_price_raw text, selling_price_egp numeric(12,2), price_note text, slug text unique not null,
 brand text, description_en text, description_ar text, status public.product_status not null default 'draft', is_available boolean not null default true, is_featured boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 constraint active_products_have_price check (status <> 'active' or selling_price_egp is not null)
);
create table public.product_variations (
 id uuid primary key default gen_random_uuid(), product_id uuid not null references public.products(id) on delete cascade, sku text,
 name_en text, name_ar text, attributes jsonb not null default '{}', selling_price_egp numeric(12,2), is_available boolean not null default true, is_active boolean not null default true
);
create table public.product_categories(product_id uuid references public.products(id) on delete cascade, category_id uuid references public.categories(id) on delete cascade, primary key(product_id,category_id));
create table public.product_courses(product_id uuid references public.products(id) on delete cascade, course_id uuid references public.courses(id) on delete cascade, primary key(product_id,course_id));
create table public.product_academic_years(product_id uuid references public.products(id) on delete cascade, academic_year smallint check(academic_year between 1 and 5), primary key(product_id,academic_year));

create table public.course_supply_lists(
 id uuid primary key default gen_random_uuid(), university_id uuid not null references public.universities(id) on delete cascade, course_id uuid references public.courses(id) on delete set null, name text not null, source_code text, is_active boolean default true, created_at timestamptz default now()
);
create table public.course_supply_items(
 id uuid primary key default gen_random_uuid(), list_id uuid not null references public.course_supply_lists(id) on delete cascade, source_item_name text not null, requirement_level text not null default 'required' check(requirement_level in('required','optional','alternative','note')), alternative_group text, mapped_product_id uuid references public.products(id) on delete set null, sort_order int default 0
);

create table public.product_images(id uuid primary key default gen_random_uuid(), product_id uuid references public.products(id) on delete cascade, storage_path text not null, alt_en text, alt_ar text, is_primary boolean default false, sort_order int default 0);
create table public.addresses(id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, label text, recipient_name text not null, phone text not null, governorate text not null, city text not null, street text not null, building text, floor text, apartment text, landmark text, notes text, university_id uuid references public.universities(id), is_default boolean default false, created_at timestamptz default now());
create table public.wishlists(user_id uuid not null references auth.users(id) on delete cascade, product_id uuid not null references public.products(id) on delete cascade, created_at timestamptz default now(), primary key(user_id,product_id));
create table public.carts(id uuid primary key default gen_random_uuid(), user_id uuid unique not null references auth.users(id) on delete cascade, updated_at timestamptz default now());
create table public.cart_items(id uuid primary key default gen_random_uuid(), cart_id uuid not null references public.carts(id) on delete cascade, product_id uuid references public.products(id), variation_id uuid references public.product_variations(id), quantity int not null default 1 check(quantity>0), unique(cart_id,product_id,variation_id));
create table public.delivery_rules(id uuid primary key default gen_random_uuid(), rule_type text not null check(rule_type in('default','governorate','city','university')), governorate text, city text, university_id uuid references public.universities(id), fee_egp numeric(12,2) not null check(fee_egp>=0), priority int default 0, is_active boolean default true, created_at timestamptz default now(), updated_at timestamptz default now());
create table public.store_settings(id int primary key default 1 check(id=1), support_email text not null default 'dentalhub08@outlook.com', support_phone text, whatsapp_number text, default_delivery_fee_egp numeric(12,2), free_delivery_threshold_egp numeric(12,2), default_locale text default 'en');
create table public.orders(id uuid primary key default gen_random_uuid(), order_number text unique not null, user_id uuid not null references auth.users(id), status public.order_status not null default 'pending', payment_method text not null default 'cash_on_delivery', payment_status text not null default 'unpaid', subtotal numeric(12,2) not null, discount_total numeric(12,2) not null default 0, delivery_fee numeric(12,2) not null, grand_total numeric(12,2) not null, currency text not null default 'EGP', delivery_address_snapshot jsonb not null, created_at timestamptz not null default now(), confirmed_at timestamptz, delivered_at timestamptz, cancelled_at timestamptz);
create table public.order_items(id uuid primary key default gen_random_uuid(), order_id uuid not null references public.orders(id) on delete cascade, product_id uuid references public.products(id) on delete set null, variation_id uuid references public.product_variations(id) on delete set null, product_name_en text not null, product_name_ar text, variation_snapshot jsonb, sku_snapshot text, unit_price numeric(12,2) not null, discount_amount numeric(12,2) default 0, final_unit_price numeric(12,2) not null, quantity int not null check(quantity>0));
create table public.order_status_history(id uuid primary key default gen_random_uuid(), order_id uuid references public.orders(id) on delete cascade, status public.order_status not null, changed_by uuid references auth.users(id), created_at timestamptz default now());
create table public.cancellation_requests(id uuid primary key default gen_random_uuid(), order_id uuid unique references public.orders(id) on delete cascade, user_id uuid references auth.users(id), reason text, status public.cancel_request_status not null default 'pending', requested_at timestamptz default now(), reviewed_at timestamptz, reviewed_by uuid references auth.users(id), admin_note text);
create table public.notifications(id uuid primary key default gen_random_uuid(), user_id uuid references auth.users(id) on delete cascade, title text not null, body text not null, kind text, is_read boolean default false, created_at timestamptz default now());

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from public.admin_users where user_id=auth.uid()); $$;

alter table public.universities enable row level security; alter table public.course_supply_lists enable row level security; alter table public.course_supply_items enable row level security; alter table public.profiles enable row level security; alter table public.admin_users enable row level security; alter table public.products enable row level security; alter table public.product_variations enable row level security; alter table public.addresses enable row level security; alter table public.wishlists enable row level security; alter table public.carts enable row level security; alter table public.cart_items enable row level security; alter table public.delivery_rules enable row level security; alter table public.orders enable row level security; alter table public.order_items enable row level security; alter table public.cancellation_requests enable row level security; alter table public.notifications enable row level security;

create policy "public universities read" on public.universities for select using(is_active or public.is_admin());
create policy "public course lists" on public.course_supply_lists for select using(is_active or public.is_admin());
create policy "public course list items" on public.course_supply_items for select using(true);
create policy "admin course lists write" on public.course_supply_lists for all using(public.is_admin()) with check(public.is_admin());
create policy "admin course items write" on public.course_supply_items for all using(public.is_admin()) with check(public.is_admin());
create policy "profiles own read" on public.profiles for select using(id=auth.uid() or public.is_admin());
create policy "profiles own update" on public.profiles for update using(id=auth.uid()) with check(id=auth.uid());
create policy "admins read admin table" on public.admin_users for select using(public.is_admin());
create policy "public active products" on public.products for select using((status='active' and selling_price_egp is not null) or public.is_admin());
create policy "public variations" on public.product_variations for select using(is_active or public.is_admin());
create policy "admin product writes" on public.products for all using(public.is_admin()) with check(public.is_admin());
create policy "admin variation writes" on public.product_variations for all using(public.is_admin()) with check(public.is_admin());
create policy "addresses own" on public.addresses for all using(user_id=auth.uid() or public.is_admin()) with check(user_id=auth.uid() or public.is_admin());
create policy "wishlist own" on public.wishlists for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "cart own" on public.carts for all using(user_id=auth.uid()) with check(user_id=auth.uid());
create policy "cart items own" on public.cart_items for all using(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid())) with check(exists(select 1 from public.carts c where c.id=cart_id and c.user_id=auth.uid()));
create policy "delivery public read" on public.delivery_rules for select using(is_active or public.is_admin());
create policy "delivery admin write" on public.delivery_rules for all using(public.is_admin()) with check(public.is_admin());
create policy "orders own read" on public.orders for select using(user_id=auth.uid() or public.is_admin());
create policy "order items own read" on public.order_items for select using(exists(select 1 from public.orders o where o.id=order_id and (o.user_id=auth.uid() or public.is_admin())));
create policy "cancel own read" on public.cancellation_requests for select using(user_id=auth.uid() or public.is_admin());
create policy "notifications own" on public.notifications for select using(user_id=auth.uid() or public.is_admin());

-- Do not expose direct client INSERT policies for orders. Create orders through a trusted server/RPC path that re-reads prices and delivery fees.

-- Create the student profile from trusted Auth metadata after registration.
-- This keeps signup complete even when email confirmation means there is no client session yet.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, phone, university_id, academic_year)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name',''),
    nullif(new.raw_user_meta_data->>'phone',''),
    case
      when coalesce(new.raw_user_meta_data->>'university_id','') ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
      then (new.raw_user_meta_data->>'university_id')::uuid
      else null
    end,
    case
      when coalesce(new.raw_user_meta_data->>'academic_year','') ~ '^[1-5]$'
      then (new.raw_user_meta_data->>'academic_year')::smallint
      else null
    end
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    phone = excluded.phone,
    university_id = excluded.university_id,
    academic_year = excluded.academic_year,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_auth_user();

-- Allows authenticated users created before the profile trigger existed to complete their own profile safely.
drop policy if exists "profiles own insert" on public.profiles;
create policy "profiles own insert" on public.profiles for insert with check(id=auth.uid());

-- Admin-managed storefront advertising. Ads can be moved between sections and optionally targeted to a course.
create table if not exists public.homepage_banners(
  id uuid primary key default gen_random_uuid(),
  title_en text not null,
  title_ar text,
  subtitle_en text,
  subtitle_ar text,
  cta_en text not null default 'Shop now',
  cta_ar text,
  destination_path text not null default '/shop',
  placement text not null check(placement in ('home_top','featured','course_section','student_kits','shop_top')),
  course_id uuid references public.courses(id) on delete set null,
  image_storage_path text,
  is_active boolean not null default true,
  sort_order int not null default 0,
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.homepage_banners enable row level security;
alter table public.product_images enable row level security;

create policy "public active banners" on public.homepage_banners for select
using(is_active or public.is_admin());
create policy "admin banner writes" on public.homepage_banners for all
using(public.is_admin()) with check(public.is_admin());
create policy "public product images" on public.product_images for select using(true);
create policy "admin product image writes" on public.product_images for all
using(public.is_admin()) with check(public.is_admin());
