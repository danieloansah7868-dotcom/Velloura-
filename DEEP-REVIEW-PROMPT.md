# Velloura — Deep Review Prompt

Copy everything below the line into a fresh AI session (or hand it to a human reviewer)
with access to this repository. It is self-contained.

---

You are performing a **deep review audit** of the Velloura e-commerce site
(`vellouragh.com`), a static-front-end + Supabase storefront for women's fashion in
Accra, Ghana. The repo root contains: static HTML pages (`index.html`, department and
type landings like `fashion.html`/`dresses.html`/`shoes.html`, ~75 `delivery-*.html`
area pages, 276 generated product pages in `p/`), `js/` (catalog data in
`js/catalog.js`, keyword data in `js/keywords.js`, cart/checkout/seller logic),
`scripts/build-seo.py` (generates all SEO pages from the data files — never edit
generated HTML by hand), `supabase/setup.sql` (schema, RLS, RPCs) and
`supabase/catalog-seed.sql` (idempotent product seed), `assets/products/` (276 product
photos), `sitemap.xml`, `robots.txt`.

Work through every section below. For each check, state PASS/FAIL/WARN with evidence
(file, line, query result). Fix nothing until the full report is written; then propose
fixes ordered by severity. Severity: **CRITICAL** (broken purchases, data loss,
security), **HIGH** (SEO damage, wrong prices/products live), **MEDIUM** (quality,
consistency), **LOW** (polish).

## 1. Catalog ↔ database parity
- Parse `LOCAL_PRODUCTS` in `js/catalog.js` (276 entries expected). Assert: no
  duplicate names, ids, sort_orders, or image paths; every `price_ghs` within 150–400
  (all prices are owner-approved placeholders pending real pricing); every entry has
  non-empty `sizes` and `colors`; `dept` = fashion; `collection` ∈
  {streetwear, modest, thrift}.
- Parse every insert in `supabase/catalog-seed.sql`. Assert: the insert-name set
  equals the catalog-name set exactly; per-name price, sort_order, and image match the
  catalog; every insert carries the `where not exists (select 1 ... where name = ...)`
  guard (seed must be re-runnable with zero duplicates); each `compare_at_ghs` update
  (flash sale) has `compare_at > price` for the same product; addendum ordering is safe
  on a FRESH database (no update may depend on a row inserted later in the file).
- Against the live database (Supabase SQL editor): `select count(*) from
  public.products;` must equal 276. Spot-check 10 random products: name, price, sizes,
  image path identical to catalog.js. Check no orphan rows (names absent from catalog).

## 2. Assets
- Every catalog image path exists on disk; every file in `assets/products/` is
  referenced (no orphans); flag any image > 400 KB or with visible watermark/text/
  price sticker (image policy: clean studio shots, garment faithful).
- Scan all HTML for `src=`/`href=` pointing at missing local files (broken links = 0
  tolerated).

## 3. SEO integrity
- Rebuild: `python3 scripts/build-seo.py` must succeed and report
  `products 276 landings 9 areas 75`; git diff after rebuild must be empty (generated
  pages are in sync with data files).
- Every indexed page: unique `<title>` and meta description, self-referencing
  canonical on `https://vellouragh.com/`, exactly one `<h1>`, valid JSON-LD (parse
  every `application/ld+json` block). No `aggregateRating`, no `review` markup, no
  fabricated stock/price/FAQ claims anywhere — structured data must mirror visible
  content only.
- `sitemap.xml`: every `<loc>` resolves to an existing file; every indexable page is
  listed; noindex pages (login, admin, cart, checkout, account, track, wishlist,
  stub redirects hair/wigs/jewelry/thrift, product.html) are absent; `robots.txt`
  references the sitemap. Sitemap must NOT be submitted to Search Console yet —
  owner is holding until the domain is live; verify no submission automation exists.
- No doorway/thin pages: every landing must show real products with real data.

## 4. Security (known open item — verify status)
- `js/auth.js` validates admin login client-side against `CONFIG.adminEmail` /
  `CONFIG.adminPassword` in `js/config.js`. This is public-source credential gating:
  assess what an attacker gains (Seller Center edits? which RPCs?), check
  `supabase/setup.sql` RLS policies and every `security definer` RPC — can the anon or
  seller key mutate `products`/orders without the client login? Report the shortest
  safe path to real auth (Supabase Auth + RLS), and confirm no credentials are
  advertised in HTML (login.html demo hint was removed — verify it stays removed).
- Confirm no service-role key appears anywhere in the repo; seller/anon keys only, and
  the rotated seller key is the one referenced.

## 5. Commerce flows (manual, in a browser)
- Home: flash-sale carousel shows only `flash_sale` items with compare-at strikethrough
  and a working midnight countdown; new-arrivals flip carousel renders; both degrade
  gracefully with JS off.
- Shop: all 9 type chips (incl. Shoes & sandals) filter correctly; size/color filters
  match data; pagination/lazy-load works with 276 items.
- Product page: sizes selectable (footwear EU 36–40, clothing S–XL), add-to-cart,
  multi-photo gallery if present, related items resolve.
- Cart → checkout: quantities persist, MoMo/card options present, delivery bands match
  `delivery-*.html` copy, order lands in Supabase (`orders` table), track page finds it.
- Seller Center (admin.html): log in, edit a product's price, confirm the change
  persists in the DB and renders on the site; confirm upload flow targets the public
  Supabase Storage bucket and yields working URLs.

## 6. Code health
- `node --check` every file in `js/`; zero console errors on index, shop, a product
  page, cart, checkout, admin (check DevTools).
- No `TODO`/`FIXME`/lorem strings; no dead code referencing removed features;
  `js/keywords.js` `productTypes()` and `scripts/build-seo.py` `product_types()` are
  exact mirrors (they must stay in step — diff their term lists branch by branch).
- Mobile pass (375px): hero, carousels, chips, product grid, checkout form usable;
  images have `alt`; tap targets ≥ 40px.

## 7. Consistency of copy
- Delivery pricing/claims identical across `delivery-*.html`, checkout, and footer;
  contact details (phone, email, socials) identical everywhere; no stale counts
  ("192 products" style claims) in any page or README.

## Deliverable
A markdown report: executive summary (≤10 lines), findings table (id, severity, area,
evidence, impact, proposed fix), then the ordered fix plan. End by re-running section 1
and 3 checks after fixes and confirming zero CRITICAL/HIGH remain.
