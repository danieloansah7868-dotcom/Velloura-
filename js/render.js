// Small shared rendering helpers used across pages.

import { formatGHS, escapeHtml, getProductImage, getConfigNotice, stringId, productPageHref, discountPercent } from "./utils.js";
import { addToCart } from "./store.js";
import { openCartDrawer, renderCartDrawer } from "./cart-helpers.js";
import { isSaved, toggleSaved, updateWishBadge } from "./wishlist.js";
import { ratingSummary, starsText } from "./reviews.js";

function defaultOption(values) {
  return Array.isArray(values) && values.length ? values[0] : "";
}

export function productCardHTML(product) {
  const price = formatGHS(product.price_ghs);
  const off = discountPercent(product);
  const was = Number(product.compare_at_ghs || 0);
  const saleBadge = off
    ? `<span class="badge badge-sale">-${off}%</span>`
    : "";
  const badge = product.in_stock === false
    ? `<span class="badge in-stock">Sold out</span>`
    : product.flash_sale
      ? `<span class="badge badge-flash">Flash sale</span>`
      : product.badge
        ? `<span class="badge">${escapeHtml(product.badge)}</span>`
        : saleBadge;
  const saved = isSaved(product.id);
  const rating = ratingSummary(product.id);
  const ratingLine = `<span class="card-rating"><span class="stars">${starsText(rating.average)}</span> ${rating.count ? `${rating.average} (${rating.count})` : "(0)"}</span>`;
  const priceLine = was > Number(product.price_ghs)
    ? `<span class="product-card-price"><span class="price-now">${price}</span> <span class="price-was">${formatGHS(was)}</span>${off ? ` <span class="price-off">-${off}%</span>` : ""}</span>`
    : `<span class="product-card-price">${price}</span>`;
  return `
    <article class="product-card">
      <button class="wish-toggle ${saved ? "is-saved" : ""}" type="button" data-save-id="${escapeHtml(stringId(product.id))}" aria-label="${saved ? "Remove from saved" : "Save item"}" aria-pressed="${saved}">
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true">
          <path fill="${saved ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.8" d="M12.1 21.35 10.6 20C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54l-1.35 1.31z"/>
        </svg>
      </button>
      <a class="product-card-link" href="${productPageHref(product)}" aria-label="View ${escapeHtml(product.name)}">
        <div class="product-media-wrap">
          <img src="${escapeHtml(getProductImage(product))}" alt="${escapeHtml(product.name)}" loading="lazy" decoding="async">
          ${badge}
        </div>
        <div class="product-card-body">
          <span class="product-card-name">${escapeHtml(product.name)}</span>
          ${ratingLine}
          ${priceLine}
        </div>
      </a>
      <button class="btn btn-card-add" type="button" data-add-to-cart="${escapeHtml(stringId(product.id))}" ${product.in_stock === false ? "disabled" : ""}>Add to bag</button>
    </article>`;
}

export function renderProductGrid(container, products) {
  if (!container) return;
  container.__vellouraProducts = products || [];
  container.innerHTML = products.map(productCardHTML).join("");
  bindProductGrid(container);
}

function getQuickAddOptions(product) {
  return {
    size: defaultOption(product.sizes),
    color: defaultOption(product.colors),
    qty: 1
  };
}

function quickAdd(product) {
  if (!product || product.in_stock === false) return;
  addToCart(product, getQuickAddOptions(product));
  renderCartDrawer();
  openCartDrawer();
}

export function bindProductGrid(container) {
  if (!container || container.__vellouraGridBound) return;
  container.__vellouraGridBound = true;

  container.addEventListener("click", (event) => {
    const saveBtn = event.target.closest("[data-save-id]");
    if (saveBtn) {
      event.preventDefault();
      event.stopPropagation();
      const id = saveBtn.getAttribute("data-save-id");
      const now = toggleSaved(id);
      saveBtn.classList.toggle("is-saved", now);
      saveBtn.setAttribute("aria-pressed", String(now));
      saveBtn.setAttribute("aria-label", now ? "Remove from saved" : "Save item");
      const path = saveBtn.querySelector("path");
      if (path) path.setAttribute("fill", now ? "currentColor" : "none");
      updateWishBadge();
      return;
    }
    const btn = event.target.closest("[data-add-to-cart]");
    if (!btn) return;
    event.preventDefault();
    const id = btn.getAttribute("data-add-to-cart");
    const products = container.__vellouraProducts || [];
    const product = products.find((p) => stringId(p.id) === id);
    quickAdd(product);
  });
}

export function showNotice(message, type = "") {
  const el = document.getElementById("page-notice");
  if (!el) return;
  el.className = `notice-box ${type}`.trim();
  el.textContent = message;
  el.hidden = false;
}

export function hideNotice() {
  const el = document.getElementById("page-notice");
  if (!el) return;
  el.hidden = true;
}

export function showDemoNotice() {
  const notice = getConfigNotice();
  if (notice) showNotice(notice, "warn");
}

export function renderEmpty(container, message) {
  if (!container) return;
  container.innerHTML = `<p class="loading-note">${escapeHtml(message)}</p>`;
}
