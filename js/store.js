// Cart and order persistence.
// - Demo mode: localStorage so the full journey works before Supabase is connected.
// - Supabase mode: anonymous inserts into public.orders; order tracking uses
//   the track_order RPC; Seller Center reads/updates orders as an admin.

import { CONFIG, isDemoMode } from "./config.js";
import { normalizeDigits, stringId, timeGreeting, orderStatusLabel } from "./utils.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";
import { areaDeliveryFee, areaDeliveryDays, getDeliveryArea } from "./delivery.js";

const CART_KEY = "velloura_cart_v1";
const ORDERS_KEY = "velloura_orders_v1";

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    return fallback;
  }
}

function writeJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function lineKey(product, size, color) {
  return [stringId(product.id), size || "", color || ""].join("|");
}

export function getCart() {
  const items = readJson(CART_KEY, []);
  return Array.isArray(items) ? items : [];
}

export function saveCart(items) {
  writeJson(CART_KEY, items);
  window.dispatchEvent(new CustomEvent("velloura:cart-changed"));
}

export function addToCart(product, options = {}) {
  const size = options.size || "";
  const color = options.color || "";
  const qty = Math.max(1, Number(options.qty || 1));
  const maxQty = product.badge === "1 of 1" ? 1 : 99;
  const key = lineKey(product, size, color);
  const items = getCart();
  const existing = items.find((i) => i.key === key);

  if (existing) {
    existing.qty = Math.min(maxQty, existing.qty + qty);
  } else {
    items.push({
      key,
      id: stringId(product.id),
      name: product.name,
      dept: product.dept,
      price_ghs: Number(product.price_ghs),
      qty: Math.min(maxQty, qty),
      size,
      color,
      badge: product.badge || null,
      image: product.image || null
    });
  }
  saveCart(items);
  return items;
}

export function updateQty(key, qty) {
  let items = getCart();
  const item = items.find((i) => i.key === key);
  if (!item) return items;
  const maxQty = item.badge === "1 of 1" ? 1 : 99;
  item.qty = Math.min(maxQty, Math.max(1, Number(qty || 1)));
  saveCart(items);
  return items;
}

export function removeItem(key) {
  let items = getCart().filter((i) => i.key !== key);
  saveCart(items);
  return items;
}

export function clearCart() {
  saveCart([]);
}

export function cartCount() {
  return getCart().reduce((sum, item) => sum + item.qty, 0);
}

export function cartSubtotal() {
  return getCart().reduce((sum, item) => sum + item.qty * item.price_ghs, 0);
}

export function deliveryFee(subtotal, area) {
  return areaDeliveryFee(area, subtotal, CONFIG.freeDeliveryThreshold);
}

export function deliveryDays(area) {
  return areaDeliveryDays(area);
}

export function isDeliverableArea(area) {
  return Boolean(getDeliveryArea(area));
}

function makeOrderCode() {
  return `VEL-${1000 + Math.floor(Math.random() * 9000)}`;
}

export async function placeOrder(payload) {
  const code = makeOrderCode();
  const record = {
    order_code: code,
    customer_name: payload.customer_name,
    phone: normalizeDigits(payload.phone),
    area: payload.area,
    neighborhood: payload.neighborhood || "",
    notes: payload.notes || "",
    items: payload.items,
    items_total: payload.items_total,
    delivery_fee: payload.delivery_fee,
    total_ghs: payload.total_ghs,
    status: "new",
    customer_email: payload.customer_email || "",
    payment: payload.payment || ""
  };

  function saveLocalOrder(currentRecord) {
    const orders = readJson(ORDERS_KEY, []);
    orders.push({ ...currentRecord, created_at: currentRecord.created_at || new Date().toISOString() });
    writeJson(ORDERS_KEY, orders);
  }

  if (isDemoMode) {
    saveLocalOrder(record);
    return { code, record };
  }

  const ready = await waitForSupabase();
  if (!ready) throw new Error("Supabase JS library is not loaded.");
  const sb = getSupabaseClient();
  if (!sb) throw new Error("Supabase is not connected.");
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const currentCode = attempt === 0 ? code : makeOrderCode();
    const currentRecord = { ...record, order_code: currentCode };
    const slimRecord = {
      order_code: currentRecord.order_code,
      customer_name: currentRecord.customer_name,
      phone: currentRecord.phone,
      area: currentRecord.area,
      neighborhood: currentRecord.neighborhood,
      notes: currentRecord.notes,
      items: currentRecord.items,
      items_total: currentRecord.items_total,
      delivery_fee: currentRecord.delivery_fee,
      total_ghs: currentRecord.total_ghs,
      status: currentRecord.status
    };
    let { error } = await sb.from("orders").insert(currentRecord);
    if (error && /column|schema cache|PGRST204/i.test(`${error.message || ""} ${error.code || ""}`)) {
      ({ error } = await sb.from("orders").insert(slimRecord));
    }
    if (!error) {
      saveLocalOrder(currentRecord);
      return { code: currentCode, record: currentRecord };
    }
    lastError = error;
    if (!/unique|duplicate|23505/i.test(`${error.message || ""} ${error.code || ""}`)) break;
  }
  throw lastError || new Error("Could not save the order.");
}

export function listOrdersLocal() {
  const orders = readJson(ORDERS_KEY, []);
  return Array.isArray(orders)
    ? orders.slice().sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
    : [];
}

/**
 * Seller Center order list. Reads from public.orders (admin RLS). Falls back
 * to the local copy only when Supabase is not configured (demo mode).
 */
export async function listOrders() {
  if (isDemoMode) return listOrdersLocal();
  const ready = await waitForSupabase();
  if (!ready) throw new Error("Supabase JS library is not loaded.");
  const sb = getSupabaseClient();
  if (!sb) throw new Error("Supabase is not connected.");
  const { data, error } = await sb
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return data || [];
}

export function findOrder(code, phone) {
  const wanted = String(code || "").trim().toUpperCase();
  const digits = normalizeDigits(phone);
  if (!digits) return null;
  const matches = listOrders().filter((order) => normalizeDigits(order.phone) === digits);
  if (wanted) {
    return matches.find((order) => String(order.order_code || "").toUpperCase() === wanted) || null;
  }
  return matches[0] || null;
}

export async function findOrderRemote(code, phone) {
  const local = findOrder(code, phone);
  if (local) return local;
  if (isDemoMode) return null;
  try {
    const ready = await waitForSupabase();
    if (!ready) return null;
    const sb = getSupabaseClient();
    if (!sb) return null;
    const { data, error } = await sb.rpc("track_order", {
      p_code: String(code || "").trim(),
      p_phone: normalizeDigits(phone)
    });
    if (error) {
      console.error(error);
      return null;
    }
    const row = Array.isArray(data) ? data[0] : data;
    return row || null;
  } catch (err) {
    console.error(err);
    return null;
  }
}

/**
 * Seller Center status change. Updates the real public.orders row and
 * resolves with the returned database row. Demo mode updates the local copy.
 */
export async function updateOrderStatus(code, status) {
  const cleanStatus = String(status || "").trim().toLowerCase();
  if (!/^(new|confirmed|packed|delivered|cancelled)$/.test(cleanStatus)) {
    throw new Error("Unknown order status.");
  }
  if (isDemoMode) {
    const orders = readJson(ORDERS_KEY, []);
    const order = orders.find((o) => o.order_code === code);
    if (order) order.status = cleanStatus;
    writeJson(ORDERS_KEY, orders);
    return order || null;
  }
  const ready = await waitForSupabase();
  if (!ready) throw new Error("Supabase JS library is not loaded.");
  const sb = getSupabaseClient();
  if (!sb) throw new Error("Supabase is not connected.");
  const { data, error } = await sb
    .from("orders")
    .update({ status: cleanStatus })
    .eq("order_code", String(code || "").trim())
    .select()
    .single();
  if (error) throw error;
  // Keep the local copy (fallback + demo history) in sync with the DB.
  const orders = readJson(ORDERS_KEY, []);
  const local = orders.find((o) => o.order_code === data.order_code);
  if (local) {
    local.status = data.status;
    writeJson(ORDERS_KEY, orders);
  }
  return data;
}

export function buildOrderSummaryText(record) {
  return [
    `${timeGreeting()},`,
    `Order number: ${record.order_code}`,
    `Status: ${orderStatusLabel(record.status)}.`
  ].join("\n");
}
