# VELLOURA — affordable clothes from Accra

A mobile-first shop for VELLOURA. Right now the public catalogue is clothing only: streetwear and modest wear. Jewelry, hair, wigs and thrift are not for sale.

The site is plain HTML, CSS and JavaScript. It runs in demo mode until Supabase is connected.

## Brand palette

Official colours: royal blue `#1e2fbd` and wine `#7b1f3b`, on a white background. Cream and gold are not used in the UI. All are defined once in `css/styles.css` under `:root`.

## Quick start

1. Open `index.html` in a browser, or run a tiny static server:

```bash
python3 -m http.server 8080
```

2. The site runs in **demo mode** until you connect Supabase. In demo mode products and orders are stored in the browser only.

Seller Center (demo): `login.html` — `admin@velloura.com` / `velloura`.

## Payment

Checkout shows **Pay**, with Valmont underneath. Customers pay with MTN MoMo, Vodafone Cash, AirtelTigo or card. After they place an order they tap Pay; Velloura then confirms on WhatsApp.

Real charges need a merchant payment link (`pay.html?access_code=…`) from the Valmont dashboard. Do not put Valmont or Paystack secret keys in this repo. The public site only stores `CONFIG.valmontPayUrl`.

## Connecting Supabase

Project URL and the publishable key live in `js/config.js`. Never put the **service_role** key in the website code.

Open **SQL Editor** in the Supabase project and run `supabase/setup.sql` so the `products` and `orders` tables exist.

## WhatsApp

Open `js/config.js` and change:

```js
whatsappNumber: "233556555317",
```

Use the full international number without the `+` sign.

## Managing products

Public shop items are fashion only (`dept: fashion`, collection `streetwear` or `modest`).

The owner can edit products in Seller Center (`admin.html`) or in the Supabase `products` table.

Photos: upload or replace them right in Seller Center (see *Listing photos* below). You can still point the `image` field at a file in `assets/products/` or an `https://` link if you prefer.

## Listing photos

In Seller Center → Products, every product form shows the listing photo with **Upload / replace photo**. Picking a photo shows a preview straight away. On save:

1. The photo is resized in the browser (longest side 1600 px) so the shop stays fast on mobile data.
2. It uploads to the public `product-photos` bucket in Supabase Storage.
3. The product's `image` field gets the photo's public URL, so the live shop shows it at once. A replaced photo is removed from the bucket.

One-time setup in your Supabase project:

1. Run the latest `supabase/setup.sql` (the *Listing photos* section is enough if you ran the rest before). It adds the `product-photos` bucket, its storage policies, the `sellers` table, and product write policies.
2. Authentication → Users → **Add user**: the owner's email and a password (auto-confirm).
3. In the SQL Editor, give that user seller access:

   ```sql
   insert into public.sellers (user_id)
   select id from auth.users where email = 'owner@example.com';
   ```

4. In Seller Center → Dashboard → **Live shop connection**, sign in with that email.

Until the seller account is connected, product edits are refused with a message instead of saving only to the browser (the live table always wins, so a silent local save would vanish). Old price and flash sale now save to the `products` table too (`compare_at_ghs`, `flash_sale` columns from the same SQL).

## Deploying

This is a static site. Deploy the repo to Vercel (no build command). Do not connect `vellouragh.com` until the owner approves the build.

## Brand logo

The circular VELLOURA logo lives in `assets/logo.png` and is used as the header mark and favicon. It is not pasted as a large graphic on page content.
