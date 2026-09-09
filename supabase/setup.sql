-- VELLOURA Supabase setup
-- Run this file in YOUR Supabase project's SQL Editor (in the client's own account).
-- This creates the tables, public read/insert policies and placeholder products.
--
-- Customer login (email + Google):
-- 1. Authentication → Providers → Email: on. You can turn off "Confirm email" so shoppers can log in at once.
-- 2. Authentication → Providers → Google: on. Paste a Google Cloud OAuth Client ID and Secret.
-- 3. In Google Cloud, authorized redirect URI:
--    https://tslvalxmctnjimrbbvsd.supabase.co/auth/v1/callback
-- 4. Authentication → URL Configuration:
--    Site URL = https://vellouragh.com
--    Redirect URLs = https://vellouragh.com/**  and your preview origin /**

-- ---------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------

create table if not exists public.products (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  dept text not null check (dept in ('fashion','jewelry','hair','wigs')),
  collection text,
  name text not null,
  description text,
  price_ghs numeric not null check (price_ghs >= 0),
  sizes text[] default '{}',
  colors text[] default '{}',
  badge text,
  in_stock boolean not null default true,
  sort_order int default 0,
  image text,
  images text[] not null default '{}',
  compare_at_ghs numeric,
  flash_sale boolean not null default false
);

-- Allow 'wigs' on projects created from an older version.
alter table public.products drop constraint if exists products_dept_check;
alter table public.products add constraint products_dept_check
  check (dept in ('fashion','jewelry','hair','wigs'));

-- Optional: lets the owner add a real photo URL or local image path later
-- without touching the rest of the table.
alter table public.products add column if not exists image text;

create table if not exists public.orders (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  order_code text not null unique,
  customer_name text not null,
  phone text not null,
  area text not null,
  neighborhood text,
  notes text,
  items jsonb not null,
  items_total numeric not null,
  delivery_fee numeric not null default 0,
  total_ghs numeric not null,
  status text not null default 'new'
);

alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists payment text;

create table if not exists public.bookings (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  booking_code text not null unique,
  service text not null,
  day text not null,
  time_slot text not null,
  customer_name text not null,
  phone text not null,
  status text not null default 'new'
);

-- ---------------------------------------------------------------
-- Row Level Security
-- Visitors can READ products and INSERT orders/bookings. Nothing else.
-- The client reads orders and bookings in the Supabase Table Editor
-- under her own login. There is NO public select policy on those tables.
-- ---------------------------------------------------------------

alter table public.products enable row level security;
drop policy if exists "public can read products" on public.products;
create policy "public can read products" on public.products
  for select to anon using (true);

alter table public.orders enable row level security;
drop policy if exists "public can place orders" on public.orders;
create policy "public can place orders" on public.orders
  for insert to anon with check (
    char_length(customer_name) between 2 and 120 and
    char_length(phone) between 7 and 40
  );

create or replace function public.track_order(p_code text, p_phone text)
returns setof public.orders
language sql
security definer
set search_path = public
as $$
  select *
  from public.orders
  where upper(order_code) = upper(trim(p_code))
    and regexp_replace(coalesce(phone, ''), '[^0-9]', '', 'g')
      = regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')
  limit 1;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

alter table public.bookings enable row level security;
drop policy if exists "public can book hair" on public.bookings;
create policy "public can book hair" on public.bookings
  for insert to anon with check (
    char_length(customer_name) between 2 and 120 and
    char_length(phone) between 7 and 40
  );

-- ---------------------------------------------------------------
-- No placeholder stock ships any more. On projects that seeded the
-- old placeholder rows, remove them: real listings carry an empty
-- image (photo not uploaded yet) or a Supabase Storage URL, never a
-- repo path.
-- ---------------------------------------------------------------

delete from public.products where image like 'assets/products/%';

-- ---------------------------------------------------------------
-- Listing photos + Seller Center product editing
-- Added for the photo manager. Everything below is SAFE TO RUN
-- AGAIN on an existing project — it only adds what is missing.
-- ---------------------------------------------------------------

-- 1) Columns the photo manager and sale prices need.
alter table public.products add column if not exists images text[] not null default '{}';
alter table public.products add column if not exists compare_at_ghs numeric;
alter table public.products add column if not exists flash_sale boolean not null default false;

-- Seed the gallery from the old single-image column where needed.
update public.products
   set images = array[image]
 where coalesce(array_length(images, 1), 0) = 0
   and image is not null
   and image <> '';

-- 2) Public Storage bucket for uploaded listing photos.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

-- Read is public (the shop shows these photos).
drop policy if exists "product images are public" on storage.objects;
create policy "product images are public" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

-- Write is open to anyone holding the publishable key, restricted to
-- image files under products/. This is the same front-door trust level
-- as the Seller Center password. When real admin logins exist, tighten
-- these three policies to that role.
-- Note: newer Supabase projects have no storage.objects.content_type
-- column (mimetype lives in metadata), so we validate the extension.
drop policy if exists "seller can upload product images" on storage.objects;
create policy "seller can upload product images" on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'product-images'
    and name like 'products/%'
    and name ~* '\.(jpe?g|png|webp|avif|gif)$'
  );

drop policy if exists "seller can replace product images" on storage.objects;
create policy "seller can replace product images" on storage.objects
  for update to anon, authenticated
  using (bucket_id = 'product-images' and name like 'products/%')
  with check (bucket_id = 'product-images' and name like 'products/%');

drop policy if exists "seller can delete product images" on storage.objects;
create policy "seller can delete product images" on storage.objects
  for delete to anon, authenticated
  using (bucket_id = 'product-images' and name like 'products/%');

-- 3) Gated product writes. The Seller Center password only guards a page,
-- so product changes go through functions that check a shared seller key.
-- The key lives in this private table AND in js/config.js (sellerKey).
-- CHANGE BOTH TOGETHER BEFORE LAUNCH. To rotate:
--   update public.seller_auth set seller_key = 'a-long-new-secret';
-- then paste the same value into js/config.js.
create table if not exists public.seller_auth (
  id int primary key default 1 check (id = 1),
  seller_key text not null
);

insert into public.seller_auth (id, seller_key)
values (1, 'velloura-seller-2026-change-me')
on conflict (id) do nothing;

revoke all on public.seller_auth from public, anon, authenticated;

-- Helper: safely read a text[] out of the JSON payload.
create or replace function public.seller_text_array(p jsonb, k text)
returns text[]
language sql
immutable
set search_path = public
as $$
  select case
    when jsonb_typeof(coalesce(p -> k, 'null'::jsonb)) = 'array'
      then coalesce(
        (select array_agg(elem)
           from jsonb_array_elements_text(p -> k) as elem
          where elem is not null and elem <> ''),
        '{}'::text[])
    else '{}'::text[]
  end;
$$;

revoke all on function public.seller_text_array(jsonb, text) from public;

-- Save (insert or update) one product. Returns the saved row as JSON so
-- the browser learns the real id of a newly inserted product.
create or replace function public.seller_upsert_product(p_key text, p_product jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_id bigint := null;
  v_row public.products;
begin
  if not exists (select 1 from public.seller_auth where seller_key = p_key) then
    raise exception 'Invalid seller key.' using errcode = '42501';
  end if;

  if jsonb_typeof(coalesce(p_product -> 'id', 'null'::jsonb)) <> 'null' then
    begin
      v_id := (p_product ->> 'id')::bigint;
    exception when others then
      v_id := null; -- browser-only ids like 'p-1712345' are not table rows
    end;
  end if;

  if v_id is not null and exists (select 1 from public.products where id = v_id) then
    update public.products set
      dept           = coalesce(nullif(p_product ->> 'dept', ''), dept),
      collection     = nullif(p_product ->> 'collection', ''),
      name           = coalesce(nullif(p_product ->> 'name', ''), name),
      description    = p_product ->> 'description',
      price_ghs      = coalesce(nullif(p_product ->> 'price_ghs', '')::numeric, price_ghs),
      compare_at_ghs = nullif(p_product ->> 'compare_at_ghs', '')::numeric,
      flash_sale     = coalesce((p_product ->> 'flash_sale')::boolean, false),
      sizes          = public.seller_text_array(p_product, 'sizes'),
      colors         = public.seller_text_array(p_product, 'colors'),
      badge          = nullif(p_product ->> 'badge', ''),
      in_stock       = coalesce((p_product ->> 'in_stock')::boolean, true),
      sort_order     = coalesce(nullif(p_product ->> 'sort_order', '')::int, sort_order),
      image          = nullif(p_product ->> 'image', ''),
      images         = public.seller_text_array(p_product, 'images')
    where id = v_id
    returning * into v_row;
  else
    insert into public.products
      (dept, collection, name, description, price_ghs, compare_at_ghs, flash_sale,
       sizes, colors, badge, in_stock, sort_order, image, images)
    values
      (coalesce(nullif(p_product ->> 'dept', ''), 'fashion'),
       nullif(p_product ->> 'collection', ''),
       coalesce(nullif(p_product ->> 'name', ''), 'Untitled'),
       p_product ->> 'description',
       coalesce(nullif(p_product ->> 'price_ghs', '')::numeric, 0),
       nullif(p_product ->> 'compare_at_ghs', '')::numeric,
       coalesce((p_product ->> 'flash_sale')::boolean, false),
       public.seller_text_array(p_product, 'sizes'),
       public.seller_text_array(p_product, 'colors'),
       nullif(p_product ->> 'badge', ''),
       coalesce((p_product ->> 'in_stock')::boolean, true),
       coalesce(nullif(p_product ->> 'sort_order', '')::int, 0),
       nullif(p_product ->> 'image', ''),
       public.seller_text_array(p_product, 'images'))
    returning * into v_row;
  end if;

  return to_jsonb(v_row);
end;
$$;

revoke all on function public.seller_upsert_product(text, jsonb) from public;
grant execute on function public.seller_upsert_product(text, jsonb) to anon, authenticated;

-- Delete one product. Browser-only ids (non-numeric) simply return false —
-- there is nothing in the table to delete.
create or replace function public.seller_delete_product(p_key text, p_id text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if not exists (select 1 from public.seller_auth where seller_key = p_key) then
    raise exception 'Invalid seller key.' using errcode = '42501';
  end if;

  if p_id ~ '^[0-9]+$' then
    delete from public.products where id = p_id::bigint;
    return true;
  end if;

  return false;
end;
$$;

revoke all on function public.seller_delete_product(text, text) from public;
grant execute on function public.seller_delete_product(text, text) to anon, authenticated;

-- ---------------------------------------------------------------
-- Real stock: September 2026 market arrivals.
-- Idempotent — each row is only inserted if the name is not there yet.
-- Photos currently point at the shared placeholder; when the edited
-- listing photos land in assets/products/, update image/images here
-- (or edit the listing in Seller Center) and re-run.
-- ---------------------------------------------------------------

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image, images)
select 'fashion', 'streetwear', 'Olive Dotted Fringe Two-Piece Set',
       'A ribbed olive two-piece with tiny white dots: an easy round-neck top and a fringe-cut mini skirt that moves when you do.',
       220, array['S','M','L'], array['Olive'], 'New', true, 30, '', '{}'
where not exists (select 1 from public.products where name = 'Olive Dotted Fringe Two-Piece Set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image, images)
select 'fashion', 'streetwear', 'Striped Tee & Sparkle Skirt Set',
       'A white tee with fine black stripes and a fringed neckline, paired with a black sparkle pencil skirt for day-to-night.',
       190, array['S','M','L'], array['Black / White'], 'New', true, 31, '', '{}'
where not exists (select 1 from public.products where name = 'Striped Tee & Sparkle Skirt Set');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image, images)
select 'fashion', 'modest', 'Coral Floral Belted Maxi Dress',
       'A breezy white maxi covered in coral florals, with a matching self-tie belt and a soft pleated skirt with a front split.',
       240, array['M','L','XL'], array['Coral'], 'New', true, 32, '', '{}'
where not exists (select 1 from public.products where name = 'Coral Floral Belted Maxi Dress');

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image, images)
select 'fashion', 'streetwear', 'Turquoise Stripe Applique Midi Dress',
       'A ribbed sleeveless midi in bold turquoise and white stripes, with pearl flower appliques and a keyhole neckline.',
       210, array['S','M','L'], array['Turquoise'], 'New', true, 33, '', '{}'
where not exists (select 1 from public.products where name = 'Turquoise Stripe Applique Midi Dress');
