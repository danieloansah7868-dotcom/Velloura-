// Product catalog.
// - When Supabase is configured, products are read from the public.products table.
// - When Supabase is not configured (demo mode), a matching local placeholder set is used.

import { CONFIG, isDemoMode } from "./config.js";
import { stringId } from "./utils.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

const LOCAL_PRODUCTS = [
  // Real stock only. No placeholder products ship with the site any more;
  // photos arrive through Seller Center (Supabase Storage) or assets/products/.
  {
    id: "30",
    dept: "fashion",
    collection: "streetwear",
    name: "Olive Dotted Fringe Two-Piece Set",
    description: "A ribbed olive two-piece with tiny white dots: an easy round-neck top and a fringe-cut mini skirt that moves when you do.",
    price_ghs: 220,
    sizes: ["S", "M", "L"],
    colors: ["Olive"],
    badge: "New",
    in_stock: true,
    sort_order: 30,
    image: ""
  },
  {
    id: "31",
    dept: "fashion",
    collection: "streetwear",
    name: "Striped Tee & Sparkle Skirt Set",
    description: "A white tee with fine black stripes and a fringed neckline, paired with a black sparkle pencil skirt for day-to-night.",
    price_ghs: 190,
    sizes: ["S", "M", "L"],
    colors: ["Black / White"],
    badge: "New",
    in_stock: true,
    sort_order: 31,
    image: ""
  },
  {
    id: "32",
    dept: "fashion",
    collection: "modest",
    name: "Coral Floral Belted Maxi Dress",
    description: "A breezy white maxi covered in coral florals, with a matching self-tie belt and a soft pleated skirt with a front split.",
    price_ghs: 240,
    sizes: ["M", "L", "XL"],
    colors: ["Coral"],
    badge: "New",
    in_stock: true,
    sort_order: 32,
    image: ""
  },
  {
    id: "33",
    dept: "fashion",
    collection: "streetwear",
    name: "Turquoise Stripe Applique Midi Dress",
    description: "A ribbed sleeveless midi in bold turquoise and white stripes, with pearl flower appliques and a keyhole neckline.",
    price_ghs: 210,
    sizes: ["S", "M", "L"],
    colors: ["Turquoise"],
    badge: "New",
    in_stock: true,
    sort_order: 33,
    image: ""
  }
];

let productsCache = null;
const PRODUCTS_KEY = "velloura_products_v4";

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
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(list));
  } catch (err) {
    if (err && (err.name === "QuotaExceededError" || err.code === 22 || err.code === 1014)) {
      throw new Error("Browser storage is full. Remove a photo, or connect Supabase so photos are hosted instead.");
    }
    throw err;
  }
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
  // blob: URLs are edit-session previews only — never persist them.
  const images = (Array.isArray(row.images) ? row.images : [])
    .map((src) => String(src || "").trim())
    .filter((src) => src && !src.startsWith("blob:"));
  const coverImage = String(row.image || "").trim();
  const cover = (coverImage.startsWith("blob:") ? "" : coverImage) || images[0] || null;
  const allImages = cover
    ? [cover, ...images.filter((src) => src !== cover)]
    : images;
  const was = row.compare_at_ghs;
  return {
    id,
    dept: row.dept,
    collection: row.collection || null,
    name: row.name,
    description: row.description || "",
    price_ghs: Number(row.price_ghs),
    compare_at_ghs: was == null || was === "" ? null : Number(was),
    flash_sale: row.flash_sale === true,
    sizes,
    colors,
    badge: row.badge || null,
    in_stock: row.in_stock !== false,
    sort_order: Number(row.sort_order || 0),
    image: cover,
    images: allImages,
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
    colors: [...(p.colors || [])],
    images: [...(p.images || [])]
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

// Save a product. Always updates the browser store first so Seller Center
// reacts instantly, then syncs to Supabase through the gated
// seller_upsert_product function (supabase/setup.sql).
// Resolves { product, synced, error } — synced=false means the change lives
// in this browser only and the owner should re-run setup.sql / check the key.
export async function saveProduct(input) {
  const products = readStore() || getLocalProducts();
  const images = (Array.isArray(input.images) ? input.images : [])
    .map((src) => String(src || "").trim())
    .filter(Boolean);
  const product = normalizeProduct({
    ...input,
    id: input.id || `p-${Date.now()}`,
    images,
    image: String(input.image || "").trim() || images[0] || "",
    sort_order: input.sort_order || products.length + 1
  });
  const idx = products.findIndex((p) => stringId(p.id) === stringId(product.id));
  if (idx >= 0) products[idx] = { ...products[idx], ...product };
  else products.push(product);
  writeStore(products);

  const result = { product: cloneProduct(product), synced: isDemoMode, error: null };
  if (isDemoMode) return result;

  try {
    const ready = await waitForSupabase();
    const sb = ready ? getSupabaseClient() : null;
    if (!sb) throw new Error("Supabase is not connected.");
    const payload = {
      id: product.id,
      dept: product.dept || "fashion",
      collection: product.collection || "",
      name: product.name,
      description: product.description || "",
      price_ghs: product.price_ghs,
      compare_at_ghs: product.compare_at_ghs == null ? "" : product.compare_at_ghs,
      flash_sale: product.flash_sale === true,
      sizes: product.sizes,
      colors: product.colors,
      badge: product.badge || "",
      in_stock: product.in_stock !== false,
      image: product.image || "",
      images: product.images,
      sort_order: product.sort_order || 0
    };
    const { data, error } = await sb.rpc("seller_upsert_product", {
      p_key: String(CONFIG.sellerKey || ""),
      p_product: payload
    });
    if (error) throw new Error(error.message || "Supabase rejected the save.");
    if (data && typeof data === "object") {
      const saved = normalizeProduct(data);
      const list = readStore() || [];
      const i = list.findIndex((p) => stringId(p.id) === stringId(product.id));
      if (i >= 0) list[i] = saved;
      else list.push(saved);
      writeStore(list);
      result.product = cloneProduct(saved);
    }
    result.synced = true;
  } catch (err) {
    console.error("Product saved in the browser only:", err);
    result.error = err?.message || String(err);
  }
  return result;
}

// Delete a product locally, then from Supabase when connected.
// Resolves { synced, error }.
export async function deleteProduct(id) {
  const products = (readStore() || getLocalProducts())
    .filter((p) => stringId(p.id) !== stringId(id));
  writeStore(products);

  const result = { products: products.map(cloneProduct), synced: isDemoMode, error: null };
  if (isDemoMode) return result;

  try {
    const ready = await waitForSupabase();
    const sb = ready ? getSupabaseClient() : null;
    if (!sb) throw new Error("Supabase is not connected.");
    const { error } = await sb.rpc("seller_delete_product", {
      p_key: String(CONFIG.sellerKey || ""),
      p_id: stringId(id)
    });
    if (error) throw new Error(error.message || "Supabase rejected the delete.");
    result.synced = true;
  } catch (err) {
    console.error("Product deleted in the browser only:", err);
    result.error = err?.message || String(err);
  }
  return result;
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
