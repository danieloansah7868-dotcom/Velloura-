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

export function getProductImage(product) {
  const image = product.image ? String(product.image) : "";
  if (
    image &&
    (
      /^data:image\//i.test(image) ||
      /^(https?:)?\/\//i.test(image) ||
      /\.(svg|png|jpe?g|webp|avif)(\?.*)?$/i.test(image)
    )
  ) {
    return rootHref(image);
  }
  return rootHref("assets/placeholder-fashion.svg");
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

export function getConfigNotice() {
  return "";
}

export function discountPercent(product) {
  const price = Number(product?.price_ghs || 0);
  const was = Number(product?.compare_at_ghs || 0);
  if (!(was > price) || !(price > 0)) return 0;
  return Math.round(((was - price) / was) * 100);
}
