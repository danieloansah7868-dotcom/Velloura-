// Product catalog.
// - When Supabase is configured, products are read from the public.products table.
// - When Supabase is not configured (demo mode), a matching local placeholder set is used.

import { isDemoMode } from "./config.js";
import { stringId } from "./utils.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

const LOCAL_PRODUCTS = [
  {
    id: "1",
    dept: "fashion",
    collection: "streetwear",
    name: "Brooklyn Crop Set",
    description: "A soft two-piece crop top and joggers set for easy street days.",
    price_ghs: 180,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White"],
    badge: null,
    in_stock: true,
    sort_order: 1,
    image: "assets/products/fashion-crop-set.jpg"
  },
  {
    id: "2",
    dept: "fashion",
    collection: "streetwear",
    name: "Oversized Navy Tee",
    description: "An oversized cotton tee in navy. Everyday wear, nothing extra.",
    price_ghs: 90,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Royal Navy", "White", "Black"],
    badge: null,
    in_stock: true,
    sort_order: 2,
    image: "assets/products/fashion-royal-tee.jpg"
  },
  {
    id: "3",
    dept: "fashion",
    collection: "modest",
    name: "Modest Satin Maxi Dress",
    description: "A relaxed satin maxi dress with long sleeves, made to move with you.",
    price_ghs: 260,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Emerald", "Navy", "Burgundy"],
    badge: null,
    in_stock: true,
    sort_order: 3,
    image: "assets/products/fashion-modest-maxi.jpg"
  },
  {
    id: "4",
    dept: "fashion",
    collection: "modest",
    name: "Everyday Modest Set",
    description: "A long-line top and wide trousers set. Comfortable and easy to style.",
    price_ghs: 220,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige", "Navy"],
    badge: null,
    in_stock: true,
    sort_order: 4,
    image: "assets/products/fashion-modest-set.jpg"
  },
  {
    id: "15",
    dept: "fashion",
    collection: "modest",
    name: "Ivory Wrap Dress",
    description: "A soft ivory wrap dress with a flattering tie waist. Easy to dress up or down.",
    price_ghs: 240,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory"],
    badge: null,
    in_stock: true,
    sort_order: 15,
    image: "assets/products/fashion-ivory-wrap-dress.jpg"
  },
  {
    id: "16",
    dept: "fashion",
    collection: "streetwear",
    name: "Navy Wide-Leg Trousers",
    description: "High-waist navy trousers with a relaxed wide leg. A polished streetwear staple.",
    price_ghs: 160,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Navy"],
    badge: null,
    in_stock: true,
    sort_order: 16,
    image: "assets/products/fashion-wide-leg-trousers.jpg"
  },
  {
    id: "17",
    dept: "fashion",
    collection: "streetwear",
    name: "Burgundy Pleated Skirt",
    description: "A modern burgundy pleated midi skirt with a soft movement.",
    price_ghs: 130,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Burgundy"],
    badge: null,
    in_stock: true,
    sort_order: 17,
    image: "assets/products/fashion-pleated-skirt.jpg"
  }
];

let productsCache = null;
const PRODUCTS_KEY = "velloura_products_v3";

function readStore() {
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) return null;
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data.map(normalizeProduct).filter(isClothing) : null;
  } catch (err) {
    return null;
  }
}

function writeStore(products) {
  const list = (products || []).map(normalizeProduct).filter(isClothing);
  localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  productsCache = list.map(cloneProduct);
}

function isClothing(product) {
  if (product.dept && product.dept !== "fashion") return false;
  if (product.collection === "thrift") return false;
  return true;
}

function normalizeProduct(row) {
  const sizes = Array.isArray(row.sizes) ? row.sizes : [];
  const colors = Array.isArray(row.colors) ? row.colors : [];
  const id = stringId(row.id);
  return {
    id,
    dept: row.dept,
    collection: row.collection || null,
    name: row.name,
    description: row.description || "",
    price_ghs: Number(row.price_ghs),
    sizes,
    colors,
    badge: row.badge || null,
    in_stock: row.in_stock !== false,
    sort_order: Number(row.sort_order || 0),
    image: row.image || null,
    slug: slugifyName(row.name)
  };
}

function slugifyName(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function cloneProduct(p) {
  return {
    ...p,
    sizes: [...(p.sizes || [])],
    colors: [...(p.colors || [])]
  };
}

export function getLocalProducts() {
  return LOCAL_PRODUCTS.map(normalizeProduct);
}

async function loadBaseProducts() {
  if (isDemoMode) return getLocalProducts();
  const ready = await waitForSupabase();
  if (!ready) throw new Error("Supabase JS library is not loaded.");
  const sb = getSupabaseClient();
  if (!sb) throw new Error("Supabase is not connected.");
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return (data || []).map(normalizeProduct).filter(isClothing);
}

export async function loadProducts({ force = false } = {}) {
  if (!force && productsCache) return productsCache.map(cloneProduct);

  if (!isDemoMode) {
    try {
      const remote = await loadBaseProducts();
      if (remote.length) {
        writeStore(remote);
        return remote.map(cloneProduct);
      }
    } catch (err) {
      console.error(err);
    }
    const stored = readStore();
    if (stored && stored.length) return stored.map(cloneProduct);
    const local = getLocalProducts();
    writeStore(local);
    return local.map(cloneProduct);
  }

  if (!force) {
    const stored = readStore();
    if (stored) return stored.map(cloneProduct);
  }
  const base = await loadBaseProducts();
  writeStore(base);
  return base.map(cloneProduct);
}

export function saveProduct(input) {
  const products = readStore() || getLocalProducts();
  const product = normalizeProduct({
    ...input,
    id: input.id || `p-${Date.now()}`,
    sort_order: input.sort_order || products.length + 1
  });
  const idx = products.findIndex((p) => stringId(p.id) === stringId(product.id));
  if (idx >= 0) products[idx] = { ...products[idx], ...product };
  else products.push(product);
  writeStore(products);
  return cloneProduct(product);
}

export function deleteProduct(id) {
  const products = (readStore() || getLocalProducts())
    .filter((p) => stringId(p.id) !== stringId(id));
  writeStore(products);
  return products.map(cloneProduct);
}

export async function getProduct(idValue) {
  const products = await loadProducts();
  const wanted = stringId(idValue);
  return products.find((p) => stringId(p.id) === wanted) || null;
}

export async function getProductBySlug(slug) {
  const products = await loadProducts();
  const wanted = String(slug || "");
  return products.find((p) => p.slug === wanted) || null;
}

export function relatedProducts(product, products, limit = 4) {
  if (!product) return [];
  const others = (products || []).filter((p) => (
    stringId(p.id) !== stringId(product.id) && p.in_stock !== false
  ));
  const sameCollection = others.filter((p) => (
    p.dept === product.dept && product.collection && p.collection === product.collection
  ));
  const sameDept = others.filter((p) => p.dept === product.dept);
  const seen = new Set();
  const out = [];
  sameCollection.concat(sameDept, others).forEach((p) => {
    const id = stringId(p.id);
    if (seen.has(id) || out.length >= limit) return;
    seen.add(id);
    out.push(p);
  });
  return out;
}
