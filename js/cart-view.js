// Full cart page (useful on desktop and as a fallback for the drawer).

import { formatGHS, escapeHtml, getProductImage } from "./utils.js";
import { CONFIG } from "./config.js";
import {
  getCart,
  cartSubtotal,
  cartCount,
  updateQty,
  removeItem,
  deliveryFee
} from "./store.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { showDemoNotice } from "./render.js";

const body = document.getElementById("cart-view-body");
let initialized = false;

function renderCartPage() {
  const items = getCart();
  const subtotal = cartSubtotal();
  const count = cartCount();

  if (items.length === 0) {
    body.innerHTML = `
      <h1>Your Bag</h1>
      <div class="cart-empty">
        <p>Your bag is empty.</p>
        <a href="shop.html" class="btn btn-primary">Browse the shop</a>
      </div>`;
    return;
  }

  const fee = deliveryFee(subtotal, "Accra");
  const total = subtotal + fee;

  body.innerHTML = `
    <h1>Your Bag <span class="muted">(${count})</span></h1>
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
      <div class="summary-row"><span>Delivery (Accra)</span><span>${fee === 0 ? "Free" : formatGHS(fee)}</span></div>
      ${subtotal < CONFIG.freeDeliveryThreshold
        ? `<p class="mini-note">Spend ${formatGHS(CONFIG.freeDeliveryThreshold - subtotal)} more for free delivery.</p>`
        : `<p class="mini-note success-note">Free delivery unlocked.</p>`}
      <div class="summary-row total"><span>Total</span><span>${formatGHS(total)}</span></div>
    </div>
    <a href="checkout.html" class="btn btn-primary btn-full">Proceed to checkout</a>`;
}

function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  showDemoNotice();
  renderCartPage();

  if (initialized) return;
  initialized = true;

  body.addEventListener("click", (event) => {
    const dec = event.target.closest("[data-cart-dec]");
    const add = event.target.closest("[data-cart-add]");
    const remove = event.target.closest("[data-cart-remove]");
    if (dec) {
      const item = getCart().find((i) => i.key === dec.getAttribute("data-cart-dec"));
      if (item) updateQty(item.key, item.qty - 1);
      renderCartPage({ force: true });
    }
    if (add) {
      const item = getCart().find((i) => i.key === add.getAttribute("data-cart-add"));
      if (item) updateQty(item.key, item.qty + 1);
      renderCartPage({ force: true });
    }
    if (remove) {
      removeItem(remove.getAttribute("data-cart-remove"));
      renderCartPage({ force: true });
    }
  });

  window.addEventListener("velloura:cart-changed", () => renderCartPage());
}

init();
