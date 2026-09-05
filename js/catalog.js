// Product catalog.
// - When Supabase is configured, products are read from the public.products table.
// - When Supabase is not configured (demo mode), a matching local placeholder set is used.
// - Product changes made in Seller Center are written back to Supabase when the
//   owner is signed in with a seller account. Without that connection the live
//   table always wins, so edits are refused with a clear message instead of
//   quietly vanishing.

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
    compare_at_ghs: 230,
    flash_sale: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White"],
    badge: "Flash sale",
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
    compare_at_ghs: 120,
    flash_sale: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Royal Navy", "White", "Black"],
    badge: "Flash sale",
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
    compare_at_ghs: 200,
    flash_sale: true,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Navy"],
    badge: "Flash sale",
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
    compare_at_ghs: 170,
    flash_sale: true,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Burgundy"],
    badge: "Flash sale",
    in_stock: true,
    sort_order: 17,
    image: "assets/products/fashion-pleated-skirt.jpg"
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
    compare_at_ghs: row.compare_at_ghs == null ? null : Number(row.compare_at_ghs),
    flash_sale: row.flash_sale === true,
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

// ---------------------------------------------------------------
// Saving products
// ---------------------------------------------------------------

function sellerError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

const SELLER_SIGNIN_MESSAGE =
  "Connect your seller account first — Seller Center → Dashboard → Live shop connection.";
const SELLER_ACCESS_MESSAGE =
  "This account cannot edit products yet. Add it to the sellers table in Supabase — see “Listing photos” in the README.";

async function requireSellerClient() {
  const ready = await waitForSupabase();
  if (!ready) throw new Error("Supabase is not connected. Check your internet and try again.");
  const sb = getSupabaseClient();
  const { data } = await sb.auth.getSession();
  if (!data?.session?.user) throw sellerError("seller_signin", SELLER_SIGNIN_MESSAGE);
  return sb;
}

function isRemoteId(id) {
  return /^\d+$/.test(stringId(id));
}

function isRlsError(error) {
  return /row-level security|42501/i.test(`${error?.message || ""} ${error?.code || ""}`);
}

function isMissingColumn(error) {
  return /column|schema cache|PGRST204|42703/i.test(`${error?.message || ""} ${error?.code || ""}`);
}

function rowPayload(product, { includeExtras = true } = {}) {
  const payload = {
    dept: product.dept || "fashion",
    collection: product.collection || null,
    name: product.name,
    description: product.description || "",
    price_ghs: Number(product.price_ghs || 0),
    sizes: product.sizes || [],
    colors: product.colors || [],
    badge: product.badge || null,
    in_stock: product.in_stock !== false,
    sort_order: Number(product.sort_order || 0),
    image: product.image || null
  };
  if (includeExtras) {
    // These columns are added by the latest supabase/setup.sql. Older
    // projects may not have them yet, so saves retry without them.
    payload.compare_at_ghs = product.compare_at_ghs == null ? null : Number(product.compare_at_ghs);
    payload.flash_sale = product.flash_sale === true;
  }
  return payload;
}

function mapWriteError(error) {
  if (isRlsError(error)) return sellerError("seller_access", SELLER_ACCESS_MESSAGE);
  if (/failed to fetch|network/i.test(error?.message || "")) {
    return new Error("Could not reach Supabase. Check your internet connection and try again.");
  }
  return new Error(error?.message || "Could not save the product. Please try again.");
}

function mergeIntoStore(product) {
  const list = readStore() || [];
  const idx = list.findIndex((p) => stringId(p.id) === stringId(product.id));
  if (idx >= 0) list[idx] = { ...list[idx], ...product };
  else list.push(product);
  writeStore(list);
}

export async function saveProduct(input) {
  const products = readStore() || getLocalProducts();
  const product = normalizeProduct({
    ...input,
    id: input.id || `p-${Date.now()}`,
    sort_order: input.sort_order || products.length + 1
  });

  // Demo mode (no Supabase): products live in this browser, as before.
  if (isDemoMode) {
    mergeIntoStore(product);
    return cloneProduct(product);
  }

  // Live mode: write to Supabase so the shop updates for everyone.
  const sb = await requireSellerClient();
  const id = stringId(product.id);

  if (isRemoteId(id)) {
    let { data, error } = await sb.from("products").update(rowPayload(product)).eq("id", Number(id)).select();
    if (error && isMissingColumn(error)) {
      ({ data, error } = await sb.from("products").update(rowPayload(product, { includeExtras: false })).eq("id", Number(id)).select());
    }
    if (error) throw mapWriteError(error);
    const saved = Array.isArray(data) ? data[0] : null;
    if (!saved) {
      throw new Error("That product is no longer in the live shop. Refresh the page and try again.");
    }
    const savedProduct = normalizeProduct(saved);
    mergeIntoStore(savedProduct);
    return cloneProduct(savedProduct);
  }

  let { data, error } = await sb.from("products").insert(rowPayload(product)).select();
  if (error && isMissingColumn(error)) {
    ({ data, error } = await sb.from("products").insert(rowPayload(product, { includeExtras: false })).select());
  }
  if (error) throw mapWriteError(error);
  const saved = Array.isArray(data) ? data[0] : null;
  const savedProduct = saved ? normalizeProduct(saved) : product;
  mergeIntoStore(savedProduct);
  return cloneProduct(savedProduct);
}

export async function deleteProduct(idValue) {
  const id = stringId(idValue);

  if (!isDemoMode && isRemoteId(id)) {
    const sb = await requireSellerClient();
    const { error } = await sb.from("products").delete().eq("id", Number(id));
    if (error) throw mapWriteError(error);
  }

  const products = (readStore() || getLocalProducts())
    .filter((p) => stringId(p.id) !== id);
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
