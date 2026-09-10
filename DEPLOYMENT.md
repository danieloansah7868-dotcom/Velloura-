# VELLOURA — deployment & verification runbook

Applies the 2026-09-09 auth + catalog upgrade to the live Supabase project and
the static site. Work through the steps in order. Nothing here needs a secret
in the repository — the only key the website ships is the Supabase
**publishable (anon) key** in `js/config.js`.

## 1. Back up first

1. Dashboard → **Database → Backups** (note the latest restore point), or run
   `supabase db dump --data-only` locally against the project.
2. Open the SQL Editor and run the preflight queries listed at the top of
   `supabase/migrations/20260909_auth_catalog_alignment.sql` (§0). They show
   exactly what the migration will delete (obsolete seed products, duplicate
   names, the `bookings` table).
3. Optional but recommended, keep a copy in the project itself:

   ```sql
   create table public.products_backup_20260909 as select * from public.products;
   -- create table public.bookings_backup_20260909 as select * from public.bookings;
   ```

## 2. Apply the migration (staging first, then production)

1. Create/open a **staging** Supabase project and run
   `supabase/migrations/20260909_auth_catalog_alignment.sql` there.
2. Run the verification queries in §8 of the migration file (they also print
   automatically): 7 fashion rows, correct prices, orders untouched.
3. Repeat the exact same file in **production**.
4. Re-running the file is safe (idempotent).

## 3. Enable auth

1. **Authentication → Sign In / Providers → Email**: enable.
2. **Authentication → Sign Up**: disable **"Allow new users to sign up"**
   unless customer accounts are wanted — the storefront checkout and order
   tracking work fully without accounts.
3. **Authentication → URL Configuration**: Site URL `https://vellouragh.com`,
   Redirect URLs `https://vellouragh.com/**`.

## 4. Create the owner's login

1. **Authentication → Users → Add user**: the owner's real email and a **new
   strong password**. Do **not** reuse the old demo Seller Center password
   that used to be shown on the login page — it was public.
2. If email confirmation is on, confirm the user (Users → … → Confirm).

## 5. Allowlist the owner as admin

Run `supabase/bootstrap-admin.sql` in the SQL Editor after replacing
`OWNER_EMAIL` with the owner's email. It inserts the user's UUID into
`public.admin_users` (`on conflict do nothing`, safe to re-run).

## 6. Confirm the storage bucket

1. **Storage**: a public bucket named `products` now exists (created by the
   migration). Confirm it is **public** (Public bucket = enabled).
2. **Storage → Policies** on `products` should show exactly four policies:
   `public read product images` (select, anon+authenticated),
   `admin upload product images` (insert, authenticated + `is_admin()`),
   `admin update product images` (update), `admin delete product images`
   (delete). All four are also in the migration file if they need re-creating.

## 7. Deploy the static site

Deploy the repo as-is (Vercel, no build command). The site needs only:

- `CONFIG.supabaseUrl` and `CONFIG.supabaseAnonKey` in `js/config.js`
  (already set — the anon key is a publishable key, not a secret).
- No service-role key, no JWT secret, no passwords anywhere in the code.

Seller Center is `login.html` → `admin.html` and now requires the Supabase
login from step 4 plus membership in `admin_users`.

## 8. Live SQL/API checks

Run in the SQL Editor unless noted. Anon checks can be run with `curl`:

```sql
-- Exactly the 7 canonical fashion rows, with flash-sale columns:
select count(*) from public.products;                       -- expect 7
select name, price_ghs, compare_at_ghs, flash_sale
from public.products order by sort_order;                   -- prices >= 150, compare_at > price where set
select count(*) from public.products where dept <> 'fashion'; -- expect 0

-- Admin allowlist (owner only):
select * from public.admin_users;

-- No bookings table remains:
select to_regclass('public.bookings');                      -- expect null
```

Anon API checks (replace URL/key with the project's values):

```bash
curl -s "$SUPABASE_URL/rest/v1/products?select=name" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"            # 200 + 7 rows

curl -s -X POST "$SUPABASE_URL/rest/v1/orders" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"order_code":"VEL-TEST1","customer_name":"Test Buyer","phone":"0550000001","area":"Osu","items":[],"items_total":10,"delivery_fee":30,"total_ghs":40,"status":"new"}' \
  # 201 Created

curl -s "$SUPABASE_URL/rest/v1/orders?select=order_code" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"            # 401/403, no rows

curl -s -X POST "$SUPABASE_URL/rest/v1/products" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{"name":"Hack","price_ghs":1}'                                     # 401/403

curl -s -X PATCH "$SUPABASE_URL/rest/v1/orders?order_code=eq.VEL-TEST1" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY" \
  -H "Content-Type: application/json" -d '{"status":"delivered"}'        # 401/403
```

Authenticated checks (quick way: log into Seller Center in the browser and use
the failing/non-failing flows below; or mint a session token via the auth API
for a **non-admin** test user and replay the curls with that JWT — expect
401/403 on product writes and order reads/updates):

```sql
-- track_order returns the order only when BOTH code and phone match:
select order_code, status from public.track_order('VEL-TEST1', '0550000001');  -- one row
select order_code from public.track_order('VEL-TEST1', '0240000000');          -- zero rows
```

Then delete the test order as an admin (Seller Center has no delete by design):

```sql
delete from public.orders where order_code = 'VEL-TEST1';
```

## 9. Browser flows to click through

On the deployed site:

1. **Login failure**: `login.html` with a wrong password → "Wrong email or
   password." and no session.
2. **Login success**: the owner's credentials → redirected to `admin.html`,
   email shown in the header, orders/products load from the database.
3. **Non-admin denial**: sign in with a second auth user that is *not* in
   `admin_users` → "This account does not have Seller Center access." and no
   data; the user is signed out.
4. **Sign-out** button returns to `login.html`; `admin.html` then redirects
   back to `login.html` when reloaded.
5. **Session expiry**: (DevTools → Application → clear the Supabase token, or
   wait for expiry) then act in Seller Center → redirected to login.
6. **Product edit persistence**: change a price in Seller Center, reload,
   check on another device/browser — the new price shows on the storefront.
7. **Image upload**: upload a JPG in Seller Center → the product card shows
   the uploaded image; the object appears under the `products` bucket.
8. **Order status persistence**: place a test order from the storefront,
   set its status in Seller Center, reload → status persists; the
   storefront's Track order page reflects it.
9. **Storefront**: browse, add to bag, checkout (order code appears), track
   the order with code + phone; flash-sale strike-through prices and the
   countdown render on the home page.
10. **Console/network**: no 4xx/5xx beyond the intentional 401/403 tests;
    no console errors.
11. **Mobile**: check the layout on a phone-width viewport (home, product,
    checkout, Seller Center).

## 10. Rotate exposed credentials

1. The demo Seller Center password was public. Ensure no account
   anywhere uses it; the new owner password must be new.
2. **Settings → API**: confirm the publishable/anon key currently in
   `js/config.js` matches the dashboard; if anything sensitive was ever
   exposed, rotate keys there and redeploy with the new anon key.
3. Confirm no service-role key appears in the repo, the site, or logs
   (`scripts/validate.py --secrets` checks the repo locally).
