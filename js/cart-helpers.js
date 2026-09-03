// Cart drawer markup and controls, shared by every page.

import {
  formatGHS,
  buildWhatsAppLink,
  getProductImage,
  escapeHtml
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
  if (countEl) countEl.textContent = `${count} ${count === 1 ? "item" : "items"}`;

  const drawer = document.getElementById("cart-drawer");
  const body = document.getElementById("cart-drawer-body");
  if (!drawer || !body) return;

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty">
        <p>Your bag is empty.</p>
        <a href="shop.html" class="btn btn-primary">Browse the shop</a>
      </div>`;
  } else {
    body.innerHTML = `
      <ul class="cart-list">
        ${items.map((item) => `
          <li class="cart-item">
            <img class="cart-img" src="${escapeHtml(item.image || getProductImage({ dept: item.dept, image: item.image }))}" alt="${escapeHtml(item.name)}">
            <div class="cart-item-info">
              <strong class="cart-item-name">${escapeHtml(item.name)}</strong>
              ${item.size ? `<span class="muted">Size ${escapeHtml(item.size)}</span>` : ""}
              ${item.color ? `<span class="muted">${escapeHtml(item.color)}</span>` : ""}
              <span class="cart-item-price">${formatGHS(item.price_ghs)}</span>
              <div class="qty-row">
                <button class="btn-chip" data-cart-dec="${escapeHtml(item.key)}" aria-label="Reduce quantity">-</button>
                <span class="qty-value">${item.qty}</span>
                <button class="btn-chip" data-cart-add="${escapeHtml(item.key)}" aria-label="Increase quantity">+</button>
              </div>
            </div>
            <button class="link-muted" data-cart-remove="${escapeHtml(item.key)}" aria-label="Remove ${escapeHtml(item.name)}">Remove</button>
          </li>`).join("")}
      </ul>
      <div class="cart-summary">
        <div class="summary-row"><span>Subtotal</span><span>${formatGHS(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>${fee === 0 ? "Free" : formatGHS(fee)}</span></div>
        ${subtotal < CONFIG.freeDeliveryThreshold
          ? `<p class="mini-note">Spend ${formatGHS(CONFIG.freeDeliveryThreshold - subtotal)} more for free delivery.</p>`
          : `<p class="mini-note success-note">Free delivery unlocked.</p>`}
        <div class="summary-row total"><span>Total</span><span>${formatGHS(total)}</span></div>
      </div>
      <a href="checkout.html" class="btn btn-primary btn-full">Checkout</a>`;
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
  const checkoutBtn = document.getElementById("cart-checkout");
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
  if (checkoutBtn) checkoutBtn.addEventListener("click", () => {
    window.location.href = "checkout.html";
  });

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
