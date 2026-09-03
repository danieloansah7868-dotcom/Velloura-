# VELLOURA - Phase 1 Online Shop

A mobile-first, real online shop for VELLOURA, a Ghanaian women's brand selling Fashion, Jewelry, Hair and Wigs.

Everything is designed at 360px first, then extended for tablet and desktop. The site uses plain HTML, CSS and external JavaScript files, with Supabase as the backend.

## Brand palette

The site uses the client's actual brand colors from the logo: deep navy `#0a1a3f` and darker navy `#071129`, crown gold `#c9a553`, burgundy `#7c1f3c`, plus an ivory `#f8f5ef` background and dark ink text. All are defined once in `css/styles.css` under `:root`.

---

## Quick start

1. Open `index.html` in a browser, or run a tiny static server:

```bash
npx serve .
```

2. The site runs in **demo mode** until you connect Supabase. In demo mode products and orders are stored in the browser only, so the full journey works for testing.

To test on a phone, open the preview URL from Arena on your phone. The layout is built for 360-430px widths.

---

## Connecting the real backend (Supabase)

The client must create her own Supabase project under **her own email address**.

1. Go to Supabase and create a project.
2. Open **SQL Editor** and run the entire file `supabase/setup.sql`.
3. In **Project Settings > API**, copy the **Project URL** and the **anon / publishable key**.
4. Open `js/config.js` and set:

```js
supabaseUrl: "https://YOUR-PROJECT.supabase.co",
supabaseAnonKey: "YOUR-ANON-KEY",
```

5. The site now reads real products from `public.products` and saves real orders to `public.orders`.

Important:
- Never put the **service_role** key in the website code.
- Only the publishable anon key is used.
- Orders have **no public select policy**, so strangers cannot read them. The owner reads them in the Supabase Table Editor under her own login.

---

## Changing the WhatsApp number

Open `js/config.js` and change one line:

```js
whatsappNumber: "233XXXXXXXXX",
```

Use the full international number without the `+` sign (e.g. `233241234567`). Order confirmation buttons use this number automatically.

---

## Managing products

The owner can manage products in the Supabase **Table Editor** under the `products` table. No code changes are needed.

Fields:
- `dept` - `fashion`, `jewelry`, `hair` or `wigs`
- `collection` - for fashion: `streetwear`, `modest`, `thrift` (leave empty for jewelry)
- `name` - product title
- `description` - short sentence
- `price_ghs` - price in Ghana cedis (number)
- `sizes` - text array, e.g. `["XS","S","M","L","XL"]`. Leave `[]` for jewelry.
- `colors` - text array, e.g. `["Black","White"]`. Leave `[]` for jewelry.
- `badge` - `1 of 1` for thrift items, otherwise leave blank
- `in_stock` - tick/untick
- `sort_order` - lower numbers show first

The `supabase/setup.sql` file already inserts 10 placeholder products. Mark them as placeholders in the report and replace them before launch.

When the real photos arrive, add the image file to `assets/` and put the file name (e.g. `assets/my-product.jpg`) in a new `image` column in the products table. For now the site uses SVG placeholders so it stays light on mobile data.

---

## Reading orders

The client reads them in the Supabase **Table Editor** in the `orders` table. Every order placed from the website appears there. Each order has an `order_code` (like `VEL-1042`) and a `status` that starts as `new`.

The client can also use the Supabase SQL Editor if she wants a filter, for example:

```sql
select * from public.orders order by created_at desc;
```

---

## Deploying to Vercel

This is a static site. Deploy the repo to Vercel and select **Vercel (static)** or just deploy the root folder. No build command is needed. Do not connect the domain `vellouragh.com` until the client approves the build.

---

## Files

```
index.html                 Home page
shop.html                  Shop page with department and collection chips
product.html               Product detail page
cart-view.html             Full cart page
checkout.html              Checkout and order success page
hair.html                  Hair and Wigs shop page (shows the hair category)
about.html                 About Velloura
terms.html                 Legal: terms
privacy.html               Legal: privacy
delivery-returns.html      Legal: delivery and returns
css/styles.css             Mobile-first styles
js/config.js               ONE PLACE to change WhatsApp and Supabase settings
js/utils.js                Shared helpers
js/catalog.js              Product loading (Supabase or demo)
js/store.js                Cart and orders logic
js/supabase.js             Supabase client factory
js/render.js               Shared product rendering helpers
js/cart-helpers.js         Cart drawer
js/home.js                 Home page logic
js/shop.js                 Shop page logic
js/product.js              Product page logic
js/cart-view.js            Cart page logic
js/checkout.js             Checkout and order success logic
js/shop.js                 Shared shop/category logic (used by shop.html and hair.html)
assets/favicon.svg         Temporary browser favicon (simple V monogram, replace with real favicon)
assets/placeholder-*.svg   SVG product placeholders (replace with real photos later)
supabase/setup.sql         Supabase schema, policies and placeholder products
```

## Brand logo

The client's real roundel logo is required before launch. The site header currently uses an elegant text wordmark with a small temporary gold crown ornament (added to `assets/crown.svg`) because the original logo file has not been added to this workspace yet. As soon as the client provides the original PNG/SVG logo, place it in `assets/` and swap the header/footer/favicon markup to that file.

## Brand palette

Navy `#0a1a3f` / `#071129`, gold `#c9a553`, burgundy `#7c1f3c`, ivory `#faf7f0`. Defined once in `css/styles.css` under `:root`.
