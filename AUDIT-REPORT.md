# Velloura — Deep Review Audit (2026-09-09)

Branch `arena/01a0863e-velloura` @ `4310319` (identical to `main`). Static analysis only — the
sandbox has **no outbound network**, so live-Supabase and in-browser checks (§1 live DB, §5 flows,
§6 DevTools, mobile pass) are listed as **NOT RUN** with the exact steps for the owner.

## Executive summary

1. **The repository does not match the brief.** The brief describes 276 products, `supabase/catalog-seed.sql`,
   75 `delivery-*.html` area pages, 9 type landings and `productTypes()`/`product_types()` mirrors.
   This checkout has **7 products**, **3 landings**, **0 area pages**, no `catalog-seed.sql`, and neither
   function. Either that work lives outside this repo/branch or the brief is ahead of the code.
2. Within the code that *is* here: 1 CRITICAL (login page still advertised admin credentials), 4 HIGH
   (generator/page drift with contradictory delivery copy, duplicate title/description, non-idempotent
   seed that disagrees with `catalog.js`, schema lacks flash-sale columns), several MEDIUM/LOW.
3. All safe code fixes have been applied on this branch; the CRITICAL and three of four HIGH items are
   closed. Remaining HIGH (schema/seed ↔ catalog parity) needs an owner decision on the live table.
4. Security posture is better than the brief fears: RLS lets anon only `select products` and
   `insert orders/bookings`; the Seller Center's product/price/order-status edits are **localStorage-only**
   and never reach the DB. So the weak client-side login exposes nothing server-side — but it also means
   Seller Center is not a real admin tool yet.
5. PASS: `node --check` all 27 JS files, no service-role/JWT secrets, no TODO/lorem, 0 broken local
   links, every `<img>` has `alt`, sitemap ↔ files ↔ noindex set fully consistent, all JSON-LD parses.

## Findings

| id | Sev | Area | Evidence | Impact | Fix | Status |
|---|---|---|---|---|---|---|
| F1 | CRITICAL | Security | `login.html:36` advertised the demo admin credentials (email + a weak password, since rotated/redacted) | Admin creds advertised publicly | Remove hint | **FIXED** |
| F2 | HIGH | SEO/copy | `build-seo.py:192` "We deliver across Ghana" vs `index.html`/`shop.html`/`delivery-returns.html` "Greater Accra only"; rebuild dirtied 10 files | Contradictory delivery claim; generated pages out of sync | Generator now says "Delivery in Greater Accra"; rebuild is clean | **FIXED** |
| F3 | HIGH | SEO | `fashion.html` title+description byte-identical to `index.html` | Cannibalisation | Unique title/description for fashion landing | **FIXED** |
| F4 | HIGH | SEO | `index.html:15` canonical `…/index.html`; sitemap lists `/index.html` | Split signals between `/` and `/index.html` | Both now `https://vellouragh.com/` | **FIXED** |
| F5 | HIGH | Catalog↔DB | `setup.sql` schema has no `compare_at_ghs`/`flash_sale`; seed has 24 rows incl. jewelry/hair/wigs, names differ from `catalog.js` ("Royal Oversized Tee" vs "Oversized Navy Tee"), no idempotency guards | With Supabase configured (it is), flash-sale strike-through/countdown cannot render from DB; seed re-run duplicates rows | Guards added to all 24 inserts. Still needed: add columns + align names (owner decision, see plan) | **PARTIAL** |
| F6 | MEDIUM | SEO | Landing pages emitted `FAQPage` JSON-LD (`build-seo.py:393`) | Brief forbids FAQ structured data | Removed from generator (visible FAQ section kept) | **FIXED** |
| F7 | MEDIUM | Catalog | Prices 90 (`Oversized Navy Tee`) and 130 (`Burgundy Pleated Skirt`) outside 150–400 band | Placeholder policy violation | Owner to set prices; not changed | OPEN |
| F8 | MEDIUM | Assets | 17 orphan images in `assets/products/` (jewelry/hair/wig/thrift) — unused by catalog or any page | Repo bloat, confusion | Delete once owner confirms those depts are gone for good | OPEN |
| F9 | MEDIUM | Seller Center | `catalog.js:134` `saveProduct` → localStorage; `store.js:225` `updateOrderStatus` → localStorage; photo "upload" is `readAsDataURL` (`admin.js:231`), no Storage bucket | Price edits don't persist to DB or other devices; §5 Seller Center check would FAIL | Real auth + RLS (plan step 3) | OPEN |
| F10 | MEDIUM | Security | `js/config.js:26-27` plaintext admin creds; `auth.js` compares client-side | Anyone can open admin UI. Gains: nothing server-side (RLS: anon = select products, insert orders/bookings, `track_order` RPC only; RPC is `security definer` but filters by code+phone) | Supabase Auth + `authenticated` RLS policies | OPEN |
| F11 | LOW | Copy | `js/keywords.js:9` `LOCATIONS` includes Kumasi; generated pages mention Kumasi (`p/*.html:156`) while delivery is Greater Accra only | Misleading | Drop Kumasi or reword to "we ship only in Greater Accra" | OPEN |
| F12 | LOW | Copy | Phone appears as `055 655 5317` (2×) and `0556555317` (1×) | Minor inconsistency | Normalise | OPEN |
| F13 | LOW | Schema | `products.dept` check still allows jewelry/hair/wigs; `bookings` table + hair booking policy remain though hair is removed | Dead schema | Tighten check to `fashion`; drop bookings if unused | OPEN |
| F14 | INFO | Scope | Brief items N/A in this repo: 276 parity, `catalog-seed.sql`, 75 area pages, 9 chips/Shoes, `productTypes()` mirror, footwear sizes | — | Point audit at the correct branch/repo | — |

## Section-by-section

**§1 Catalog ↔ DB** — `LOCAL_PRODUCTS`: 7 entries; no duplicate names/ids/sort_orders/images (PASS); all `dept=fashion`,
collections ∈ {streetwear, modest} (PASS); all have sizes+colors (PASS); 2/7 prices out of band (WARN F7); every
`compare_at_ghs > price_ghs` (PASS). Seed: name set ≠ catalog (FAIL F5); guards (now PASS); addendum ordering N/A.
Live DB: NOT RUN — owner: `select count(*), array_agg(name) from public.products;` expect 7 fashion rows, no jewelry/hair/wigs.

**§2 Assets** — all 7 catalog images exist (PASS); 17 orphans (WARN F8); no image > 400 KB (PASS); broken `src/href` = 0 (PASS).
Watermark check needs eyes — NOT RUN.

**§3 SEO** — build succeeds, `products 7 landings 3`; post-fix rebuild diff is empty (PASS). 17 indexed pages: unique
title+description (PASS after F3), self-canonical (PASS after F4), exactly one `<h1>` (PASS), JSON-LD parses (PASS),
no `aggregateRating`/`review`/`FAQPage` (PASS after F6). Product JSON-LD carries `price`/`availability` that mirror
visible price and in-stock flag (PASS). Sitemap: 17 `<loc>` all resolve; all noindex pages absent; `robots.txt` references
sitemap (PASS). No Search Console submission automation in repo (PASS).

**§4 Security** — see F1/F9/F10. No `service_role`/`eyJ…` JWT anywhere (PASS). Key in `config.js` is a `sb_publishable_…`
key (PASS); whether it is the *rotated* one can only be confirmed in the Supabase dashboard.

**§5 Commerce flows** — NOT RUN (no browser/network). Static reading: flash-sale needs `compare_at_ghs`/`flash_sale`
from DB → will not show while Supabase is configured (F5). Seller Center price edit will NOT persist to DB (F9).

**§6 Code health** — `node --check` 27/27 (PASS); no TODO/FIXME/lorem (PASS); `alt` on every `<img>` (PASS); type-mirror
check N/A (F14); DevTools/mobile NOT RUN.

**§7 Copy** — delivery: now consistent "Greater Accra" everywhere (PASS after F2); free delivery ≥ GHS 500 consistent
(PASS); WhatsApp `233556555317` ×26, Instagram `vellouragh` ×24 consistent (PASS); phone format WARN (F12); no stale
"N products" claims (PASS — "7 pieces"/"4 pieces" counts are generated from data).

## Ordered fix plan

1. ✅ Remove login hint (F1). Also change `adminPassword` before launch.
2. ✅ Generator: Greater Accra copy, unique fashion title, root canonical/sitemap, drop FAQPage; rebuild (F2, F3, F4, F6).
3. ✅ Seed idempotency guards (F5 part 1).
4. **Owner/DB (F5 part 2):** in Supabase SQL editor
   `alter table public.products add column if not exists compare_at_ghs numeric, add column if not exists flash_sale boolean not null default false;`
   then delete non-fashion rows and align the 7 names/prices/`compare_at`/`flash_sale` to `catalog.js`. Mirror the
   same in `setup.sql` and tighten the `dept` check to `fashion`.
5. **Real auth (F9/F10)** shortest path: enable Supabase Auth email provider; create the owner user; add policies
   `create policy "owner writes products" on products for all to authenticated using (auth.email() = 'owner@…') with check (…)`
   and `"owner reads/updates orders"` likewise; replace `auth.js` with `supabase.auth.signInWithPassword`; point
   `saveProduct`/`updateOrderStatus` at `.from('products').upsert` / `.from('orders').update`; create a public
   Storage bucket `products` and upload via `storage.from('products').upload`. Delete `adminEmail/adminPassword` from config.
6. Prices 90 → ≥150, 130 → ≥150 or update the placeholder policy (F7). Delete 17 orphan images (F8). Drop Kumasi (F11),
   normalise phone (F12), tidy schema (F13).

## Re-run after fixes

- §1: 7 products, no duplicates, dept/collection valid, compare_at > price — PASS; seed guards 24/24 — PASS; name parity — still FAIL (owner step 4).
- §3: `python3 scripts/build-seo.py` → `products 7 landings 3`, `git status` clean after rebuild — PASS; 17/17 pages unique title/desc, self-canonical, one h1, valid JSON-LD, no FAQ/review/rating — PASS.
- Remaining CRITICAL: **0**. Remaining HIGH: **1** (F5 schema/seed ↔ catalog parity — requires a live-DB change the sandbox cannot make).
