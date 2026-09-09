// Shared helpers used across the whole shop.

import { CONFIG, isDemoMode } from "./config.js";

export { isDemoMode };

export function formatGHS(value) {
  const amount = Number(value || 0);
  const hasCents = Math.abs(amount % 1) > 0.001;
  const text = hasCents ? amount.toFixed(2) : String(Math.round(amount));
  return `${CONFIG.currency} ${text}`;
}

export function escapeHtml(value) {
  return String(value == null ? "" : value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeDigits(value) {
  return String(value || "").replace(/[^0-9]/g, "");
}

export function isValidGhanaPhone(value) {
  const digits = normalizeDigits(value);
  return /^0\d{9}$/.test(digits);
}

export function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name) || "";
}

export function isProductSubdir() {
  return /\/p\/[^/]+\.html$/.test(window.location.pathname);
}

export function rootHref(path) {
  const value = String(path || "");
  if (!value) return value;
  if (/^(https?:)?\/\//i.test(value) || value.startsWith("data:") || value.startsWith("../") || value.startsWith("/")) {
    return value;
  }
  return isProductSubdir() ? `../${value}` : value;
}

export function productPageHref(product) {
  if (product && product.slug) return rootHref(`p/${encodeURIComponent(product.slug)}.html`);
  if (product && product.id != null) return rootHref(`product.html?id=${encodeURIComponent(product.id)}`);
  return rootHref("shop.html");
}

export function stringId(value) {
  return String(value == null ? "" : value);
}

export function isUsableImageSrc(value) {
  const image = String(value || "");
  return Boolean(image) && (
    /^data:image\//i.test(image) ||
    /^(https?:)?\/\//i.test(image) ||
    /^blob:/i.test(image) ||
    /\.(svg|png|jpe?g|webp|avif|gif)(\?.*)?$/i.test(image)
  );
}

export function getProductImage(product) {
  const image = product.image ? String(product.image) : "";
  if (isUsableImageSrc(image)) return rootHref(image);
  return rootHref("assets/placeholder-fashion.svg");
}

// Every photo on a listing: cover first, then the rest. Falls back to the
// shared placeholder when a product has no usable photo yet.
export function getProductImages(product) {
  const extra = Array.isArray(product?.images) ? product.images : [];
  const cover = product?.image ? String(product.image) : "";
  const out = [];
  const seen = new Set();
  [cover, ...extra.map(String)].forEach((src) => {
    if (!isUsableImageSrc(src)) return;
    const href = rootHref(src);
    if (seen.has(href)) return;
    seen.add(href);
    out.push(href);
  });
  return out.length ? out : [rootHref("assets/placeholder-fashion.svg")];
}

export function getDaysAhead(count) {
  const out = [];
  const now = new Date();
  for (let i = 0; i < count; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + i);
    out.push({
      iso: d.toISOString().slice(0, 10),
      dayName: d.toLocaleDateString("en-GB", { weekday: "short" }),
      dateText: d.toLocaleDateString("en-GB", { day: "numeric", month: "short" }),
      label: i === 0 ? "Today" : i === 1 ? "Tomorrow" : d.toLocaleDateString("en-GB", { weekday: "long" })
    });
  }
  return out;
}

export function buildWhatsAppLink(number, message) {
  const clean = normalizeDigits(number);
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}

export function firstName(fullName) {
  return String(fullName || "").trim().split(/\s+/)[0] || "";
}

export function timeGreeting(name) {
  let hour = new Date().getHours();
  try {
    hour = Number(
      new Intl.DateTimeFormat("en-GB", {
        timeZone: "Africa/Accra",
        hour: "numeric",
        hourCycle: "h23"
      }).format(new Date())
    );
  } catch (err) {
    /* local clock */
  }
  let hello = "Hello";
  if (hour >= 5 && hour < 12) hello = "Good morning";
  else if (hour >= 12 && hour < 17) hello = "Good afternoon";
  else hello = "Good evening";
  const who = firstName(name);
  return who ? `${hello} ${who}` : hello;
}

export function orderStatusLabel(status) {
  const map = {
    new: "Pending",
    confirmed: "Confirmed",
    packed: "Packed",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  return map[status] || status || "Pending";
}

export function getConfigNotice() {
  return "";
}

export function discountPercent(product) {
  const price = Number(product?.price_ghs || 0);
  const was = Number(product?.compare_at_ghs || 0);
  if (!(was > price) || !(price > 0)) return 0;
  return Math.round(((was - price) / was) * 100);
}
