// Small shared rendering helpers used across pages.

import { formatGHS, escapeHtml, getProductImage, getConfigNotice, stringId } from "./utils.js";
import { addToCart } from "./store.js";
import { openCartDrawer, renderCartDrawer } from "./cart-helpers.js";

function defaultOption(values) {
  return Array.isArray(values) && values.length ? values[0] : "";
}

export function productCardHTML(product) {
  const price = formatGHS(product.price_ghs);
  const badge = product.badge
    ? `<span class="badge">${escapeHtml(product.badge)}</span>`
    : "";
  const sizes = Array.isArray(product.sizes) && product.sizes.length
    ? `<span class="card-meta">Sizes ${escapeHtml(product.sizes.join(" / "))}</span>`
    : "";
  const colors = Array.isArray(product.colors) && product.colors.length
    ? `<span class="card-meta">${escapeHtml(product.colors.join(" / "))}</span>`
    : "";
  const stock = product.in_stock === false ? `<span class="badge in-stock">Sold out</span>` : "";
  return `
    <article class="product-card">
      <a class="product-card-link" href="product.html?id=${encodeURIComponent(product.id)}" aria-label="View ${escapeHtml(product.name)}">
        <div class="product-media-wrap">
          <img src="${escapeHtml(getProductImage(product))}" alt="${escapeHtml(product.name)}" loading="lazy">
        </div>
        <div class="product-card-body">
          ${badge}
          ${stock}
          <span class="product-card-name">${escapeHtml(product.name)}</span>
          <span class="product-card-price">${price}</span>
          ${sizes}
          ${colors}
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
