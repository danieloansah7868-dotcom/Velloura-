# VELLOURA Phase 1 Build Report

## What was built

A clean, mobile-first frontend for the VELLOURA online shop. It is built as plain HTML, CSS and external JavaScript files, ready to deploy on Vercel.

## Files created

| File | Purpose |
| --- | --- |
| `index.html` | Home page: hero, department cards, new drops, trust strip, footer with socials and WhatsApp |
| `shop.html` | Shop page: department chips plus fashion collection chips and product grid |
| `product.html` | Product detail page: sizes, colours, quantity, sticky add-to-bag bar on phone |
| `cart-view.html` | Full cart page with quantity stepper, remove and fee breakdown |
| `checkout.html` | Checkout form, fee breakdown, order save and success screen with WhatsApp button |
| `hair.html` | Hair and Wigs shop category page (e-commerce, built on the shop renderer) |
| `about.html` | Brand story, Instagram link and WhatsApp contact |
| `terms.html` | Terms page |
| `privacy.html` | Privacy page |
| `delivery-returns.html` | Delivery and returns page |
| `css/styles.css` | Mobile-first styles (built at 360px, extended for tablet/desktop) |
| `js/config.js` | Single place to change WhatsApp number and Supabase settings |
| `js/utils.js` | Shared helpers |
| `js/supabase.js` | Supabase client factory |
| `js/catalog.js` | Product loading and demo catalog |
| `js/store.js` | Cart and orders logic |
| `js/render.js` | Shared product card rendering |
| `js/cart-helpers.js` | Cart drawer |
| `js/home.js`, `js/shop.js`, `js/product.js`, `js/cart-view.js`, `js/checkout.js`, `js/hair.js` | Page logic |
| `assets/favicon.svg` | Temporary V monogram favicon (real favicon file to be added) |
| `assets/placeholder-fashion.svg`, `assets/placeholder-jewelry.svg`, `assets/placeholder-hair.svg` | SVG product placeholders |
| `supabase/setup.sql` | Supabase schema, public read/insert policies and 10 placeholder products |

## How orders are saved

1. Customer shops, then goes to checkout.
2. The checkout page builds the cart items.
3. On submit, `js/checkout.js` calls `placeOrder()` in `js/store.js`.
4. When Supabase is configured, `placeOrder()` inserts one row into the `public.orders` table with a unique `order_code` like `VEL-1042`.
5. The success screen shows the order code with a WhatsApp button that opens a pre-filled message containing the code and items.
6. In demo mode (before Supabase is connected), orders are stored in the browser's localStorage so the full journey can still be tested.

## How products are managed

Products are read from the `public.products` table in Supabase. The owner can edit them in the Supabase Table Editor. For safety, the table only stores the fields a non-technical owner needs: department, collection, name, description, price, sizes, colours, badge, stock and sort order.

## What the owner must review before launch

1. Run `supabase/setup.sql` in her own Supabase project and confirm the tables and policies exist.
2. Add the real WhatsApp number in `js/config.js`.
3. Add the real Supabase URL and anon key in `js/config.js`.
4. Replace the 10 placeholder products with real products and real prices.
5. Check the checkout journey on a 360px phone.
6. Review terms, privacy and delivery/returns text and make any brand-standard adjustments.
7. Decide on the final Instagram handle and update the links that currently point to `https://www.instagram.com/vellouragh`.
8. Check the WhatsApp messages that orders send, so the wording feels right for the brand.

## Security

- Only the publishable anon Supabase key is used in the site.
- No service-role key or secret is included.
- Visitors can read `products` and insert `orders`.
- There is no `select` policy on `orders`, so strangers cannot read customer orders through the public API.
- The client reads orders in the Supabase Table Editor under her own login.

## What the client must provide

- The real logo file in a transparent PNG or SVG. The site header currently uses a clean text wordmark and a temporary V favicon because the original logo file has not been added to this workspace; the client's real logo file should replace these before launch.
- Real product photos (the site currently uses local SVG placeholders).
- Real product names, descriptions and Ghana prices.
- Final WhatsApp WhatsApp number in international format, without the plus sign.
- Final Instagram handle.
- Confirm the delivery areas and fees.
- Confirm the hair and wig product prices.
