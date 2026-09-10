-- =====================================================================
-- VELLOURA Supabase bootstrap schema (FRESH projects only)
-- =====================================================================
-- Run this file in your Supabase project's SQL Editor, then run
-- supabase/catalog-seed.sql to load the canonical products.
--
-- ALREADY HAVE TABLES? Do NOT run this file. Run the incremental
-- migration in supabase/migrations/ instead.
--
-- Seller Center login uses Supabase Auth. After this file:
--   1. Authentication -> Providers -> Email: enabled.
--      Turn OFF "Allow new users to sign up" unless customer accounts
--      are wanted (checkout and order tracking work without them).
--   2. Create the owner's user (Authentication -> Users -> Add user)
--      with a strong password.
--   3. Run supabase/bootstrap-admin.sql to allowlist that user.
--
-- Access model:
--   Anonymous visitors can: read products, insert orders (status 'new'),
--   track their own order (track_order RPC), read public listing photos.
--   Authenticated admins (listed in public.admin_users) can: read/write
--   products, read/update orders, upload/replace/delete listing photos.

-- ---------------------------------------------------------------
-- Admin allowlist helper (must exist before the table policies)
-- ---------------------------------------------------------------

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

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- ---------------------------------------------------------------
-- Admin allowlist table
-- ---------------------------------------------------------------

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Supabase grants new public tables to anon/authenticated by default.
-- The admin list must never be readable or writable through the API.
revoke all on public.admin_users from anon, authenticated;

alter table public.admin_users enable row level security;

-- ---------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------

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

-- Public inserts are pinned to the safe initial status; anonymous
-- visitors can never read, update or delete orders.
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

-- ---------------------------------------------------------------
-- Order tracking RPC (security definer: returns only the order that
-- matches BOTH the tracking code and the phone number)
-- ---------------------------------------------------------------

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

-- ---------------------------------------------------------------
-- Storage: "product-images" bucket. Public reads (the shop shows the
-- photos); writes/deletes require an authenticated admin.
-- Uploads live under products/ in the bucket.
-- ---------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do update set public = true;

drop policy if exists "product images are public" on storage.objects;
drop policy if exists "public read product images" on storage.objects;
create policy "public read product images" on storage.objects
  for select to anon, authenticated
  using (bucket_id = 'product-images');

drop policy if exists "seller can upload product images" on storage.objects; -- old permissive version
drop policy if exists "admin upload product images" on storage.objects;
create policy "admin upload product images" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'product-images'
    and name like 'products/%'
    and name ~* '\.(jpe?g|png|webp|avif|gif)$'
    and public.is_admin()
  );

drop policy if exists "seller can replace product images" on storage.objects; -- old permissive version
drop policy if exists "admin update product images" on storage.objects;
create policy "admin update product images" on storage.objects
  for update to authenticated
  using (bucket_id = 'product-images' and name like 'products/%' and public.is_admin())
  with check (bucket_id = 'product-images' and name like 'products/%' and public.is_admin());

drop policy if exists "seller can delete product images" on storage.objects; -- old permissive version
drop policy if exists "admin delete product images" on storage.objects;
create policy "admin delete product images" on storage.objects
  for delete to authenticated
  using (bucket_id = 'product-images' and name like 'products/%' and public.is_admin());

-- Next: run supabase/catalog-seed.sql to load the canonical products.
