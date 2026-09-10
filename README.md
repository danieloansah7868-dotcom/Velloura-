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

2. The site runs in **demo mode** until you connect Supabase. In demo mode products and orders are stored in the browser only. Seller Center sign-in requires Supabase (real Supabase Auth) and is unavailable in demo mode.

Seller Center: `login.html` — Supabase Auth (email + password). The account must also be listed in the `admin_users` table; see `DEPLOYMENT.md` and `supabase/bootstrap-admin.sql`.

## Payment

Checkout shows **Pay**, with Valmont underneath. Customers pay with MTN MoMo, Vodafone Cash, AirtelTigo or card. After they place an order they tap Pay; Velloura then confirms on WhatsApp.

Real charges need a merchant payment link (`pay.html?access_code=…`) from the Valmont dashboard. Do not put Valmont or Paystack secret keys in this repo. The public site only stores `CONFIG.valmontPayUrl`.

## Connecting Supabase

Project URL and the publishable key live in `js/config.js`. Never put the **service_role** key in the website code.

Open **SQL Editor** in the Supabase project and run `supabase/setup.sql` so the `products`, `orders` and `admin_users` tables, RLS policies and the `products` storage bucket exist, then run `supabase/catalog-seed.sql` to load the 7 canonical products.

**Already have tables in the live project?** Run the dated migration in `supabase/migrations/` instead of `setup.sql`, and follow `DEPLOYMENT.md`.

Seller Center sign-in is real Supabase Auth: only accounts listed in `admin_users` (see `supabase/bootstrap-admin.sql`) can open the dashboard, and row-level security enforces the same rule on the database itself.

## WhatsApp

Open `js/config.js` and change:

```js
whatsappNumber: "233556555317",
```

Use the full international number without the `+` sign.

## Managing products

Public shop items are fashion only (`dept: fashion`, collection `streetwear` or `modest`).

The owner can edit products in Seller Center (`admin.html`) or in the Supabase `products` table. Seller Center saves go straight to the database, so edits persist across devices.

When photos arrive, add the file to `assets/products/` and set the `image` field — or upload directly in Seller Center, which stores the photo in the Supabase `products` storage bucket.

## Deploying

This is a static site. Deploy the repo to Vercel (no build command). Do not connect `vellouragh.com` until the owner approves the build.

## Brand logo

The circular VELLOURA logo lives in `assets/logo.png` and is used as the header mark and favicon. It is not pasted as a large graphic on page content.
