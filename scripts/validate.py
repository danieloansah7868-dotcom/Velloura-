#!/usr/bin/env python3
"""Static regression checks for the VELLOURA repo.

Run after any change:  python3 scripts/validate.py
Covers catalog integrity, SQL/catalog parity, JS syntax, local links,
image alt text, JSON-LD, SEO invariants, sitemap/robots consistency,
secret/credential hygiene and stale-copy scans.

Live Supabase/browser checks are NOT covered — see DEPLOYMENT.md.
"""

from __future__ import annotations

import importlib.util
import json
import re
import subprocess
import sys
from html.parser import HTMLParser
from pathlib import Path

SPEC = importlib.util.spec_from_file_location(
    "build_seo", Path(__file__).resolve().parent / "build-seo.py"
)
build_seo = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(build_seo)

ROOT = build_seo.ROOT
SITE = build_seo.SITE

PASS = 0
FAIL = 0
FAILURES: list[str] = []


def check(name: str, ok: bool, detail: str = "") -> None:
    global PASS, FAIL
    if ok:
        PASS += 1
        print(f"PASS  {name}" + (f" — {detail}" if detail else ""))
    else:
        FAIL += 1
        FAILURES.append(f"{name}: {detail}")
        print(f"FAIL  {name}" + (f" — {detail}" if detail else ""))


class PageParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.title = ""
        self.description = ""
        self.canonical = ""
        self.robots = ""
        self.h1_count = 0
        self.json_ld: list[dict] = []
        self.links: list[tuple[str, str]] = []  # (kind, value)
        self._in_title = False
        self._in_ld = False
        self._ld_buffer = ""

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = (attrs.get("name") or "").lower()
            prop = (attrs.get("property") or "").lower()
            if name == "description":
                self.description = attrs.get("content", "")
            if name == "robots":
                self.robots = attrs.get("content", "")
        elif tag == "link" and attrs.get("rel") == "canonical":
            self.canonical = attrs.get("href", "")
        elif tag == "h1":
            self.h1_count += 1
        elif tag == "script" and (attrs.get("type") or "") == "application/ld+json":
            self._in_ld = True
            self._ld_buffer = ""
        if tag in ("a", "img", "script", "link"):
            if tag == "a" and attrs.get("href"):
                self.links.append(("href", attrs["href"]))
            if attrs.get("src"):
                self.links.append(("src", attrs["src"]))

    def handle_endtag(self, tag):
        if tag == "title":
            self._in_title = False
        elif tag == "script" and self._in_ld:
            self._in_ld = False
            try:
                self.json_ld.append(json.loads(self._ld_buffer))
            except json.JSONDecodeError as err:
                self.json_ld.append({"__parse_error__": str(err)})

    def handle_data(self, data):
        if self._in_title:
            self.title += data
        if self._in_ld:
            self._ld_buffer += data


def parse_page(path: Path) -> PageParser:
    parser = PageParser()
    parser.feed(path.read_text())
    return parser


def is_local(value: str) -> bool:
    return not re.match(r"^(https?:)?//|^tel:|^mailto:|^data:|^javascript:|^#", value)


def resolve(base: Path, value: str) -> Path:
    value = value.split("#")[0].split("?")[0]
    return (base.parent / value).resolve()


CODE_SUFFIXES = {".js", ".html", ".sql", ".xml", ".txt", ".py", ".css"}


def code_files():
    for path in ROOT.rglob("*"):
        if not path.is_file() or path.suffix not in CODE_SUFFIXES:
            continue
        rel = path.relative_to(ROOT)
        if any(part in {".git", "__pycache__", "node_modules"} for part in rel.parts):
            continue
        if rel.as_posix() == "scripts/validate.py":
            continue  # this scanner contains the patterns it looks for
        yield path


def strip_js_comments(text: str) -> str:
    text = re.sub(r"/\*.*?\*/", "", text, flags=re.S)
    return re.sub(r"//[^\n]*", "", text)


def main() -> None:
    print("=" * 68)
    print("1. Catalog integrity (js/catalog.js)")
    print("=" * 68)
    products = build_seo.load_products()
    check("catalog count == 7", len(products) == 7, f"{len(products)} products")
    check("unique ids", len({p["id"] for p in products}) == len(products))
    check("unique names", len({p["name"] for p in products}) == len(products))
    check("unique sort orders", len({p["sort_order"] for p in products}) == len(products))
    check("unique images", len({p["image"] for p in products}) == len(products))
    check("all dept == fashion", all(p["dept"] == "fashion" for p in products))
    check(
        "collections in {streetwear, modest}",
        all(p.get("collection") in {"streetwear", "modest"} for p in products),
    )
    check(
        "all products have sizes and colors",
        all(p.get("sizes") and p.get("colors") for p in products),
    )
    bad_price = [p["name"] for p in products if float(p["price_ghs"]) < 150]
    check("all prices >= 150", not bad_price, ", ".join(bad_price))
    bad_compare = [
        p["name"]
        for p in products
        if p.get("compare_at_ghs") is not None
        and not float(p["compare_at_ghs"]) > float(p["price_ghs"])
    ]
    check("compare_at null or > price", not bad_compare, ", ".join(bad_compare))
    missing_img = [
        p["image"] for p in products if not (ROOT / p["image"]).exists()
    ]
    check("all catalog images exist", not missing_img, ", ".join(missing_img))

    print("=" * 68)
    print("2. SQL/catalog parity")
    print("=" * 68)
    result = subprocess.run(
        [sys.executable, str(ROOT / "scripts" / "generate_catalog_seed.py"), "--check"],
        capture_output=True,
        text=True,
    )
    check("catalog-seed.sql matches catalog.js", result.returncode == 0, result.stdout.strip() or result.stderr.strip())

    migration = (ROOT / "supabase" / "migrations" / "20260909_auth_catalog_alignment.sql").read_text()
    mig_rows = {}
    row_re = re.compile(
        r"^\s*\((\d+), 'fashion', '(?:streetwear|modest)', '([^']+)', '.*?', "
        r"([\d.]+|null), ([\d.]+|null), (true|false),",
        re.M,
    )
    for m in row_re.finditer(migration):
        mig_rows[m.group(2)] = (m.group(3), m.group(4), m.group(5))
    check("migration seeds exactly 7 products", len(mig_rows) == 7, str(len(mig_rows)))
    mismatches = []
    for p in products:
        expected = (
            str(p["price_ghs"]),
            "null" if p.get("compare_at_ghs") is None else str(p["compare_at_ghs"]),
            "true" if p.get("flash_sale") is True else "false",
        )
        if mig_rows.get(p["name"]) != expected:
            mismatches.append(f"{p['name']}: db={mig_rows.get(p['name'])} catalog={expected}")
    check("migration rows match catalog.js", not mismatches, "; ".join(mismatches))

    setup_sql = (ROOT / "supabase" / "setup.sql").read_text()
    check("setup.sql has compare_at_ghs + flash_sale", "compare_at_ghs numeric" in setup_sql and "flash_sale boolean not null default false" in setup_sql)
    check("setup.sql constrains dept to fashion", "check (dept in ('fashion'))" in setup_sql)
    check("setup.sql has admin_users + is_admin()", "public.admin_users" in setup_sql and "public.is_admin()" in setup_sql)
    check("setup.sql creates products storage bucket", "'products', 'products', true" in setup_sql)
    check("no bookings table in setup.sql", "public.bookings" not in setup_sql)

    print("=" * 68)
    print("3. JavaScript syntax (node --check)")
    print("=" * 68)
    js_files = sorted((ROOT / "js").glob("*.js"))
    bad_js = []
    for js in js_files:
        proc = subprocess.run(["node", "--check", str(js)], capture_output=True, text=True)
        if proc.returncode != 0:
            bad_js.append(js.name)
    check(f"node --check all {len(js_files)} js files", not bad_js, ", ".join(bad_js))

    print("=" * 68)
    print("4. Local links, image alt text")
    print("=" * 68)
    html_files = sorted(ROOT.glob("*.html")) + sorted((ROOT / "p").glob("*.html"))
    broken = []
    empty_alt = []
    for page in html_files:
        parser = parse_page(page)
        for kind, value in parser.links:
            if kind == "href" and value.startswith("data:"):
                continue
            if not is_local(value):
                continue
            if kind == "href" and value == "":
                continue
            if not resolve(page, value).exists():
                broken.append(f"{page.relative_to(ROOT)}: {kind}={value}")
        for m in re.finditer(r"<img\b[^>]*>", page.read_text()):
            tag = m.group(0)
            alt = re.search(r'alt="([^"]*)"', tag)
            if not alt or not alt.group(1).strip():
                empty_alt.append(f"{page.relative_to(ROOT)}: {tag[:60]}")
    check("all local href/src resolve", not broken, "; ".join(broken[:6]))
    check("all images have nonempty alt", not empty_alt, "; ".join(empty_alt[:6]))
    check("no readAsDataURL remains", b"readAsDataURL" not in (ROOT / "js" / "admin.js").read_bytes())

    print("=" * 68)
    print("5. JSON-LD")
    print("=" * 68)
    parse_errors = []
    forbidden_types = []
    for page in html_files:
        parser = parse_page(page)
        for blob in parser.json_ld:
            if "__parse_error__" in blob:
                parse_errors.append(f"{page.name}: {blob['__parse_error__']}")
            text = json.dumps(blob)
            for bad in ('"@type": "FAQPage"', '"@type": "AggregateRating"', '"@type": "Review"'):
                if bad in text:
                    forbidden_types.append(f"{page.name}: {bad}")
    check("all JSON-LD parses", not parse_errors, "; ".join(parse_errors[:4]))
    check("no FAQPage/AggregateRating/Review JSON-LD", not forbidden_types, "; ".join(forbidden_types[:4]))

    catalog_by_slug = {p["slug"]: p for p in products}
    price_mismatch = []
    for page in sorted((ROOT / "p").glob("*.html")):
        parser = parse_page(page)
        slug = page.stem
        expected = catalog_by_slug.get(slug)
        if not expected:
            continue
        offer = None
        for blob in parser.json_ld:
            if blob.get("@type") == "Product":
                offer = blob.get("offers", {})
        if not offer:
            price_mismatch.append(f"{slug}: no Product/Offer JSON-LD")
            continue
        if str(offer.get("price")) != str(expected["price_ghs"]):
            price_mismatch.append(f"{slug}: ld={offer.get('price')} catalog={expected['price_ghs']}")
        want_avail = "InStock" if expected.get("in_stock", True) else "OutOfStock"
        if not str(offer.get("availability", "")).endswith(want_avail):
            price_mismatch.append(f"{slug}: availability={offer.get('availability')}")
    check("product JSON-LD price/availability matches catalog", not price_mismatch, "; ".join(price_mismatch[:4]))

    print("=" * 68)
    print("6. SEO: titles, descriptions, canonical, h1")
    print("=" * 68)
    sitemap_text = (ROOT / "sitemap.xml").read_text()
    locs = re.findall(r"<loc>(.*?)</loc>", sitemap_text)
    indexed_paths = []
    for loc in locs:
        path = "index.html" if loc.rstrip("/") == SITE else loc.replace(f"{SITE}/", "")
        indexed_paths.append(path)
    check("sitemap entries resolve to files", all((ROOT / p).exists() for p in indexed_paths),
          ", ".join(p for p in indexed_paths if not (ROOT / p).exists()))

    noindexed = set()
    for page in html_files:
        parser = parse_page(page)
        if "noindex" in parser.robots.lower():
            rel = page.relative_to(ROOT).as_posix()
            noindexed.add(rel)
    check("no noindex page in sitemap", not (set(indexed_paths) & noindexed),
          ", ".join(set(indexed_paths) & noindexed))

    titles = {}
    descriptions = {}
    h1_bad = []
    canonical_bad = []
    for path in indexed_paths:
        page = ROOT / path
        parser = parse_page(page)
        if parser.title in titles:
            h1_bad.append(f"duplicate title {parser.title!r}: {titles[parser.title]} & {path}")
        titles[parser.title] = path
        if parser.description in descriptions:
            h1_bad.append(f"duplicate description: {descriptions[parser.description]} & {path}")
        descriptions[parser.description] = path
        if parser.h1_count != 1:
            h1_bad.append(f"{path}: {parser.h1_count} h1 tags")
        expected_canonical = f"{SITE}/" if path == "index.html" else f"{SITE}/{path}"
        if parser.canonical != expected_canonical:
            canonical_bad.append(f"{path}: {parser.canonical} != {expected_canonical}")
    check("indexed pages: unique title+description, one h1", not h1_bad, "; ".join(h1_bad[:4]))
    check("self-canonicals (home = site root)", not canonical_bad, "; ".join(canonical_bad[:4]))
    robots_txt = (ROOT / "robots.txt").read_text()
    check("robots.txt references sitemap", f"Sitemap: {SITE}/sitemap.xml" in robots_txt)

    print("=" * 68)
    print("7. Copy consistency")
    print("=" * 68)
    config_js = (ROOT / "js" / "config.js").read_text()
    check("free delivery threshold is 500", "freeDeliveryThreshold: 500" in config_js)
    dr = (ROOT / "delivery-returns.html").read_text()
    check("delivery-returns says Greater Accra only", "Greater Accra only" in dr)
    check("delivery-returns keeps GHS 500 free delivery", "GHS 500" in dr)

    print("=" * 68)
    print("8. Secrets / credentials (code files; docs checked for key values)")
    print("=" * 68)
    secret_hits = []
    for path in code_files():
        text = path.read_text()
        if path.suffix == ".js":
            # ignore warning comments like "never put a service_role key here"
            text = strip_js_comments(text)
        rel = path.relative_to(ROOT).as_posix()
        for pattern, label in [
            (r"service_role", "service_role"),
            (r"SERVICE_ROLE", "SERVICE_ROLE"),
            (r"sb_secret_", "sb_secret_ key"),
            (r"eyJ[A-Za-z0-9_-]{20,}", "JWT-like literal"),
            (r"adminPassword", "adminPassword"),
            (r"adminEmail", "adminEmail"),
            (r"admin@velloura\.com", "demo admin email"),
        ]:
            if re.search(pattern, text):
                secret_hits.append(f"{rel}: {label}")
    for path in ROOT.glob("*.md"):
        text = path.read_text()
        rel = path.relative_to(ROOT).as_posix()
        for pattern, label in [
            (r"eyJ[A-Za-z0-9_-]{20,}", "JWT-like literal"),
            (r"sb_secret_", "sb_secret_ key"),
            (r"adminPassword\s*[:=]", "adminPassword assignment"),
            (r"admin@velloura\.com\s*/\s*\S+", "demo credential pair"),
        ]:
            if re.search(pattern, text):
                secret_hits.append(f"{rel}: {label}")
    check("no secrets or client credential comparisons", not secret_hits, "; ".join(secret_hits[:6]))
    check("publishable key present (expected, not a secret)", "sb_publishable_" in config_js)

    print("=" * 68)
    print("9. Stale claims (store copy: html/js/py/sql/txt/xml)")
    print("=" * 68)
    stale = []
    scan_paths = [
        p for p in code_files() if p.suffix in {".html", ".js", ".py", ".sql", ".txt", ".xml", ".css"}
    ]
    for path in scan_paths:
        text = path.read_text()
        rel = path.relative_to(ROOT).as_posix()
        if re.search(r"Kumasi", text, re.I):
            stale.append(f"{rel}: Kumasi")
        if re.search(r"nationwide|across Ghana|all of Ghana", text, re.I):
            stale.append(f"{rel}: nationwide/across-Ghana claim")
        if "0556555317" in text:
            stale.append(f"{rel}: compact visible phone 0556555317")
    check("no stale Kumasi/nationwide/compact-phone copy", not stale, "; ".join(stale[:6]))

    booking_refs = []
    for path in scan_paths:
        rel = path.relative_to(ROOT).as_posix()
        text = path.read_text()
        if rel == "supabase/migrations/20260909_auth_catalog_alignment.sql":
            continue  # the migration deliberately drops the bookings table
        if re.search(r"\bbookings?\b|placeBooking|BOOKINGS_KEY", text, re.I):
            # allow the historical phase-1 report and audit report
            if path.suffix == ".md":
                continue
            booking_refs.append(rel)
    check("no booking references in store code/schema", not booking_refs, ", ".join(booking_refs[:6]))

    orphan_assets = []
    for img in sorted((ROOT / "assets" / "products").glob("*.jpg")):
        name = img.stem
        referenced = any(name in p.read_text() for p in code_files() if p.suffix in {".html", ".js", ".sql", ".py"})
        if not referenced:
            orphan_assets.append(img.name)
    check("no orphan product images", not orphan_assets, ", ".join(orphan_assets))

    print("=" * 68)
    print("10. AI-look rules (gradient text/buttons, glass, pills, emojis, dashes)")
    print("=" * 68)
    css = (ROOT / "css" / "styles.css").read_text()
    check("no gradient text (background-clip / text-fill-color)",
          not re.search(r"background-clip|-webkit-text-fill-color|text-fill-color", css))
    check("no backdrop-filter / glass surfaces", "backdrop-filter" not in css)
    btn_rules = re.findall(r"([^{}]*\.btn[^{}]*\{[^{}]*\})", css)
    gradient_btns = [r[:40] for r in btn_rules if "gradient" in r]
    check("no gradient buttons", not gradient_btns, "; ".join(gradient_btns))
    btn_radii = [re.search(r"border-radius:\s*([^;]+);", r).group(1).strip()
                 for r in btn_rules if "border-radius" in r]
    pill_btns = [r for r in btn_radii if "999" in r or "50%" in r]
    check("primary buttons are not pills", not pill_btns, ", ".join(pill_btns))

    emoji_re = re.compile(
        "[\U0001F000-\U0001FAFF\U00002600-\U000027BF\U0001F1E6-\U0001F1FF"
        "\U00002B00-\U00002BFF\U0000FE0F\U0000200D]"
    )

    def visible_text(html: str) -> str:
        html = re.sub(r"<head\b.*?</head>", "", html, flags=re.S | re.I)
        html = re.sub(r"<(script|style|svg|noscript)\b.*?</\1>", "", html, flags=re.S | re.I)
        html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
        return re.sub(r"<[^>]+>", " ", html)

    dash_bad = []
    emoji_bad = []
    for page in html_files:
        raw = page.read_text()
        text = visible_text(raw)
        count = text.count("\u2014")
        if count > 2:
            dash_bad.append(f"{page.relative_to(ROOT)}: {count} em dashes in copy")
        for tag in re.findall(r"<h[123]\b[^>]*>(.*?)</h[123]>", raw, flags=re.S | re.I):
            plain = re.sub(r"<[^>]+>", " ", tag)
            if "\u2014" in plain:
                dash_bad.append(f"{page.relative_to(ROOT)}: em dash in heading {plain.strip()[:40]!r}")
            if emoji_re.search(plain):
                emoji_bad.append(f"{page.relative_to(ROOT)}: emoji in heading {plain.strip()[:40]!r}")
    check("max 2 em dashes per page, none in headings", not dash_bad, "; ".join(dash_bad[:5]))
    check("no emojis in headings", not emoji_bad, "; ".join(emoji_bad[:5]))

    reviews_js = (ROOT / "js" / "reviews.js").read_text()
    check("no seeded/invented reviews", "SEED" not in reviews_js)

    print("=" * 68)
    if FAIL:
        print(f"RESULT: {PASS} passed, {FAIL} FAILED")
        for failure in FAILURES:
            print(f"  - {failure}")
        raise SystemExit(1)
    print(f"RESULT: all {PASS} checks passed")


if __name__ == "__main__":
    main()
