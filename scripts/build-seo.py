#!/usr/bin/env python3
"""Build indexable category, collection and product pages from the catalogue."""

from __future__ import annotations

import json
import re
from datetime import date
from pathlib import Path


def h(text: str) -> str:
    return (
        str(text or "")
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
    )


def attr(text: str) -> str:
    return h(text).replace('"', "&quot;")

ROOT = Path(__file__).resolve().parents[1]
SITE = "https://vellouragh.com"
TODAY = date.today().isoformat()

BAG_PATH = (
    "M18 6h-2V5c0-2.21-1.79-4-4-4S8 2.79 8 5v1H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z"
    "M10 5c0-1.1.9-2 2-2s2 .9 2 2v1h-4V5zm8 15H6V8h12v12z"
)
HEART_PATH = (
    "M12.1 21.35 10.6 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54l-1.35 1.31z"
)


def slugify(value: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", (value or "").lower()).strip("-")


def load_products() -> list[dict]:
    text = (ROOT / "js" / "catalog.js").read_text()
    start = text.index("const LOCAL_PRODUCTS = [")
    start = text.index("[", start)
    depth = 0
    end = None
    for i, ch in enumerate(text[start:], start):
        if ch == "[":
            depth += 1
        elif ch == "]":
            depth -= 1
            if depth == 0:
                end = i + 1
                break
    if end is None:
        raise RuntimeError("Could not parse LOCAL_PRODUCTS")
    block = text[start:end]
    block = re.sub(r"//.*?$", "", block, flags=re.M)
    block = re.sub(r"([{\[,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:", r'\1"\2":', block)
    products = [row for row in json.loads(block) if row.get("dept") == "fashion" and row.get("collection") != "thrift"]
    for product in products:
        product["slug"] = slugify(product["name"])
        product["price_ghs"] = int(product["price_ghs"]) if float(product["price_ghs"]).is_integer() else float(product["price_ghs"])
    return products


def money(value) -> str:
    return f"GHS {int(value)}" if float(value) == int(value) else f"GHS {value}"


# ---------------------------------------------------------------
# Vocabulary + delivery data (single source of truth lives in js/)
# ---------------------------------------------------------------

def extract_js_block(text: str, marker: str) -> str:
    start = text.index(marker)
    start = text.index("{", start)
    depth = 0
    for i, ch in enumerate(text[start:], start):
        if ch == "{":
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0:
                return text[start:i + 1]
    raise RuntimeError(f"Could not parse {marker}")


def js_to_json(block: str) -> str:
    block = re.sub(r"//.*?$", "", block, flags=re.M)
    return re.sub(r"([{,\[]\s*)([A-Za-z_][A-Za-z0-9_-]*)\s*:", r'\1"\2":', block)


def load_keywords() -> dict:
    text = (ROOT / "js" / "keywords.js").read_text()
    categories = json.loads(js_to_json(extract_js_block(text, "export const CATEGORIES =")))
    types = json.loads(js_to_json(extract_js_block(text, "export const TYPES =")))
    m = re.search(r"export const GLOBAL_TERMS = \[(.*?)\]", text, re.S)
    global_terms = json.loads("[" + m.group(1) + "]") if m else []
    return {"categories": categories, "types": types, "global_terms": global_terms}


def load_delivery() -> list[dict]:
    text = (ROOT / "js" / "delivery.js").read_text()

    def names(const: str) -> list[str]:
        m = re.search(rf"const {const} = \[(.*?)\];", text, re.S)
        return re.findall(r'"([^"]+)"', m.group(1)) if m else []

    def band(const: str) -> tuple[int, str]:
        m = re.search(rf"const {const} = \{{(.*?)\}};", text, re.S)
        fee = int(re.search(r"fee:\s*(\d+)", m.group(1)).group(1))
        days = re.search(r'days:\s*"([^"]+)"', m.group(1)).group(1)
        return fee, days

    out = []
    for const, label in (("INNER_NAMES", "inner Accra and Circle"),
                         ("NEAR_NAMES", "near Pokuase"),
                         ("FAR_NAMES", "the greater Accra ring")):
        fee, days = band(const.replace("_NAMES", ""))
        for name in names(const):
            out.append({"name": name, "fee": fee, "days": days, "band": label})
    return sorted(out, key=lambda a: a["name"])


def product_types(product: dict) -> list[str]:
    """Mirror of productTypes() in js/keywords.js — keep the two in step."""
    text = f"{product.get('name') or ''} {product.get('description') or ''}".lower()
    out = []

    def has(*needles) -> bool:
        return any(n in text for n in needles)

    if has("dress", "maxi", "gown"):
        out.append("dresses")
    if has("skirt"):
        out.append("skirts")
    if has("set", "two-piece", "two piece", "co-ord"):
        out.append("sets")
    if has("tee", "top", "blouse", "shirt"):
        out.append("tops")
    if has("trouser", "pants", "jogger"):
        out.append("trousers")
    return out


CHIP_LABEL = {
    "dresses": "Dresses",
    "skirts": "Skirts",
    "sets": "Sets",
    "tops": "Tops",
    "trousers": "Trousers",
}

TYPE_SYN = {
    "dresses": "gowns & maxi dresses",
    "skirts": "midi & office skirts",
    "sets": "two-piece & co-ord sets",
    "tops": "tees, shirts & blouses",
    "trousers": "pants & wide-leg trousers",
}


def type_footer_links(prefix: str) -> str:
    return "\n        ".join(
        f'<a href="{prefix}{t["file"]}">{CHIP_LABEL.get(slug, t["label"])}</a>'
        for slug, t in load_keywords()["types"].items()
    )


def abs_url(path: str) -> str:
    return f"{SITE}/{path.lstrip('/')}"


def img_url(path: str, prefix: str = "") -> str:
    return f"{prefix}{path}"


def filter_products(products, dept=None, collection=None):
    out = []
    for product in products:
        if dept and product.get("dept") != dept:
            continue
        if collection and product.get("collection") != collection:
            continue
        out.append(product)
    return out


LANDINGS = {
    "fashion": {
        "file": "fashion.html",
        "dept": "fashion",
        "collection": None,
        "title": "Affordable clothes for women in Accra | VELLOURA",
        "h1": "Affordable clothes for women in Accra",
        "description": "Everyday dresses, sets, tees and trousers from Accra. Honest prices. Pay with MoMo or card.",
        "keywords": "affordable clothes Accra, dress, skirt, trousers, top, tee, blouse, streetwear, modest, Ghana",
        "og_image": "assets/products/fashion-ivory-wrap-dress.jpg",
        "also": [
            ("Dresses", "fashion.html"),
            ("Streetwear", "streetwear.html"),
            ("Modest wear", "modest.html"),
            ("Shop all", "shop.html"),
        ],
        "related": [("Streetwear", "streetwear.html"), ("Modest wear", "modest.html"), ("Clothes", "fashion.html")],
        "paragraphs": [
            "VELLOURA is starting with clothes. Just affordable pieces for ordinary days in Accra: streetwear, modest sets and maxi dresses.",
            "People search for a dress, a skirt, trousers, a tee or a set. Those words are the clothes on this page. Prices are Ghana cedis and they are meant to be payable, not premium. We do not add a size we do not cut, and we do not mark a piece in stock if it is gone.",
            "Order from your phone. Pay with MoMo or card, then we confirm on WhatsApp. Delivery is GHS 20 in Accra, GHS 30 in Kumasi and GHS 40 to other regions. Orders of GHS 500 and above ship free. Ask for a fitting photo before you confirm if you want to see how a dress or set sits.",
        ],
        "faqs": [
            ("Do you have dresses and trousers in Accra?", "Yes. This page is the clothing we sell now — dresses, sets, trousers, skirts, tees and blouses. Open a piece to see sizes."),
            ("How do I pay?", "Checkout asks you to Pay now. Valmont takes MTN MoMo, Vodafone Cash, AirtelTigo or card."),
            ("What if it does not fit?", "Ask for a fitting photo on clothing before you confirm. Unworn items can be returned within 3 days."),
        ],
    },
    "streetwear": {
        "file": "streetwear.html",
        "dept": "fashion",
        "collection": "streetwear",
        "title": "Streetwear for women in Accra | VELLOURA",
        "h1": "Streetwear for women in Accra",
        "description": "Shop a crop set, oversized tee, wide-leg trousers and a pleated skirt. Everyday streetwear from Accra. Pay with MoMo or card.",
        "keywords": "streetwear, crop, joggers, tee, trousers, skirt, casual, Accra, Ghana",
        "og_image": "assets/products/fashion-crop-set.jpg",
        "also": [
            ("Crop set", "streetwear.html"),
            ("Trousers", "streetwear.html"),
            ("Modest wear", "modest.html"),
            ("All fashion", "fashion.html"),
        ],
        "related": [("Modest wear", "modest.html"), ("Fashion", "fashion.html")],
        "paragraphs": [
            "Streetwear here is the casual clothing we keep in Accra: a two-piece crop set, an oversized tee, high-waist wide-leg trousers and a burgundy pleated midi skirt. It is everyday wear, not a runway drop.",
            "If you want a crop, joggers, a tee, trousers or a casual skirt, start on this page. Modest maxi dresses are listed separately so this grid stays honest.",
            "Sizes are on each product. We can send a fitting photo before you confirm. Pay with MoMo or card. Delivery is GHS 20 in Accra, GHS 30 in Kumasi, GHS 40 elsewhere, free from GHS 500.",
            "If a crop or skirt sells out, it leaves this list. We do not keep a ghost product to look busy. Prices stay in a range you can pay — this is everyday wear, not a luxury drop.",
        ],
        "faqs": [
            ("What counts as streetwear at Velloura?", "The crop set, oversized tee, wide-leg trousers and pleated skirt on this page."),
            ("Are modest dresses here?", "No. Long modest sets and maxi dresses are on the modest wear page."),
        ],
    },
    "modest": {
        "file": "modest.html",
        "dept": "fashion",
        "collection": "modest",
        "title": "Modest wear in Accra | VELLOURA",
        "h1": "Modest wear in Accra",
        "description": "Shop a satin maxi dress, a long-line modest set and an ivory wrap dress in Accra. Pay with MoMo or card.",
        "keywords": "modest, maxi, long dress, wrap dress, modest set, Accra, Ghana",
        "og_image": "assets/products/fashion-modest-maxi.jpg",
        "also": [
            ("Maxi dress", "modest.html"),
            ("Wrap dress", "modest.html"),
            ("Streetwear", "streetwear.html"),
            ("All fashion", "fashion.html"),
        ],
        "related": [("Streetwear", "streetwear.html"), ("Fashion", "fashion.html")],
        "paragraphs": [
            "Modest wear at VELLOURA is the longer, covered clothing we stock: a long-sleeve satin maxi, a long-line top with wide trousers, and an ivory wrap dress. These are not short street sets.",
            "If you searched for a maxi, a long dress or a modest set, the three pieces below are the current list. We do not pad this page with crop tops.",
            "Ask for a fitting photo if you want to see length on a body before you pay. Pay with MoMo or card. We deliver nationwide.",
            "Returns on unworn clothing are within 3 days. Message WhatsApp first. Streetwear is listed on its own page so you are not sorting maxi dresses out of crop sets.",
        ],
        "faqs": [
            ("Do you sell maxi dresses?", "Yes. The modest satin maxi and the ivory wrap dress are on this page."),
            ("Can I return a dress?", "Unworn clothing can be returned within 3 days. Message WhatsApp before you send it back."),
        ],
    },
}


def chips_html(prefix: str, active: str) -> str:
    items = [
        ("all", "shop.html", "All"),
        ("streetwear", "streetwear.html", "Streetwear"),
        ("modest", "modest.html", "Modest"),
    ]
    bits = []
    for key, href, label in items:
        cls = "chip active" if key == active else "chip"
        bits.append(f'<a class="{cls}" href="{prefix}{href}" data-collection="{key}">{label}</a>')
    for slug, t in load_keywords()["types"].items():
        cls = "chip active" if slug == active else "chip"
        bits.append(f'<a class="{cls}" href="{prefix}{t["file"]}">{CHIP_LABEL.get(slug, t["label"])}</a>')
    return "\n        ".join(bits)


def header_footer(prefix: str, active_nav: str = "shop"):
    def nav_link(href, label, key):
        cls = ' class="active"' if active_nav == key else ""
        return f'<a href="{prefix}{href}"{cls}>{label}</a>'

    header = f'''  <div class="announce">We deliver across Ghana · Pay with MoMo or card</div>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand" href="{prefix}index.html">
        <img class="brand-logo" src="{prefix}assets/logo.png" alt="VELLOURA" width="42" height="42">
        <span class="brand-copy">
          <span class="brand-name">VELLOURA</span>
          <span class="brand-tag">Affordable clothes · Accra</span>
        </span>
      </a>
      <nav class="nav-desktop" aria-label="Main navigation">
        {nav_link("index.html", "Home", "home")}
        {nav_link("shop.html", "Shop", "shop")}
        {nav_link("about.html", "About", "about")}
        {nav_link("contact.html", "Contact", "contact")}
      </nav>
      <div class="header-actions">
        <a class="account-btn" href="{prefix}account-login.html" id="account-link">Login</a>
        <a class="icon-btn wish-btn" href="{prefix}wishlist.html" id="wishlist-link" aria-label="Saved items">
          <svg class="wish-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path fill="currentColor" d="{HEART_PATH}"/>
          </svg>
          <span class="wish-badge" id="wish-badge" hidden>0</span>
        </a>
        <button class="icon-btn bag-btn" id="open-cart" aria-label="Open shopping bag">
          <svg class="bag-icon" viewBox="0 0 24 24" width="22" height="22" aria-hidden="true">
            <path fill="currentColor" d="{BAG_PATH}"/>
          </svg>
          <span class="bag-label">Bag</span>
          <span class="cart-badge" id="cart-badge" hidden>0</span>
        </button>
      </div>
    </div>
    <form class="header-search" action="{prefix}shop.html" method="get" role="search">
      <input type="search" name="q" placeholder="Search products" aria-label="Search products" autocomplete="off">
      <button type="submit">Search</button>
    </form>
  </header>

  <nav class="mobile-nav" aria-label="Main navigation">
    {nav_link("index.html", "Home", "home")}
    {nav_link("shop.html", "Shop", "shop")}
    {nav_link("about.html", "About", "about")}
    {nav_link("contact.html", "Contact", "contact")}
  </nav>'''

    footer = f'''  <footer class="site-footer">
    <div class="footer-inner">
      <div>
        <p class="footer-brand">VELLOURA</p>
        <p>Affordable clothes from Accra, Ghana.</p>
        <div class="footer-socials">
          <a href="https://www.instagram.com/vellouragh" target="_blank" rel="noopener">Instagram</a>
          <a href="https://wa.me/233556555317" target="_blank" rel="noopener">WhatsApp</a>
        </div>
      </div>
      <div class="footer-col">
        <h4>Shop</h4>
        <a href="{prefix}shop.html">Clothes</a>
        <a href="{prefix}streetwear.html">Streetwear</a>
        <a href="{prefix}modest.html">Modest wear</a>
        {type_footer_links(prefix)}
        <a href="{prefix}wishlist.html">Saved items</a>
        <a href="{prefix}cart-view.html">View Bag</a>
        <a href="{prefix}track.html">Track order</a>
      </div>
      <div class="footer-col">
        <h4>Company</h4>
        <a href="{prefix}about.html">About Velloura</a>
        <a href="{prefix}contact.html">Contact</a>
        <a href="{prefix}terms.html">Terms</a>
        <a href="{prefix}privacy.html">Privacy</a>
        <a href="{prefix}delivery-returns.html">Delivery and Returns</a>
        <a href="{prefix}account-login.html">Customer login</a>
        <a href="{prefix}login.html">Seller login</a>
      </div>
      <div class="footer-bottom">
        <p>VELLOURA © 2026. Made with pride in Ghana.</p>
      </div>
    </div>
  </footer>

  <div class="cart-overlay" id="cart-overlay"></div>
  <aside class="cart-drawer" id="cart-drawer" aria-label="Shopping bag">
    <div class="cart-drawer-head">
      <h2>Your Bag <span id="cart-count-text"></span></h2>
      <button class="icon-btn" id="close-cart" aria-label="Close bag">Close</button>
    </div>
    <div class="cart-drawer-body" id="cart-drawer-body"></div>
  </aside>'''
    return header, footer


def page_shell(title, description, canonical, keywords, extra_head, body_attrs, main, scripts, prefix="", active_nav="shop", json_ld=None):
    header, footer = header_footer(prefix, active_nav)
    ld = ""
    if json_ld:
        blobs = json_ld if isinstance(json_ld, list) else [json_ld]
        ld = "\n".join(
            f'  <script type="application/ld+json">\n{json.dumps(blob, ensure_ascii=False, indent=2)}\n  </script>'
            for blob in blobs
        )
    og_image = extra_head.get("og_image", "assets/logo.png")
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{h(title)}</title>
  <meta name="description" content="{h(description)}">
  <meta name="keywords" content="{h(keywords)}">
  <link rel="canonical" href="{h(canonical)}">
  <meta property="og:type" content="{extra_head.get("og_type", "website")}">
  <meta property="og:title" content="{h(title)}">
  <meta property="og:description" content="{h(description)}">
  <meta property="og:url" content="{h(canonical)}">
  <meta property="og:image" content="{h(abs_url(og_image))}">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="icon" type="image/png" href="{prefix}assets/favicon.png">
  <link rel="apple-touch-icon" href="{prefix}assets/apple-touch-icon.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="{prefix}css/styles.css">
  <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2" defer></script>
{ld}
</head>
<body{body_attrs}>
{header}

  <main>
    <div id="page-notice" class="notice-box" hidden></div>
{main}
  </main>

{footer}

  <script src="{prefix}js/ui.js" defer></script>
  {scripts}
</body>
</html>
'''


def landing_html(key: str, products: list[dict]) -> str:
    meta = LANDINGS[key]
    if meta.get("types"):
        items = [p for p in products if meta["types"] in product_types(p) and p.get("in_stock", True)]
    else:
        items = filter_products(products, meta["dept"], meta["collection"])
    prices = [p["price_ghs"] for p in items] or [0]
    prefix = ""
    chips_active = meta["collection"] or meta["dept"]
    if meta["collection"]:
        chips_active = "fashion"
    product_lis = "\n        ".join(
        f'<li><a href="p/{h(p["slug"])}.html">{h(p["name"])}</a><span>{money(p["price_ghs"])}</span></li>'
        for p in items
    )
    paras = "\n      ".join(f"<p>{h(p)}</p>" for p in meta["paragraphs"])
    also = "".join(f'<a href="{href}">{h(label)}</a>' for label, href in meta["also"])
    related = "".join(f'<a class="chip" href="{href}">{h(label)}</a>' for label, href in meta["related"])
    faqs = "\n      ".join(
        f"<details><summary>{h(q)}</summary><p>{h(a)}</p></details>"
        for q, a in meta["faqs"]
    )
    body_attrs = f' data-default-dept="{meta["dept"]}"'
    if meta["collection"]:
        body_attrs += f' data-default-collection="{meta["collection"]}"'
    if meta.get("types"):
        body_attrs += f' data-default-type="{meta["types"]}"'
        chips_active = meta["types"]
    range_text = f"{money(min(prices))}–{money(max(prices))}" if items else "see product pages"
    json_ld = [
        {
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": meta["h1"],
            "description": meta["description"],
            "url": abs_url(meta["file"]),
            "isPartOf": {"@type": "WebSite", "name": "VELLOURA", "url": SITE},
        },
        {
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": meta["h1"],
            "numberOfItems": len(items),
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": i + 1,
                    "url": abs_url(f'p/{p["slug"]}.html'),
                    "name": p["name"],
                }
                for i, p in enumerate(items)
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": abs_url("index.html")},
                {"@type": "ListItem", "position": 2, "name": "Shop", "item": abs_url("shop.html")},
                {"@type": "ListItem", "position": 3, "name": meta["h1"], "item": abs_url(meta["file"])},
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in meta["faqs"]
            ],
        },
    ]
    main = f'''    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span>/</span>
      <a href="shop.html">Shop</a>
      <span>/</span>
      <span>{h(meta["h1"])}</span>
    </nav>

    <section class="page-intro">
      <h1>{h(meta["h1"])}</h1>
      <p>{len(items)} piece{"s" if len(items) != 1 else ""} · {range_text} · Accra, Ghana</p>
    </section>

    <section class="seo-copy">
      {paras}
      <p class="choice-label">Also searched as</p>
      <div class="also-searched">{also}</div>
      <p class="choice-label">Pieces on this page</p>
      <ul class="seo-product-list">
        {product_lis}
      </ul>
      <div class="related-cats">{related}</div>
    </section>

    <section class="section">
      <div class="choice-group" id="dept-chips">
        {chips_html(prefix, meta["collection"] or "all")}
      </div>
    </section>

    <section class="section">
      <div class="shop-toolbar">
        <p class="muted" id="result-count"></p>
        <label class="sort-label">
          <span class="visually-hidden">Sort</span>
          <select id="shop-sort">
            <option value="new">Newest</option>
            <option value="price-asc">Price: low to high</option>
            <option value="price-desc">Price: high to low</option>
          </select>
        </label>
      </div>
      <div class="product-grid" id="shop-grid">
        <p class="loading-note">Loading products...</p>
      </div>
    </section>

    <section class="section seo-faq">
      <h2>Questions</h2>
      {faqs}
    </section>'''
    return page_shell(
        meta["title"],
        meta["description"],
        abs_url(meta["file"]),
        meta["keywords"],
        {"og_image": meta["og_image"]},
        body_attrs,
        main,
        '<script type="module" src="js/shop.js"></script>',
        json_ld=json_ld,
    )


DEPT_COPY = {
    "fashion": "This is clothing from VELLOURA in Accra — everyday pieces at prices you can pay. Sizes on this page are the sizes we cut. Ask for a fitting photo on WhatsApp before you confirm if you want to see how it sits.",
}

CAT_FILE = {
    "fashion": "fashion.html",
    "streetwear": "streetwear.html",
    "modest": "modest.html",
}


def product_extra(product: dict) -> str:
    bits = [DEPT_COPY.get(product["dept"], "A piece from VELLOURA in Accra.")]
    if product.get("collection") == "modest":
        bits.append("This sits on the modest wear rail — longer, covered clothing, not a crop set.")
    if product.get("collection") == "streetwear":
        bits.append("This is everyday streetwear: casual clothes for ordinary days.")
    bits.append("Pay with MoMo or card (MoMo or card). Delivery is GHS 20 in Accra, GHS 30 in Kumasi and GHS 40 to other regions. Orders of GHS 500 and above ship free.")
    return " ".join(bits)


def product_html(product: dict, siblings: list[dict]) -> str:
    prefix = "../"
    slug = product["slug"]
    cat = CAT_FILE.get(product.get("collection") or product["dept"], "shop.html")
    title = f"{product['name']} in Accra | VELLOURA"
    desc = f"{product['name']} — {money(product['price_ghs'])}. {product.get('description') or ''} Shop VELLOURA in Accra.".strip()
    desc = desc[:160]
    sizes = ", ".join(product.get("sizes") or []) or "One size as shown"
    colors = ", ".join(product.get("colors") or []) or "As shown"
    extra = product_extra(product)
    related = [p for p in siblings if p["slug"] != slug][:4]
    related_lis = "\n        ".join(
        f'<li><a href="{h(p["slug"])}.html">{h(p["name"])}</a><span>{money(p["price_ghs"])}</span></li>'
        for p in related
    ) or "<li>See the category page for more pieces.</li>"
    availability = "https://schema.org/InStock" if product.get("in_stock", True) else "https://schema.org/OutOfStock"
    json_ld = [
        {
            "@context": "https://schema.org",
            "@type": "Product",
            "name": product["name"],
            "description": product.get("description") or product["name"],
            "image": abs_url(product["image"]),
            "sku": str(product["id"]),
            "brand": {"@type": "Brand", "name": "VELLOURA"},
            "offers": {
                "@type": "Offer",
                "url": abs_url(f"p/{slug}.html"),
                "priceCurrency": "GHS",
                "price": str(product["price_ghs"]),
                "availability": availability,
                "seller": {"@type": "Organization", "name": "VELLOURA"},
            },
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": abs_url("index.html")},
                {"@type": "ListItem", "position": 2, "name": "Shop", "item": abs_url("shop.html")},
                {"@type": "ListItem", "position": 3, "name": product["dept"].title(), "item": abs_url(cat)},
                {"@type": "ListItem", "position": 4, "name": product["name"], "item": abs_url(f"p/{slug}.html")},
            ],
        },
    ]
    keywords = f"{product['name']}, {product['dept']}, Accra, Ghana, {product.get('collection') or ''}".strip(", ")
    main = f'''    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="{prefix}index.html">Home</a>
      <span>/</span>
      <a href="{prefix}shop.html">Shop</a>
      <span>/</span>
      <a href="{prefix}{cat}">{h(product["dept"].title())}</a>
      <span>/</span>
      <span>{h(product["name"])}</span>
    </nav>
    <a class="back-link" href="{prefix}{cat}">← Back to {h(product["dept"])}</a>

    <div id="product-detail" class="product-detail">
      <div class="product-media">
        <img src="{prefix}{h(product["image"])}" alt="{h(product["name"])}">
      </div>
      <div class="product-info">
        <span class="eyebrow">{h(product["dept"])}</span>
        <h1>{h(product["name"])}</h1>
        <p class="price-big">{money(product["price_ghs"])}</p>
        <p>{h(product.get("description") or "")}</p>
        <p>Sizes: {h(sizes)}. Colour: {h(colors)}.</p>
        <p>{"In stock" if product.get("in_stock", True) else "Sold out"} in Accra.</p>
      </div>
    </div>

    <section class="seo-copy">
      <p>{h(extra)}</p>
      <p><a href="{prefix}{cat}">See more {h(product["dept"])}</a> · <a href="{prefix}contact.html">Contact</a> · <a href="{prefix}delivery-returns.html">Delivery and returns</a></p>
      <p class="choice-label">Similar pieces</p>
      <ul class="seo-product-list">
        {related_lis}
      </ul>
    </section>

    <section class="section product-extra" id="reviews-wrap"></section>
    <section class="section product-extra">
      <div class="section-head">
        <h2>You may also like</h2>
      </div>
      <div class="product-grid" id="related-grid"></div>
    </section>'''
    sticky = f'''  <div id="sticky-bar" class="sticky-bar hidden">
    <span class="sticky-bar-price" id="sticky-price"></span>
    <button class="btn btn-primary" id="add-to-bag-sticky">Add to bag</button>
  </div>
'''
    html = page_shell(
        title,
        desc,
        abs_url(f"p/{slug}.html"),
        keywords,
        {"og_image": product["image"], "og_type": "product"},
        f' data-product-slug="{h(slug)}"',
        main,
        f'<script type="module" src="{prefix}js/product.js"></script>',
        prefix=prefix,
        json_ld=json_ld,
    )
    html = html.replace("</main>", sticky + "  </main>")
    return html


def write_robots():
    (ROOT / "robots.txt").write_text(
        f"""User-agent: *
Allow: /
Disallow: /admin.html
Disallow: /login.html
Disallow: /account.html
Disallow: /account-login.html
Disallow: /checkout.html
Disallow: /cart-view.html
Disallow: /wishlist.html
Disallow: /track.html
Disallow: /product.html
Disallow: /jewelry.html
Disallow: /hair.html
Disallow: /wigs.html
Disallow: /thrift.html

Sitemap: {SITE}/sitemap.xml
"""
    )


def type_meta(slug: str, t: dict, items: list[dict], kw: dict) -> dict:
    """Landing-page metadata for one product type, from live catalogue data."""
    prices = [p["price_ghs"] for p in items]
    sizes = sorted({s for p in items for s in (p.get("sizes") or [])})
    terms = list(t.get("terms", []))
    names_prices = ", ".join(f"{p['name']} ({money(p['price_ghs'])})" for p in items[:5])
    sizes_sentence = ", ".join(sizes) if sizes else "one size as shown"
    also_line = ", ".join(terms[:8])
    bands = load_delivery()
    inner = next(a for a in bands if a["band"].startswith("inner"))
    near = next(a for a in bands if a["band"].startswith("near"))
    far = next(a for a in bands if a["band"].startswith("the greater"))
    others = [(CHIP_LABEL.get(s, tt["label"]), tt["file"]) for s, tt in kw["types"].items() if s != slug]
    desc = (
        f"{len(items)} {t['label'].lower()} in stock in Accra, {money(min(prices))} to {money(max(prices))}. "
        f"Also searched as {', '.join(terms[:3])}. Pay with MoMo or card."
    )[:160]
    return {
        "file": f"{slug}.html",
        "dept": "fashion",
        "collection": None,
        "types": slug,
        "title": f"{t['label']} in Accra — buy {TYPE_SYN[slug]} | from {money(min(prices))}",
        "h1": t["h1"],
        "description": desc,
        "keywords": ", ".join(terms + t.get("phrases", []) + kw["global_terms"]),
        "og_image": items[0]["image"] if items and items[0].get("image") else "assets/logo.png",
        "also": others + [("All clothes", "fashion.html")],
        "related": [
            ("Streetwear", "streetwear.html"),
            ("Modest wear", "modest.html"),
            ("Shop all", "shop.html"),
        ],
        "paragraphs": [
            f"We keep {len(items)} {t['label'].lower()} on this rail right now: {names_prices}. When a piece sells out it leaves this page, so what you see is what we can send out in Accra today.",
            f"Customers type many words for the same rail — {also_line}. However you search, the pieces are the same, in sizes {sizes_sentence}. Prices run {money(min(prices))} to {money(max(prices))}, in Ghana cedis, meant to be payable rather than premium.",
            f"Delivery is GHS {inner['fee']} across inner Accra, GHS {near['fee']} near Pokuase and GHS {far['fee']} on the greater Accra ring, free on orders of GHS 500 and above. Pay with MoMo or card at checkout; we confirm every order on WhatsApp and can send a fitting photo before you confirm.",
        ],
        "faqs": [
            (
                f"How much do {t['label'].lower()} cost in Accra?",
                f"Right now {money(min(prices))} to {money(max(prices))}. The price on each piece is the price you pay — no hidden additions at checkout.",
            ),
            (
                f"What sizes are the {t['label'].lower()}?",
                f"This rail currently runs {sizes_sentence}. Each product page lists the exact sizes we cut for that piece, and we can send a fitting photo on request.",
            ),
            (
                f"Do you deliver {t['label'].lower()} outside Accra?",
                "We deliver across Greater Accra and send to Kumasi and other regions. Delivery fees show at checkout before you pay, and orders of GHS 500 and above ship free.",
            ),
        ],
    }


def area_html(area: dict, products: list[dict], kw: dict, areas: list[dict]) -> str:
    """One indexable delivery-coverage page per real delivery area."""
    name = area["name"]
    slug = slugify(name)
    file = f"delivery-{slug}.html"
    fee_text = "Free" if area["fee"] == 0 else money(area["fee"])
    prices = [p["price_ghs"] for p in products] or [0]
    siblings = [a for a in areas if a["band"] == area["band"] and a["name"] != name][:6]
    sib_links = ", ".join(
        f'<a href="delivery-{slugify(a["name"])}.html">{h(a["name"])}</a>' for a in siblings
    ) or "See the checkout area list for the full coverage map."
    type_links = ", ".join(
        f'<a href="{t["file"]}">{CHIP_LABEL.get(s, t["label"]).lower()}</a>'
        for s, t in kw["types"].items()
    )
    title = f"Clothes delivery to {name}, Accra — {area['days']}, {fee_text} | VELLOURA"
    desc = (
        f"VELLOURA delivers dresses, sets, skirts and tees to {name} in {area['days']} for {fee_text} "
        f"delivery — free on orders of GHS 500 and above. Pay with MoMo or card."
    )[:160]
    keywords = f"clothes delivery {name}, delivery fee {name}, {name} Accra, " + ", ".join(kw["global_terms"])
    faqs = [
        (
            f"How much is delivery to {name}?",
            f"{fee_text} per order, and free when your order totals GHS 500 or above.",
        ),
        (
            f"How long does delivery to {name} take?",
            f"{area['days']} from confirmation. We confirm every order on WhatsApp before the rider leaves.",
        ),
        (
            f"Can I pay cash on delivery in {name}?",
            "Checkout takes payment now — MTN MoMo, Vodafone Cash, AirtelTigo Money or card through Valmont. We confirm on WhatsApp before dispatch, and you can ask for a fitting photo first.",
        ),
    ]
    json_ld = [
        {
            "@context": "https://schema.org",
            "@type": "Service",
            "name": f"Clothes delivery to {name}, Accra",
            "serviceType": "Clothing delivery",
            "areaServed": {"@type": "Place", "name": f"{name}, Greater Accra, Ghana"},
            "provider": {"@type": "Organization", "name": "VELLOURA", "url": SITE},
            "offers": {"@type": "Offer", "price": str(area["fee"]), "priceCurrency": "GHS"},
            "url": abs_url(file),
        },
        {
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
                {"@type": "ListItem", "position": 1, "name": "Home", "item": abs_url("index.html")},
                {"@type": "ListItem", "position": 2, "name": "Shop", "item": abs_url("shop.html")},
                {"@type": "ListItem", "position": 3, "name": f"Delivery to {name}", "item": abs_url(file)},
            ],
        },
        {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            "mainEntity": [
                {"@type": "Question", "name": q, "acceptedAnswer": {"@type": "Answer", "text": a}}
                for q, a in faqs
            ],
        },
    ]
    faq_html = "\n      ".join(f"<details><summary>{h(q)}</summary><p>{h(a)}</p></details>" for q, a in faqs)
    rail_chips = "".join(
        f'<a class="chip" href="{t["file"]}">{CHIP_LABEL.get(s, t["label"])}</a>'
        for s, t in kw["types"].items()
    ) + '<a class="chip" href="shop.html">All</a>'
    main = f'''    <nav class="breadcrumb" aria-label="Breadcrumb">
      <a href="index.html">Home</a>
      <span>/</span>
      <a href="shop.html">Shop</a>
      <span>/</span>
      <span>Delivery to {h(name)}</span>
    </nav>

    <section class="page-intro">
      <h1>Clothes delivery to {h(name)}, Accra</h1>
      <p>{h(area['days'])} · {h(fee_text)} delivery · free from GHS 500</p>
    </section>

    <section class="seo-copy">
      <p>Yes — we deliver to {h(name)}. {h(name)} sits in our {h(area['band'])} zone, so delivery is {h(fee_text)} per order and takes {h(area['days'])} once we confirm on WhatsApp. Orders of GHS 500 and above deliver free, anywhere in Greater Accra.</p>
      <p>Everything in the shop can come to {h(name)}: {type_links} and the full rail of {len(products)} pieces, most priced between {money(min(prices))} and {money(max(prices))}. Open any piece for sizes, colours and photos before you order.</p>
      <p>Ordering takes a minute: add your pieces, pick {h(name)} as your area at checkout, then Pay with MTN MoMo, Vodafone Cash, AirtelTigo Money or card. We confirm on WhatsApp before the rider leaves, and we can send a fitting photo first if you want to see how a piece sits.</p>
      <p class="choice-label">Other areas in the {h(area['band'])} zone</p>
      <p>{sib_links}</p>
      <p class="choice-label">Shop the rails</p>
      <div class="related-cats">{rail_chips}</div>
    </section>

    <section class="section seo-faq">
      <h2>Questions</h2>
      {faq_html}
    </section>'''
    return page_shell(
        title,
        desc,
        abs_url(file),
        keywords,
        {"og_image": "assets/logo.png"},
        "",
        main,
        '<script src="js/ui.js" defer></script>',
        json_ld=json_ld,
    )


def patch_footer_type_links():
    links = load_keywords()["types"]
    skip = {"admin.html", "login.html"}
    for path in ROOT.glob("*.html"):
        if path.name in skip:
            continue
        text = path.read_text()
        changed = False
        for pre in ("", "../"):
            anchor = f'<a href="{pre}modest.html">Modest wear</a>'
            if anchor in text and f"{pre}dresses.html" not in text:
                add = "\n        ".join(
                    f'<a href="{pre}{t["file"]}">{CHIP_LABEL.get(slug, t["label"])}</a>'
                    for slug, t in links.items()
                )
                text = text.replace(anchor, anchor + "\n        " + add, 1)
                changed = True
        if changed:
            path.write_text(text)


def write_sitemap(paths: list[str], priorities: dict[str, str] | None = None):
    priorities = priorities or {}
    urls = []
    for path in paths:
        loc = abs_url(path)
        priority = priorities.get(path) or (
            "1.0" if path == "index.html" else "0.8" if path.endswith(".html") and "/" not in path else "0.6"
        )
        urls.append(
            f"""  <url>
    <loc>{h(loc)}</loc>
    <lastmod>{TODAY}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>{priority}</priority>
  </url>"""
        )
    (ROOT / "sitemap.xml").write_text(
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        + "\n".join(urls)
        + "\n</urlset>\n"
    )


def patch_existing_html():
    replacements = {
        "shop.html?dept=fashion": "fashion.html",
        "shop.html?dept=jewelry": "shop.html",
        "shop.html?dept=hair": "shop.html",
        "shop.html?dept=wigs": "shop.html",
    }
    skip = {"admin.html", "login.html"}
    for path in ROOT.glob("*.html"):
        if path.name in skip:
            continue
        text = path.read_text()
        original = text
        for old, new in replacements.items():
            text = text.replace(old, new)
        if text != original:
            path.write_text(text)

    noindex_follow = ["product.html", "cart-view.html", "wishlist.html", "track.html", "checkout.html"]
    noindex_nofollow = ["admin.html", "login.html", "account.html", "account-login.html"]
    for name in noindex_follow:
        inject_robots_meta(ROOT / name, "noindex, follow")
    for name in noindex_nofollow:
        inject_robots_meta(ROOT / name, "noindex, nofollow")


def inject_robots_meta(path: Path, content: str):
    if not path.exists():
        return
    text = path.read_text()
    if 'name="robots"' in text:
        text = re.sub(r'<meta name="robots" content="[^"]*">', f'<meta name="robots" content="{content}">', text)
    else:
        text = text.replace(
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            f'  <meta name="robots" content="{content}">',
            1,
        )
    path.write_text(text)


def inject_head(path: Path, canonical: str, title: str | None = None, description: str | None = None, keywords: str | None = None, json_ld=None):
    if not path.exists():
        return
    text = path.read_text()
    if title:
        text = re.sub(r"<title>.*?</title>", f"<title>{h(title)}</title>", text, count=1, flags=re.S)
    if description and 'name="description"' in text:
        text = re.sub(
            r'<meta name="description" content="[^"]*">',
            f'<meta name="description" content="{h(description)}">',
            text,
            count=1,
        )
    extras = []
    if 'rel="canonical"' not in text:
        extras.append(f'  <link rel="canonical" href="{h(canonical)}">')
    if keywords and 'name="keywords"' not in text:
        extras.append(f'  <meta name="keywords" content="{h(keywords)}">')
    if json_ld and "application/ld+json" not in text:
        extras.append(
            '  <script type="application/ld+json">\n'
            + json.dumps(json_ld, ensure_ascii=False, indent=2)
            + "\n  </script>"
        )
    if extras:
        text = text.replace("</head>", "\n".join(extras) + "\n</head>", 1)
    path.write_text(text)


def update_shop_chips():
    path = ROOT / "shop.html"
    text = path.read_text()
    new = f'''      <div class="choice-group" id="dept-chips">
        {chips_html("", "all")}
      </div>'''
    text = re.sub(
        r'<div class="choice-group" id="dept-chips">.*?</div>',
        lambda m: new,
        text,
        count=1,
        flags=re.S,
    )
    path.write_text(text)


def main():
    products = load_products()
    kw = load_keywords()
    areas = load_delivery()

    # Keyword meta comes from the vocabulary module, not hardcoded strings.
    for key, meta in LANDINGS.items():
        cat = kw["categories"].get(key)
        if cat:
            meta["keywords"] = ", ".join(
                cat.get("terms", []) + cat.get("phrases", []) + kw["global_terms"]
            )

    # One landing page per product type that actually has stock.
    for slug, t in kw["types"].items():
        items = [p for p in products if slug in product_types(p) and p.get("in_stock", True)]
        if items:
            LANDINGS[f"type-{slug}"] = type_meta(slug, t, items, kw)

    out_files = []
    for key in LANDINGS:
        html = landing_html(key, products)
        dest = ROOT / LANDINGS[key]["file"]
        dest.write_text(html)
        out_files.append(LANDINGS[key]["file"])
        print("wrote", dest.name)

    # One coverage page per real delivery area (live fee + days).
    area_files = []
    for area in areas:
        file = f"delivery-{slugify(area['name'])}.html"
        (ROOT / file).write_text(area_html(area, products, kw, areas))
        area_files.append(file)
    print("wrote", len(area_files), "delivery area pages")

    pdir = ROOT / "p"
    pdir.mkdir(exist_ok=True)
    for old in pdir.glob("*.html"):
        old.unlink()
    for product in products:
        siblings = [p for p in products if p["dept"] == product["dept"]]
        html = product_html(product, siblings)
        dest = pdir / f"{product['slug']}.html"
        dest.write_text(html)
        out_files.append(f"p/{product['slug']}.html")
        print("wrote", dest.relative_to(ROOT))

    patch_existing_html()
    patch_footer_type_links()
    update_shop_chips()

    inject_head(
        ROOT / "index.html",
        abs_url("index.html"),
        title="Affordable clothes for women in Accra | VELLOURA",
        description="Everyday dresses, gowns, two-piece sets, skirts, tees and trousers from Accra. Honest prices. Pay with MoMo or card.",
        keywords="affordable clothes Accra, dress Ghana, gown, two-piece set, skirt, trousers, streetwear, modest wear, VELLOURA",
        json_ld={
            "@context": "https://schema.org",
            "@type": "ClothingStore",
            "name": "VELLOURA",
            "url": SITE,
            "image": abs_url("assets/logo.png"),
            "telephone": "+233556555317",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Accra",
                "addressCountry": "GH",
            },
            "areaServed": ["Accra", "Kumasi", "Ghana"],
            "sameAs": ["https://www.instagram.com/vellouragh"],
        },
    )
    inject_head(
        ROOT / "shop.html",
        abs_url("shop.html"),
        title="Shop affordable clothes in Accra | VELLOURA",
        description="Browse VELLOURA clothes in Accra — streetwear and modest wear. Pay with MoMo or card.",
        keywords="shop Accra, clothes, dress, streetwear, modest, VELLOURA",
        json_ld={
            "@context": "https://schema.org",
            "@type": "CollectionPage",
            "name": "Shop VELLOURA",
            "url": abs_url("shop.html"),
        },
    )
    inject_head(ROOT / "about.html", abs_url("about.html"), keywords="VELLOURA, Accra, Ghana, women's brand")
    inject_head(ROOT / "contact.html", abs_url("contact.html"), keywords="VELLOURA contact, WhatsApp Accra, 0556555317")
    inject_head(ROOT / "delivery-returns.html", abs_url("delivery-returns.html"))
    inject_head(ROOT / "terms.html", abs_url("terms.html"))
    inject_head(ROOT / "privacy.html", abs_url("privacy.html"))

    static_pages = [
        "index.html",
        "shop.html",
        "about.html",
        "contact.html",
        "delivery-returns.html",
        "terms.html",
        "privacy.html",
    ]
    write_robots()
    write_sitemap(
        static_pages
        + [LANDINGS[k]["file"] for k in LANDINGS]
        + area_files
        + [f"p/{p['slug']}.html" for p in products],
        priorities={f: "0.7" for f in area_files},
    )
    print("wrote robots.txt and sitemap.xml")
    print("products", len(products), "landings", len(LANDINGS), "areas", len(area_files))


if __name__ == "__main__":
    main()
