// Cart and order/booking persistence.
// - Demo mode: localStorage so the full journey works before Supabase is connected.
// - Supabase mode: anonymous inserts into public.orders and public.bookings.

import { CONFIG, isDemoMode } from "./config.js";
import { normalizeDigits, formatGHS, stringId } from "./utils.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

const CART_KEY = "velloura_cart_v1";
const ORDERS_KEY = "velloura_orders_v1";
const BOOKINGS_KEY = "velloura_bookings_v1";

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
  if (subtotal >= CONFIG.freeDeliveryThreshold) return 0;
  if (area === "Kumasi") return CONFIG.deliveryFees.Kumasi;
  if (area === "Other") return CONFIG.deliveryFees.Other;
  return CONFIG.deliveryFees.Accra;
}

function makeOrderCode() {
  return `VEL-${1000 + Math.floor(Math.random() * 9000)}`;
}

function makeBookingCode() {
  return `VEL-H${2000 + Math.floor(Math.random() * 8000)}`;
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

export function listOrders() {
  const orders = readJson(ORDERS_KEY, []);
  return Array.isArray(orders)
    ? orders.slice().sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")))
    : [];
}

export function findOrder(code, phone) {
  const wanted = String(code || "").trim().toUpperCase();
  const digits = normalizeDigits(phone);
  if (!wanted || !digits) return null;
  return listOrders().find((order) => (
    String(order.order_code || "").toUpperCase() === wanted &&
    normalizeDigits(order.phone) === digits
  )) || null;
}

export function updateOrderStatus(code, status) {
  const orders = readJson(ORDERS_KEY, []);
  const order = orders.find((o) => o.order_code === code);
  if (order) order.status = status;
  writeJson(ORDERS_KEY, orders);
  return order;
}

export async function placeBooking(payload) {
  const code = makeBookingCode();
  const record = {
    booking_code: code,
    service: payload.service,
    day: payload.day,
    time_slot: payload.time_slot,
    customer_name: payload.customer_name,
    phone: normalizeDigits(payload.phone),
    status: "new"
  };

  if (isDemoMode) {
    const bookings = readJson(BOOKINGS_KEY, []);
    bookings.push({ ...record, created_at: new Date().toISOString() });
    writeJson(BOOKINGS_KEY, bookings);
    return { code, record };
  }

  const sb = getSupabaseClient();
  if (!sb) throw new Error("Supabase is not connected.");
  let lastError = null;
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const currentCode = attempt === 0 ? code : makeBookingCode();
    const currentRecord = { ...record, booking_code: currentCode };
    const { error } = await sb.from("bookings").insert(currentRecord);
    if (!error) return { code: currentCode, record: currentRecord };
    lastError = error;
    if (!/unique|duplicate|23505/i.test(`${error.message || ""} ${error.code || ""}`)) break;
  }
  throw lastError || new Error("Could not save the booking.");
}

export function buildOrderSummaryText(record) {
  const lines = ["Hi Velloura, I just placed an order.", `Order code: ${record.order_code}`];
  lines.push("Items:");
  record.items.forEach((item, index) => {
    const sizeText = item.size ? ` / ${item.size}` : "";
    const colorText = item.color ? ` / ${item.color}` : "";
    lines.push(
      `${index + 1}. ${item.name}${sizeText}${colorText} x ${item.qty} - ${formatGHS(item.price_ghs * item.qty)}`
    );
  });
  lines.push(`Items total: ${formatGHS(record.items_total)}`);
  lines.push(`Delivery fee: ${formatGHS(record.delivery_fee)}`);
  lines.push(`Total: ${formatGHS(record.total_ghs)}`);
  lines.push(`Customer: ${record.customer_name}`);
  lines.push(`Phone: ${record.phone}`);
  lines.push(`Area: ${record.area}`);
  if (record.neighborhood) lines.push(`Neighborhood: ${record.neighborhood}`);
  if (record.notes) lines.push(`Note: ${record.notes}`);
  lines.push("Payment: Valmont");
  lines.push("Please confirm my order after payment.");
  return lines.join("\n");
}

export function buildBookingSummaryText(record) {
  return [
    "Hi Velloura, I would like to book a hair appointment.",
    `Booking code: ${record.booking_code}`,
    `Service: ${record.service}`,
    `Day: ${record.day}`,
    `Time: ${record.time_slot}`,
    `Customer: ${record.customer_name}`,
    `Phone: ${record.phone}`,
    "Please confirm my seat."
  ].join("\n");
}
