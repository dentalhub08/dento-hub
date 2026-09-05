-- DENTO HUB — real server-controlled checkout / order placement
-- Run once in Supabase SQL Editor AFTER the existing schema and delivery migrations.

create or replace function public.place_order_v1(
  p_address_id uuid,
  p_items jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_address public.addresses%rowtype;
  v_product public.products%rowtype;
  v_order_id uuid;
  v_order_number text;
  v_subtotal numeric(12,2) := 0;
  v_discount_total numeric(12,2) := 0;
  v_delivery_fee numeric(12,2);
  v_default_fee numeric(12,2);
  v_free_threshold numeric(12,2);
  v_grand_total numeric(12,2);
  v_rule_fee numeric(12,2);
  v_profile_ok boolean := false;
  r record;
begin
  if v_user is null then
    raise exception 'You must be signed in to place an order.';
  end if;

  select exists(
    select 1
    from public.profiles p
    where p.id = v_user
      and nullif(btrim(coalesce(p.full_name, '')), '') is not null
      and nullif(btrim(coalesce(p.phone, '')), '') is not null
      and p.university_id is not null
      and p.academic_year between 1 and 5
  )
  into v_profile_ok;

  if not v_profile_ok then
    raise exception 'Complete your profile before placing the order.';
  end if;

  select *
  into v_address
  from public.addresses
  where id = p_address_id
    and user_id = v_user;

  if not found then
    raise exception 'Choose a valid delivery address.';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' then
    raise exception 'Your cart is invalid.';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'Your cart is empty.';
  end if;

  -- Re-read every product and every price from the database.
  -- Browser/local-storage prices are never trusted.
  for r in
    select
      x.source_row_no,
      sum(x.quantity)::int as quantity
    from jsonb_to_recordset(p_items)
      as x(source_row_no int, quantity int)
    group by x.source_row_no
  loop
    if r.source_row_no is null
       or r.quantity is null
       or r.quantity < 1
       or r.quantity > 99 then
      raise exception 'A cart quantity is invalid.';
    end if;

    select *
    into v_product
    from public.products
    where source_row_no = r.source_row_no
      and status = 'active'
      and is_available = true
      and selling_price_egp is not null
    limit 1;

    if not found then
      raise exception 'A product in your cart is no longer available. Please refresh your cart.';
    end if;

    v_subtotal :=
      v_subtotal + (v_product.selling_price_egp * r.quantity);
  end loop;

  select
    s.default_delivery_fee_egp,
    s.free_delivery_threshold_egp
  into
    v_default_fee,
    v_free_threshold
  from public.store_settings s
  where s.id = 1;

  -- Priority: University -> City -> Governorate -> Default.
  v_rule_fee := null;

  if v_address.university_id is not null then
    select dr.fee_egp
    into v_rule_fee
    from public.delivery_rules dr
    where dr.is_active = true
      and dr.rule_type = 'university'
      and dr.university_id = v_address.university_id
    order by dr.priority desc, dr.created_at desc
    limit 1;
  end if;

  if v_rule_fee is null then
    select dr.fee_egp
    into v_rule_fee
    from public.delivery_rules dr
    where dr.is_active = true
      and dr.rule_type = 'city'
      and lower(btrim(coalesce(dr.city, ''))) =
          lower(btrim(coalesce(v_address.city, '')))
      and (
        dr.governorate is null
        or lower(btrim(dr.governorate)) =
           lower(btrim(coalesce(v_address.governorate, '')))
      )
    order by dr.priority desc, dr.created_at desc
    limit 1;
  end if;

  if v_rule_fee is null then
    select dr.fee_egp
    into v_rule_fee
    from public.delivery_rules dr
    where dr.is_active = true
      and dr.rule_type = 'governorate'
      and lower(btrim(coalesce(dr.governorate, ''))) =
          lower(btrim(coalesce(v_address.governorate, '')))
    order by dr.priority desc, dr.created_at desc
    limit 1;
  end if;

  if v_rule_fee is null then
    select dr.fee_egp
    into v_rule_fee
    from public.delivery_rules dr
    where dr.is_active = true
      and dr.rule_type = 'default'
    order by dr.priority desc, dr.created_at desc
    limit 1;
  end if;

  v_delivery_fee := coalesce(v_rule_fee, v_default_fee);

  if v_delivery_fee is null then
    raise exception 'Delivery is not configured for this address yet.';
  end if;

  if v_free_threshold is not null
     and v_subtotal >= v_free_threshold then
    v_delivery_fee := 0;
  end if;

  v_grand_total :=
    v_subtotal - v_discount_total + v_delivery_fee;

  v_order_number :=
    'DH-' ||
    to_char(clock_timestamp(), 'YYYYMMDD') ||
    '-' ||
    upper(substr(replace(gen_random_uuid()::text, '-', ''), 1, 8));

  insert into public.orders(
    order_number,
    user_id,
    status,
    payment_method,
    payment_status,
    subtotal,
    discount_total,
    delivery_fee,
    grand_total,
    currency,
    delivery_address_snapshot
  )
  values(
    v_order_number,
    v_user,
    'pending',
    'cash_on_delivery',
    'unpaid',
    v_subtotal,
    v_discount_total,
    v_delivery_fee,
    v_grand_total,
    'EGP',
    to_jsonb(v_address) - 'id' - 'user_id'
  )
  returning id into v_order_id;

  -- Snapshot item names and prices at purchase time.
  for r in
    select
      x.source_row_no,
      sum(x.quantity)::int as quantity
    from jsonb_to_recordset(p_items)
      as x(source_row_no int, quantity int)
    group by x.source_row_no
  loop
    select *
    into v_product
    from public.products
    where source_row_no = r.source_row_no
      and status = 'active'
      and is_available = true
      and selling_price_egp is not null
    limit 1;

    if not found then
      raise exception 'A product changed while checkout was being processed. Please try again.';
    end if;

    insert into public.order_items(
      order_id,
      product_id,
      variation_id,
      product_name_en,
      product_name_ar,
      variation_snapshot,
      sku_snapshot,
      unit_price,
      discount_amount,
      final_unit_price,
      quantity
    )
    values(
      v_order_id,
      v_product.id,
      null,
      coalesce(
        nullif(btrim(v_product.canonical_name_en), ''),
        v_product.source_name,
        'Product'
      ),
      nullif(btrim(v_product.canonical_name_ar), ''),
      null,
      null,
      v_product.selling_price_egp,
      0,
      v_product.selling_price_egp,
      r.quantity
    );
  end loop;

  insert into public.order_status_history(
    order_id,
    status,
    changed_by
  )
  values(
    v_order_id,
    'pending',
    v_user
  );

  insert into public.notifications(
    user_id,
    title,
    body,
    kind
  )
  values(
    v_user,
    'Order placed',
    'Your order ' || v_order_number || ' was placed successfully and is pending confirmation.',
    'order_created'
  );

  -- The project has one Admin. Notify that Admin too.
  insert into public.notifications(
    user_id,
    title,
    body,
    kind
  )
  select
    au.user_id,
    'New order',
    'New order ' || v_order_number || ' was placed.',
    'new_order'
  from public.admin_users au;

  -- Clear the authenticated database cart only after all order inserts succeed.
  delete from public.cart_items ci
  where ci.cart_id in (
    select c.id
    from public.carts c
    where c.user_id = v_user
  );

  update public.carts
  set updated_at = now()
  where user_id = v_user;

  return jsonb_build_object(
    'id', v_order_id,
    'order_number', v_order_number,
    'status', 'pending',
    'payment_method', 'cash_on_delivery',
    'subtotal', v_subtotal,
    'discount_total', v_discount_total,
    'delivery_fee', v_delivery_fee,
    'grand_total', v_grand_total,
    'currency', 'EGP'
  );
end;
$$;

revoke all on function public.place_order_v1(uuid, jsonb) from public;
revoke all on function public.place_order_v1(uuid, jsonb) from anon;
grant execute on function public.place_order_v1(uuid, jsonb) to authenticated;
