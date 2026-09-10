-- =====================================================================
-- VELLOURA migration 2026-09-09 — Supabase Auth + catalog alignment
-- =====================================================================
-- OWNER-RUN, in this order:
--   1. Read §0 PREFLIGHT below and take a backup (Dashboard → Database →
--      Backups, or `supabase db dump`). §3, §7 and §8 are DESTRUCTIVE.
--   2. Apply this file to a STAGING project first, verify, then production.
--   3. Then run supabase/catalog-seed.sql (the 276 canonical products).
--   4. Then follow DEPLOYMENT.md (create the owner user, run
--      supabase/bootstrap-admin.sql, run the live checks).
--
-- The file is IDEMPOTENT: re-running it produces the same end state
-- (duplicate-policy and duplicate-constraint errors are pre-empted with
-- drop-if-exists statements). catalog-seed.sql is likewise idempotent.
--
-- ROLLBACK: restore from the backup taken in step 1. There is no
-- in-place rollback for dropped rows/tables; that is why the backup
-- comes first.

-- =====================================================================
-- §0 PREFLIGHT — run these SELECTs and read them BEFORE the migration.
-- (Safe to run any time; they change nothing.)
-- =====================================================================
-- 0.1 Current products by department:
--     select dept, count(*) from public.products group by dept order by dept;
--
-- 0.2 Rows §3 will DELETE (obsolete placeholder seed rows — jewelry, hair,
--     wigs, thrift and the original 7 fashion placeholders, which were
--     replaced by the real-stock catalog in js/catalog.js):
--     select id, name, dept, collection, price_ghs
--     from public.products
--     where dept in ('jewelry', 'hair', 'wigs')
--        or collection = 'thrift'
--        or name in ('Brooklyn Crop Set', 'Oversized Navy Tee',
--                    'Modest Satin Maxi Dress', 'Everyday Modest Set',
--                    'Ivory Wrap Dress', 'Navy Wide-Leg Trousers',
--                    'Burgundy Pleated Skirt', 'Vintage Denim Blazer',
--                    'Classic Cream Blouse', 'Royal Oversized Tee');
--     Optional backup copy of the whole table before running:
--       create table public.products_backup_20260909 as
--         select * from public.products;
--
-- 0.3 Duplicate product names (§3 deduplicates them, keeping the lowest id):
--     select name, count(*) from public.products group by name having count(*) > 1;
--
-- 0.4 Rows that would fail the new price/compare-at checks:
--     select id, name, price_ghs, compare_at_ghs from public.products
--     where price_ghs <= 0
--        or (compare_at_ghs is not null and compare_at_ghs <= price_ghs);
--
-- 0.5 Bookings that §7 will DROP (hair bookings are no longer offered):
--     select count(*) from public.bookings;
--     Optional backup copy before running:
--       create table public.bookings_backup_20260909 as
--         select * from public.bookings;
--
-- 0.6 Orders are NOT modified. Order history keeps its JSONB item
--     snapshots, so deleting obsolete product rows does not break it.

begin;

-- =====================================================================
-- §1 Admin allowlist: table, is_admin() helper, grants
-- =====================================================================

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.admin_users
    where user_id = auth.uid()
  );
$$;

-- Functions are executable by PUBLIC by default; narrow that.
revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Supabase grants new public tables to anon/authenticated by default.
-- The admin list must never be readable or writable through the API.
revoke all on public.admin_users from anon, authenticated;

alter table public.admin_users enable row level security;

-- =====================================================================
-- §2 Tables (created only if missing; existing tables are altered below)
-- =====================================================================

create table if not exists public.products (
  id bigint generated always as identity primary key,
  created_at timestamptz not null default now(),
  dept text not null check (dept in ('fashion')),
  collection text check (collection in ('streetwear', 'modest')),
  name text not null unique,
  description text,
  price_ghs numeric not null check (price_ghs > 0),
  compare_at_ghs numeric,
  flash_sale boolean not null default false,
  sizes text[] default '{}',
  colors text[] default '{}',
  badge text,
  in_stock boolean not null default true,
  sort_order int default 0,
  image text,
  images text[] not null default '{}',
  constraint products_compare_at_check
    check (compare_at_ghs is null or compare_at_ghs > price_ghs)
);

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
    check (status in ('new', 'confirmed', 'packed', 'delivered', 'cancelled')),
  customer_email text,
  payment text
);

-- Older projects: add the columns the storefront now maps.
alter table public.orders add column if not exists customer_email text;
alter table public.orders add column if not exists payment text;

-- Products: gallery + flash-sale columns.
alter table public.products add column if not exists compare_at_ghs numeric;
alter table public.products add column if not exists flash_sale boolean not null default false;
alter table public.products add column if not exists images text[] not null default '{}';

-- Seed the gallery from the old single-image column where needed.
update public.products
   set images = array[image]
 where coalesce(array_length(images, 1), 0) = 0
   and image is not null
   and image <> '';

-- =====================================================================
-- §3 Products cleanup (DESTRUCTIVE — see preflight §0.2/§0.3)
-- =====================================================================

-- The first seed called this product "Royal Oversized Tee"; align the name
-- before the placeholder cleanup below (harmless if it does not exist).
update public.products
set name = 'Oversized Navy Tee'
where name = 'Royal Oversized Tee'
  and not exists (select 1 from public.products p where p.name = 'Oversized Navy Tee');

-- Remove obsolete placeholder products: jewelry, hair, wigs and thrift are
-- no longer sold, and the original 7 fashion placeholders were replaced by
-- the real-stock catalog (supabase/catalog-seed.sql). Order history is
-- untouched — orders keep their own item snapshots.
delete from public.products
where dept in ('jewelry', 'hair', 'wigs')
   or collection = 'thrift'
   or name in ('Brooklyn Crop Set', 'Oversized Navy Tee',
               'Modest Satin Maxi Dress', 'Everyday Modest Set',
               'Ivory Wrap Dress', 'Navy Wide-Leg Trousers',
               'Burgundy Pleated Skirt', 'Vintage Denim Blazer',
               'Classic Cream Blouse');

-- If an older non-idempotent seed ran twice, keep one row per name.
delete from public.products p
using public.products q
where p.name = q.name
  and p.id > q.id;

-- Deterministic unique key for idempotent seeding.
alter table public.products drop constraint if exists products_name_key;
alter table public.products add constraint products_name_key unique (name);

-- Clean incompatible compare-at values before the check (preflight §0.4).
update public.products
set compare_at_ghs = null
where compare_at_ghs is not null
  and compare_at_ghs <= price_ghs;

-- The 276 canonical products are loaded by supabase/catalog-seed.sql
-- (idempotent upserts keyed by name) — run it right after this file.

-- Tighten constraints (drop+add keeps reruns deterministic).
alter table public.products drop constraint if exists products_dept_check;
alter table public.products add constraint products_dept_check check (dept in ('fashion'));

alter table public.products drop constraint if exists products_collection_check;
alter table public.products add constraint products_collection_check
  check (collection in ('streetwear', 'modest'));

alter table public.products drop constraint if exists products_price_positive_check;
alter table public.products add constraint products_price_positive_check check (price_ghs > 0);

alter table public.products drop constraint if exists products_compare_at_check;
alter table public.products add constraint products_compare_at_check
  check (compare_at_ghs is null or compare_at_ghs > price_ghs);

-- Orders: pin the status vocabulary (live statuses already use these values).
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check
  check (status in ('new', 'confirmed', 'packed', 'delivered', 'cancelled'));

-- =====================================================================
-- §4 Row Level Security (anon: read products, place orders; admins
--     in public.admin_users: manage products and orders)
-- =====================================================================

alter table public.products enable row level security;

drop policy if exists "public can read products" on public.products; -- old name
drop policy if exists "public read products" on public.products;
create policy "public read products" on public.products
  for select to anon, authenticated
  using (true);

drop policy if exists "admin insert products" on public.products;
create policy "admin insert products" on public.products
  for insert to authenticated
  with check (public.is_admin());

drop policy if exists "admin update products" on public.products;
create policy "admin update products" on public.products
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

drop policy if exists "admin delete products" on public.products;
create policy "admin delete products" on public.products
  for delete to authenticated
  using (public.is_admin());

alter table public.orders enable row level security;

drop policy if exists "public can place orders" on public.orders; -- old name
drop policy if exists "public place orders" on public.orders;
create policy "public place orders" on public.orders
  for insert to anon, authenticated
  with check (
    status = 'new'
    and char_length(customer_name) between 2 and 120
    and char_length(phone) between 7 and 40
  );

drop policy if exists "admin read orders" on public.orders;
create policy "admin read orders" on public.orders
  for select to authenticated
  using (public.is_admin());

drop policy if exists "admin update orders" on public.orders;
create policy "admin update orders" on public.orders
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- =====================================================================
-- §5 Order tracking RPC — hardened (empty search_path, qualified names).
--    Returns only the order matching BOTH the code and the phone number.
-- =====================================================================

create or replace function public.track_order(p_code text, p_phone text)
returns setof public.orders
language sql
stable
security definer
set search_path = ''
as $$
  select o.*
  from public.orders o
  where upper(o.order_code) = upper(trim(p_code))
    and regexp_replace(coalesce(o.phone, ''), '[^0-9]', '', 'g')
      = regexp_replace(coalesce(p_phone, ''), '[^0-9]', '', 'g')
  limit 1;
$$;

revoke all on function public.track_order(text, text) from public;
grant execute on function public.track_order(text, text) to anon, authenticated;

-- =====================================================================
-- §6 Storage: "product-images" bucket. Public reads (the shop shows the
-- photos); writes/deletes require an authenticated admin. This REPLACES
-- the older permissive "seller can ..." policies, which allowed anyone
-- holding the publishable key to upload.
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images are public" on storage.objects; -- old name
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "seller can upload product images" on storage.objects; -- permissive, replaced
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and name like 'products/%'
    and name ~* '\.(jpe?g|png|webp|avif|gif)$'
    and public.is_admin()
  );

drop policy if exists "seller can replace product images" on storage.objects; -- permissive, replaced
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and name like 'products/%' and public.is_admin())
  with check (bucket_id = 'product-images' and name like 'products/%' and public.is_admin());

drop policy if exists "seller can delete product images" on storage.objects; -- permissive, replaced
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and name like 'products/%' and public.is_admin());

-- =====================================================================
-- §7 DESTRUCTIVE: drop the unused hair-booking table.
-- The storefront has no booking UI and no code path writes to it
-- (see preflight §0.5 for a backup copy; the optional backup table
-- created there is preserved).
-- =====================================================================

drop table if exists public.bookings;

-- =====================================================================
-- §8 DESTRUCTIVE: remove the shared-key seller auth from the older
-- setup.sql. Product writes now go through the admin RLS policies above
-- (Supabase Auth + public.admin_users). If the old seller_key was ever
-- public, it is dead after this section — nothing checks it anymore.
-- =====================================================================

drop table if exists public.seller_auth;

drop function if exists public.seller_upsert_product(text, jsonb);
drop function if exists public.seller_delete_product(text, text);
drop function if exists public.seller_delete_product(text, bigint);
drop function if exists public.seller_text_array(jsonb, text);

-- =====================================================================
-- §9 VERIFY (results print in the SQL Editor)
-- =====================================================================

select count(*) as products_left, count(*) filter (where dept <> 'fashion') as non_fashion
from public.products;

select count(*) as orders_kept from public.orders;

select to_regclass('public.bookings') as bookings_table;       -- expect null
select to_regclass('public.seller_auth') as seller_auth_table; -- expect null

commit;

-- Next: run supabase/catalog-seed.sql, then DEPLOYMENT.md steps 3-8.
