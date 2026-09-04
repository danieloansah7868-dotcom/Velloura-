-- VELLOURA Supabase setup
-- Run this file in YOUR Supabase project's SQL Editor (in the client's own account).
-- This creates the tables, public read/insert policies and placeholder products.

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
  image text
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

alter table public.bookings enable row level security;
drop policy if exists "public can book hair" on public.bookings;
create policy "public can book hair" on public.bookings
  for insert to anon with check (
    char_length(customer_name) between 2 and 120 and
    char_length(phone) between 7 and 40
  );

-- ---------------------------------------------------------------
-- Placeholder products
-- Placeholder images point at the local files that ship with the repo.
-- The client will replace these products and photos before launch.
-- If you run this block twice, delete the existing product rows first
-- or the values will be added again. Use the Table Editor to change them.
-- ---------------------------------------------------------------

insert into public.products
  (dept, collection, name, description, price_ghs, sizes, colors, badge, in_stock, sort_order, image)
values
  ('fashion', 'streetwear', 'Brooklyn Crop Set', 'A soft two-piece crop top and joggers set for easy street days.', 180, array['XS','S','M','L','XL'], array['Black','White'], null, true, 1, 'assets/products/fashion-crop-set.jpg'),
  ('fashion', 'streetwear', 'Royal Oversized Tee', 'An oversized cotton tee in royal navy for a bold everyday look.', 90, array['XS','S','M','L','XL'], array['Royal Navy','White','Black'], null, true, 2, 'assets/products/fashion-royal-tee.jpg'),
  ('fashion', 'modest', 'Modest Satin Maxi Dress', 'A relaxed satin maxi dress with long sleeves, made to move with you.', 260, array['XS','S','M','L','XL'], array['Emerald','Navy','Burgundy'], null, true, 3, 'assets/products/fashion-modest-maxi.jpg'),
  ('fashion', 'modest', 'Everyday Modest Set', 'A long-line top and wide trousers set. Comfortable and easy to style.', 220, array['XS','S','M','L','XL'], array['Beige','Navy'], null, true, 4, 'assets/products/fashion-modest-set.jpg'),
  ('fashion', 'thrift', 'Vintage Denim Blazer', 'A one-piece vintage denim blazer. Only one available, so it will not be repeated.', 140, array['M','L'], array['Grey Denim'], '1 of 1', true, 5, 'assets/products/fashion-denim-blazer.jpg'),
  ('fashion', 'thrift', 'Classic Cream Blouse', 'A timeless cream blouse. Only one piece available.', 80, array['S','M'], array['Cream'], '1 of 1', true, 6, 'assets/products/fashion-cream-blouse.jpg'),
  ('jewelry', null, 'Crown Gold Ring', '24k gold plated ring with a small crown detail. Tarnish free.', 120, array[]::text[], array[]::text[], null, true, 7, 'assets/products/jewelry-crown-ring.jpg'),
  ('jewelry', null, 'Estate Pearl Earrings', '18k plated drop earrings. Hypoallergenic and light on the ear.', 150, array[]::text[], array[]::text[], null, true, 8, 'assets/products/jewelry-pearl-earrings.jpg'),
  ('jewelry', null, 'Woven Gold Necklace', 'A fine woven gold-toned chain. Tarnish free and good for daily wear.', 180, array[]::text[], array[]::text[], null, true, 9, 'assets/products/jewelry-woven-necklace.jpg'),
  ('jewelry', null, 'Velloura Charm Bangle', '18k plated adjustable bangle with a small crown charm.', 170, array[]::text[], array[]::text[], null, true, 10, 'assets/products/jewelry-charm-bangle.jpg'),
  ('hair', null, 'Silky Straight Bundle (24 inch)', 'A single bundle of silky straight virgin hair. Sold as a bundle.', 480, array['12 inch','14 inch','16 inch','18 inch','20 inch','22 inch','24 inch'], array['Natural Black'], null, true, 11, 'assets/products/hair-virgin-bundle.jpg'),
  ('hair', null, 'Lace Closure (18 inch)', 'A transparent lace closure with straight hair for a natural finish.', 320, array['14 inch','16 inch','18 inch','20 inch'], array['Natural Black'], null, true, 12, 'assets/products/hair-closure.jpg'),
  ('wigs', null, 'Glueless Lace Front Wig (26 inch)', 'A long glueless lace front wig with a soft natural part.', 850, array['18 inch','20 inch','22 inch','24 inch','26 inch'], array['Natural Black','Honey Blonde'], null, true, 13, 'assets/products/wig-lace-front.jpg'),
  ('wigs', null, 'Sleek Bob Wig', 'A polished jet black bob wig with a clean, lightweight finish.', 650, array['10 inch','12 inch'], array['Jet Black','Brown'], null, true, 14, 'assets/products/wig-bob.jpg'),
  ('fashion', 'modest', 'Ivory Wrap Dress', 'A soft ivory wrap dress with a flattering tie waist. Easy to dress up or down.', 240, array['XS','S','M','L','XL'], array['Ivory'], null, true, 15, 'assets/products/fashion-ivory-wrap-dress.jpg'),
  ('fashion', 'streetwear', 'Navy Wide-Leg Trousers', 'High-waist navy trousers with a relaxed wide leg. A polished streetwear staple.', 160, array['XS','S','M','L','XL'], array['Navy'], null, true, 16, 'assets/products/fashion-wide-leg-trousers.jpg'),
  ('fashion', 'streetwear', 'Burgundy Pleated Skirt', 'A modern burgundy pleated midi skirt with a soft movement.', 130, array['XS','S','M','L'], array['Burgundy'], null, true, 17, 'assets/products/fashion-pleated-skirt.jpg'),
  ('jewelry', null, 'Gilded Hoop Earrings', 'Lightweight gold hoops for everyday wear. Tarnish free.', 95, array[]::text[], array[]::text[], null, true, 18, 'assets/products/jewelry-gold-hoops.jpg'),
  ('jewelry', null, 'Royal Pendant Necklace', 'A delicate gold pendant with a small round charm.', 200, array[]::text[], array[]::text[], null, true, 19, 'assets/products/jewelry-pendant-necklace.jpg'),
  ('jewelry', null, 'Gold Link Bracelet', 'A clean gold link bracelet. Tarnish free and easy to layer.', 110, array[]::text[], array[]::text[], null, true, 20, 'assets/products/jewelry-link-bracelet.jpg'),
  ('hair', null, 'Deep Wave Bundle (18 inch)', 'A single bundle of deep wave virgin hair with a soft pattern.', 420, array['12 inch','14 inch','16 inch','18 inch','20 inch'], array['Natural Black'], null, true, 21, 'assets/products/hair-deep-wave-bundle.jpg'),
  ('hair', null, '4x4 Lace Closure (16 inch)', 'A 4x4 lace closure with natural wavy hair for a soft finish.', 280, array['14 inch','16 inch','18 inch'], array['Natural Black'], null, true, 22, 'assets/products/hair-4x4-closure.jpg'),
  ('wigs', null, 'Body Wave Lace Front Wig (24 inch)', 'A long body wave lace front wig with a natural flow.', 780, array['18 inch','20 inch','22 inch','24 inch'], array['Natural Black','Dark Brown'], null, true, 23, 'assets/products/wig-body-wave.jpg'),
  ('wigs', null, 'Highlighted Bob Wig', 'A chic bob wig with soft honey highlights for a fresh finish.', 550, array['10 inch','12 inch'], array['Honey Brown','Jet Black'], null, true, 24, 'assets/products/wig-highlight-bob.jpg');
