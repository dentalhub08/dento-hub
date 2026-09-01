-- DENTO HUB registration hardening: backend duplicate checks + normalized unique phone numbers.
-- Run after 001_initial_schema.sql and 002_live_accounts_admin_controls.sql.

create or replace function public.normalize_egypt_phone(p_phone text)
returns text
language sql
immutable
as $$
  with cleaned as (
    select regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g') as digits
  )
  select case
    when digits ~ '^00201[0125][0-9]{8}$' then '0' || substring(digits from 5)
    when digits ~ '^201[0125][0-9]{8}$' then '0' || substring(digits from 3)
    when digits ~ '^01[0125][0-9]{8}$' then digits
    else digits
  end
  from cleaned;
$$;

-- Normalize existing profile phones without deleting or merging any account data.
update public.profiles
set phone = public.normalize_egypt_phone(phone),
    updated_at = now()
where phone is not null
  and phone <> public.normalize_egypt_phone(phone);

-- Keep phones normalized and block duplicates in the database.
-- The per-phone advisory lock also prevents two simultaneous signups from racing
-- past the duplicate check. Existing duplicate test data is left untouched; new
-- writes cannot create another duplicate.
create or replace function public.normalize_and_guard_profile_phone()
returns trigger
language plpgsql
set search_path = public
as $$
declare
  normalized text;
begin
  if new.phone is null then
    return new;
  end if;

  normalized := nullif(public.normalize_egypt_phone(new.phone), '');
  new.phone := normalized;
  if normalized is null then
    return new;
  end if;

  perform pg_advisory_xact_lock(hashtextextended(normalized, 0));
  if exists (
    select 1
    from public.profiles p
    where p.id <> new.id
      and public.normalize_egypt_phone(p.phone) = normalized
  ) then
    raise exception 'PHONE_ALREADY_REGISTERED' using errcode = '23505';
  end if;

  return new;
end;
$$;

drop trigger if exists normalize_profile_phone_before_write on public.profiles;
create trigger normalize_profile_phone_before_write
before insert or update of phone on public.profiles
for each row execute function public.normalize_and_guard_profile_phone();

-- Make the Auth-user trigger use the same normalized phone value.
create or replace function public.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles(id, full_name, phone, university_id, academic_year)
  values (
    new.id,
    nullif(new.raw_user_meta_data->>'full_name',''),
    nullif(public.normalize_egypt_phone(new.raw_user_meta_data->>'phone'), ''),
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

-- Registration preflight. This is intentionally narrow: it reveals only whether
-- the submitted email and phone are already registered, never user/profile data.
create or replace function public.check_registration_uniqueness(p_email text, p_phone text)
returns table(email_exists boolean, phone_exists boolean)
language sql
security definer
set search_path = public, auth
as $$
  select
    exists(
      select 1
      from auth.users u
      where lower(trim(coalesce(u.email, ''))) = lower(trim(coalesce(p_email, '')))
    ) as email_exists,
    exists(
      select 1
      from public.profiles p
      where public.normalize_egypt_phone(p.phone) = public.normalize_egypt_phone(p_phone)
        and public.normalize_egypt_phone(p_phone) <> ''
    ) as phone_exists;
$$;

revoke all on function public.check_registration_uniqueness(text, text) from public;
grant execute on function public.check_registration_uniqueness(text, text) to anon, authenticated;
