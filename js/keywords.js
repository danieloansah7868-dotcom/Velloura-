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

// Product-type vocabulary: the thing itself, in the words customers type.
// Each type maps to a generated landing page (<slug>.html) built by
// scripts/build-seo.py from live catalogue data, and to a search boost below.
export const TYPES = {
  dresses: {
    slug: "dresses",
    file: "dresses.html",
    label: "Dresses",
    h1: "Dresses and gowns for women in Accra",
    terms: [
      "dress", "dresses", "gown", "gowns", "maxi", "maxi dress", "midi",
      "midi dress", "wrap dress", "church dress", "sunday dress", "office dress", "office wear"
    ],
    phrases: [
      "dress price in Ghana", "buy gown in Accra", "church dress Accra",
      "office wear for women Accra", "maxi dress Ghana"
    ]
  },
  skirts: {
    slug: "skirts",
    file: "skirts.html",
    label: "Skirts",
    h1: "Skirts for women in Accra",
    terms: [
      "skirt", "skirts", "midi skirt", "pleated skirt", "pencil skirt",
      "office skirt", "glitter skirt", "office wear"
    ],
    phrases: ["buy skirt in Accra", "skirt price in Ghana", "office skirt Accra"]
  },
  sets: {
    slug: "sets",
    file: "sets.html",
    label: "Two-piece sets",
    h1: "Two-piece sets and co-ords in Accra",
    terms: [
      "set", "sets", "two-piece", "two piece", "co-ord", "coord", "co ord",
      "crop set", "modest set", "matching set"
    ],
    phrases: ["two piece set Accra", "co-ord set Ghana", "buy set wear Accra"]
  },
  tops: {
    slug: "tops",
    file: "tops.html",
    label: "Tops and tees",
    h1: "Tops, tees and blouses for women in Accra",
    terms: [
      "top", "tops", "tee", "tees", "tshirt", "t-shirt", "shirt", "shirts",
      "blouse", "crop top", "oversized tee", "office wear"
    ],
    phrases: ["buy tee in Accra", "blouse price in Ghana", "office shirt for women Accra"]
  },
  trousers: {
    slug: "trousers",
    file: "trousers.html",
    label: "Trousers",
    h1: "Trousers for women in Accra",
    terms: [
      "trousers", "trouser", "pants", "wide-leg", "wide leg", "joggers",
      "tailored pants", "office trousers", "office wear"
    ],
    phrases: ["trousers price in Ghana", "buy pants in Accra", "office trousers Accra"]
  },
  shoes: {
    slug: "shoes",
    file: "shoes.html",
    label: "Shoes & sandals",
    h1: "Shoes and sandals for women in Accra",
    terms: [
      "shoes", "sandals", "slides", "sliders", "loafers", "heels", "mules",
      "clogs", "flip flops", "flip-flops", "sneakers", "wedges", "footwear"
    ],
    phrases: [
      "sandals price in Ghana", "buy shoes in Accra", "slides for women Accra",
      "office shoes Ghana", "flat sandals Accra"
    ]
  }

};

// Derive the type(s) of a product from its own name and description, so new
// catalogue rows land on the right landing pages without extra tagging.
export function productTypes(product) {
  const text = `${product?.name || ""} ${product?.description || ""}`.toLowerCase();
  const out = [];
  const has = (...needles) => needles.some((needle) => text.includes(needle));
  if (has("sandals", "slides", "loafers", "heels", "mules", "clogs", "flip-flops", "flip flops", "sneakers", "wedges", "footwear")) out.push("shoes");
  if (has("dress", "maxi", "gown")) out.push("dresses");
  if (has("skirt")) out.push("skirts");
  if (has("set", "two-piece", "two piece", "co-ord")) out.push("sets");
  if (has("tee", "top", "blouse", "shirt")) out.push("tops");
  if (has("trouser", "pants", "jogger")) out.push("trousers");
  return out;
}

export function matchTypes(raw) {
  const q = String(raw || "").trim().toLowerCase();
  if (!q) return [];
  return Object.keys(TYPES).filter((key) => {
    const type = TYPES[key];
    if (type.slug === q) return true;
    return (type.terms || []).some((t) => termMatch(t, q));
  });
}

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
  Object.values(TYPES).forEach((type) => {
    const matched = type.slug === q
      || (type.terms || []).some((t) => termMatch(t, q))
      || (type.phrases || []).some((t) => termMatch(t, q) || words(t).includes(q));
    if (!matched) return;
    out.add(type.slug);
    (type.terms || []).forEach((t) => out.add(t.toLowerCase()));
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

  // Type synonyms ("gown" -> dresses) boost products of that type, but never
  // outrank an exact name match.
  const types = productTypes(product);
  matchTypes(q).forEach((key) => {
    if (types.includes(key)) score += 10;
  });

  return score;
}
