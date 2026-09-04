// Keyword vocabulary for VELLOURA clothing.
// Map from catalogue language to how people search (dress, skirt, modest). Used in:

// 1) the keywords meta tag (minor; other engines may still read it)
// 2) visible copy on category landing pages
// 3) on-site search synonym expansion in shop.js
// Google ignores the keywords meta tag. Visible title, H1 and body copy matter.

export const LOCATIONS = ["Accra", "Kumasi", "Ghana"];

export const GLOBAL_TERMS = [
  "momo",
  "mobile money",
  "valmont pay",
  "delivery Ghana",
  "delivery Accra",
  "women shop Accra"
];

export const CATEGORIES = {
  fashion: {
    slug: "fashion",
    file: "fashion.html",
    dept: "fashion",
    collection: null,
    label: "Affordable clothes",
    h1: "Affordable clothes for women in Accra",
    terms: [
      "clothes",
      "clothing",
      "dress",
      "skirt",
      "trousers",
      "pants",
      "top",
      "tee",
      "tshirt",
      "t-shirt",
      "blouse",
      "outfit",
      "wears",
      "apparel",
      "set",
      "maxi",
      "wrap"
    ],
    phrases: [
      "buy clothes in Accra",
      "cheap clothes Ghana",
      "dress price in Ghana",
      "womens wear Accra"
    ]
  },
  streetwear: {
    slug: "streetwear",
    file: "streetwear.html",
    dept: "fashion",
    collection: "streetwear",
    label: "Streetwear",
    h1: "Streetwear for women in Accra",
    terms: ["crop", "joggers", "tee", "trousers", "skirt", "casual", "everyday wear"],
    phrases: ["streetwear Accra", "buy crop top Ghana", "casual clothes Accra"]
  },
  modest: {
    slug: "modest",
    file: "modest.html",
    dept: "fashion",
    collection: "modest",
    label: "Modest wear",
    h1: "Modest wear in Accra",
    terms: ["modest", "maxi", "long dress", "covered", "set", "wrap dress"],
    phrases: ["modest wear Ghana", "maxi dress Accra", "long sleeve dress Ghana"]
  }
};

export const CATEGORY_FILES = {
  fashion: "fashion.html",
  jewelry: "shop.html",
  hair: "shop.html",
  wigs: "shop.html",
  streetwear: "streetwear.html",
  modest: "modest.html",
  thrift: "shop.html"
};

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export { slugify };

function words(value) {
  return String(value || "").toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
}

function termMatch(term, q) {
  const t = String(term || "").toLowerCase();
  if (!t || !q) return false;
  if (t === q) return true;
  if (q.length >= 3 && (t.startsWith(q) || q.startsWith(t))) return true;
  return words(t).includes(q) || words(q).includes(t);
}

export function expandQuery(raw) {
  const q = String(raw || "").trim().toLowerCase();
  if (!q) return [];
  const out = new Set([q]);
  Object.values(CATEGORIES).forEach((cat) => {
    const matched = cat.slug === q
      || cat.dept === q
      || cat.collection === q
      || termMatch(cat.label, q)
      || (cat.terms || []).some((t) => termMatch(t, q))
      || (cat.phrases || []).some((t) => termMatch(t, q) || words(t).includes(q));
    if (!matched) return;
    out.add(cat.slug);
    out.add(cat.dept);
    if (cat.collection) out.add(cat.collection);
    (cat.terms || []).forEach((t) => out.add(t.toLowerCase()));
  });
  return [...out];
}

export function matchCategories(raw) {
  const q = String(raw || "").trim().toLowerCase();
  if (!q) return [];
  return Object.keys(CATEGORIES).filter((key) => {
    const cat = CATEGORIES[key];
    if (cat.slug === q || cat.dept === q || cat.collection === q) return true;
    return (cat.terms || []).some((t) => termMatch(t, q));
  });
}

export function scoreProduct(product, raw) {
  const q = String(raw || "").trim().toLowerCase();
  if (!q) return 1;
  const name = String(product.name || "").toLowerCase();
  const blob = [
    name,
    product.description,
    product.dept,
    product.collection,
    product.badge,
    ...(product.colors || []),
    ...(product.sizes || [])
  ].filter(Boolean).join(" ").toLowerCase();

  let score = 0;
  if (name === q) score += 50;
  if (name.includes(q)) score += 20;
  if (blob.includes(q)) score += 8;

  const expanded = expandQuery(q);
  expanded.forEach((token) => {
    if (token.length < 2) return;
    if (name.includes(token)) score += 6;
    else if (blob.includes(token)) score += 3;
  });

  const cats = matchCategories(q);
  cats.forEach((key) => {
    const cat = CATEGORIES[key];
    if (product.dept === cat.dept) score += 5;
    if (cat.collection && product.collection === cat.collection) score += 8;
  });

  return score;
}
