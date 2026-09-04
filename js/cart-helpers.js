// Cart drawer markup and controls, shared by every page.

import {
  formatGHS,
  buildWhatsAppLink,
  getProductImage,
  escapeHtml,
  rootHref
} from "./utils.js";
import { CONFIG } from "./config.js";
import {
  getCart,
  cartSubtotal,
  cartCount,
  updateQty,
  removeItem,
  deliveryFee
} from "./store.js";

const DEFAULT_AREA = "Accra";

function itemMeta(item) {
  const bits = [];
  if (item.size) bits.push(`Size ${item.size}`);
  if (item.color) bits.push(item.color);
  return bits.length ? `<span class="cart-item-meta">${escapeHtml(bits.join(" · "))}</span>` : "";
}

export function cartItemHTML(item) {
  const img = escapeHtml(rootHref(item.image || getProductImage({ dept: item.dept, image: item.image })));
  return `
    <li class="cart-item">
      <img class="cart-img" src="${img}" alt="${escapeHtml(item.name)}">
      <div class="cart-item-info">
        <div class="cart-item-top">
          <strong class="cart-item-name">${escapeHtml(item.name)}</strong>
          <button class="cart-remove" type="button" data-cart-remove="${escapeHtml(item.key)}" aria-label="Remove ${escapeHtml(item.name)}">
            <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" d="M5 7h14M10 7V5h4v2m-7 0l1 13h8l1-13"/></svg>
          </button>
        </div>
        ${itemMeta(item)}
        <div class="cart-item-bottom">
          <div class="qty-stepper">
            <button type="button" data-cart-dec="${escapeHtml(item.key)}" aria-label="Reduce quantity">−</button>
            <span class="qty-value">${item.qty}</span>
            <button type="button" data-cart-add="${escapeHtml(item.key)}" aria-label="Increase quantity">+</button>
          </div>
          <span class="cart-item-price">${formatGHS(item.price_ghs * item.qty)}</span>
        </div>
      </div>
    </li>`;
}

export function renderCartDrawer({ area = DEFAULT_AREA } = {}) {
  const items = getCart();
  const subtotal = cartSubtotal();
  const fee = deliveryFee(subtotal, area);
  const total = subtotal + fee;
  const count = cartCount();

  const badge = document.getElementById("cart-badge");
  if (badge) badge.textContent = String(count);
  if (badge) badge.hidden = count === 0;

  const countEl = document.getElementById("cart-count-text");
  if (countEl) countEl.textContent = count ? `(${count})` : "";

  const drawer = document.getElementById("cart-drawer");
  const body = document.getElementById("cart-drawer-body");
  if (!drawer || !body) return;

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <div class="cart-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="48" height="48"><path fill="currentColor" d="M18 6h-2V5c0-2.21-1.79-4-4-4S8 2.79 8 5v1H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zM10 5c0-1.1.9-2 2-2s2 .9 2 2v1h-4V5zm8 15H6V8h12v12z"/></svg>
        </div>
        <h3>Your cart is empty</h3>
        <p>Browse the shop and add something you like.</p>
        <a href="${rootHref("shop.html")}" class="btn btn-primary">Start shopping</a>
      </div>`;
  } else {
    body.innerHTML = `
      <ul class="cart-list">${items.map(cartItemHTML).join("")}</ul>
      <div class="cart-summary cart-summary-card">
        <h3>Cart summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${formatGHS(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>At checkout</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatGHS(total)}</span></div>
        <a href="${rootHref("checkout.html")}" class="btn btn-primary btn-full">Checkout (${formatGHS(subtotal)})</a>
        <a href="${rootHref("cart-view.html")}" class="cart-view-link">View cart</a>
      </div>`;
  }
}

export function openCartDrawer() {
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  if (!drawer || !overlay) return;
  renderCartDrawer();
  drawer.classList.add("open");
  overlay.classList.add("show");
  document.body.classList.add("no-scroll");
}

export function bindCartDrawerEvents() {
  const drawer = document.getElementById("cart-drawer");
  const openBtn = document.getElementById("open-cart");
  const closeBtn = document.getElementById("close-cart");
  const overlay = document.getElementById("cart-overlay");

  if (openBtn) {
    openBtn.addEventListener("click", () => openCartDrawer());
  }
  const close = () => {
    drawer?.classList.remove("open");
    overlay?.classList.remove("show");
    document.body.classList.remove("no-scroll");
  };
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (overlay) overlay.addEventListener("click", close);

  drawer?.addEventListener("click", (event) => {
    const dec = event.target.closest("[data-cart-dec]");
    const add = event.target.closest("[data-cart-add]");
    const remove = event.target.closest("[data-cart-remove]");
    if (dec) {
      const item = getCart().find((i) => i.key === dec.getAttribute("data-cart-dec"));
      if (item) updateQty(item.key, item.qty - 1);
      renderCartDrawer();
    }
    if (add) {
      const item = getCart().find((i) => i.key === add.getAttribute("data-cart-add"));
      if (item) updateQty(item.key, item.qty + 1);
      renderCartDrawer();
    }
    if (remove) {
      removeItem(remove.getAttribute("data-cart-remove"));
      renderCartDrawer();
    }
  });

  window.addEventListener("velloura:cart-changed", () => renderCartDrawer());
}

export function getDefaultArea() {
  return DEFAULT_AREA;
}

export function getFooterConfig() {
  return CONFIG;
}

export function makeFooter() {
  return null;
}

export function waLink(message) {
  return buildWhatsAppLink(CONFIG.whatsappNumber, message);
}
