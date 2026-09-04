# VELLOURA Phase 1 Build Report

## What was built

A mobile-first frontend for the VELLOURA clothing shop. Plain HTML, CSS and JavaScript, ready to deploy on Vercel.

The public shop is **clothes only**: streetwear and modest wear at affordable Accra prices. Jewelry, hair, wigs and thrift are stripped from navigation, chips, footers and the catalogue. Old URLs (`jewelry.html`, `hair.html`, `wigs.html`, `thrift.html`) noindex and send people to `shop.html`.

## Payment

Checkout shows **Pay**, with Valmont underneath (`https://valmontpay.app`). No pay-on-delivery radios. After place-order the customer gets an order code, a Pay button, and a WhatsApp confirm link. Real card/MoMo charges still need a merchant `access_code` from Valmont; this site does not store Valmont or Paystack secrets. Supabase is wired in `js/config.js`.

## How orders are saved

1. Customer shops, then goes to checkout.
2. On submit, `js/checkout.js` calls `placeOrder()` in `js/store.js`.
3. When Supabase is configured, the order is inserted into `public.orders` with a code like `VEL-1042`.
4. The success screen opens Valmont Pay and offers WhatsApp + track.
5. In demo mode, orders stay in localStorage.

## What the owner must review before launch

1. Run `supabase/setup.sql` in her own Supabase project.
2. Confirm WhatsApp `233556555317` in `js/config.js`.
3. Add the real Supabase URL and anon key in `js/config.js`.
4. Create a Valmont Pay merchant link and wire `access_code` when she has one.
5. Replace placeholder clothes with real stock and photos before taking money.
6. Check checkout on a phone.
7. Review terms, privacy and delivery/returns.
8. Confirm Instagram `vellouragh`.

## Security

- Only the publishable anon Supabase key belongs in the site (currently empty = demo mode).
- No Valmont, Paystack or service-role secrets.
- Seller Center password `velloura` is a front door only — change it before launch.
