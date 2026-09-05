-- DENTO HUB — Final delivery pricing
-- Alexandria Governorate: 75 EGP everywhere
-- Alamein International University: 75 EGP
-- Idempotent: safe to run again.

do $$
declare
  aiu_id uuid;
begin
  select id
  into aiu_id
  from public.universities
  where lower(trim(name_en)) = lower('Alamein International University')
  limit 1;

  -- Alexandria governorate rule: update any existing matching rule.
  update public.delivery_rules
  set
    fee_egp = 75,
    is_active = true,
    updated_at = now()
  where rule_type = 'governorate'
    and lower(trim(coalesce(governorate, ''))) = 'alexandria';

  -- Any Alexandria city/area override must also be 75 so it cannot beat
  -- the governorate rule with another price.
  update public.delivery_rules
  set
    fee_egp = 75,
    is_active = true,
    updated_at = now()
  where rule_type = 'city'
    and lower(trim(coalesce(governorate, ''))) = 'alexandria';

  -- Create the Alexandria governorate rule if one does not exist.
  if not exists (
    select 1
    from public.delivery_rules
    where rule_type = 'governorate'
      and lower(trim(coalesce(governorate, ''))) = 'alexandria'
  ) then
    insert into public.delivery_rules (
      rule_type,
      governorate,
      city,
      university_id,
      fee_egp,
      priority,
      is_active,
      created_at,
      updated_at
    )
    values (
      'governorate',
      'Alexandria',
      null,
      null,
      75,
      100,
      true,
      now(),
      now()
    );
  end if;

  -- Update/create Alamein International University override.
  if aiu_id is not null then
    update public.delivery_rules
    set
      fee_egp = 75,
      is_active = true,
      updated_at = now()
    where rule_type = 'university'
      and university_id = aiu_id;

    if not exists (
      select 1
      from public.delivery_rules
      where rule_type = 'university'
        and university_id = aiu_id
    ) then
      insert into public.delivery_rules (
        rule_type,
        governorate,
        city,
        university_id,
        fee_egp,
        priority,
        is_active,
        created_at,
        updated_at
      )
      values (
        'university',
        null,
        null,
        aiu_id,
        75,
        1000,
        true,
        now(),
        now()
      );
    end if;
  else
    raise warning 'Alamein International University was not found in public.universities.';
  end if;
end $$;
