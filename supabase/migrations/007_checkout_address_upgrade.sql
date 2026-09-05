-- DENTO HUB — checkout address upgrade
-- Adds Shopify-style address metadata without breaking existing addresses.

alter table public.addresses
  add column if not exists country text not null default 'Egypt';

alter table public.addresses
  add column if not exists postal_code text;

alter table public.addresses
  add column if not exists updated_at timestamptz not null default now();

update public.addresses
set country = 'Egypt'
where country is null or btrim(country) = '';

create index if not exists idx_addresses_user_default
on public.addresses(user_id, is_default, created_at desc);
