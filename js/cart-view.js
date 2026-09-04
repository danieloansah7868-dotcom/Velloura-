// Full cart page, Jumia-style: items on the left, summary on the right.

import { formatGHS } from "./utils.js";
import {
  getCart,
  cartSubtotal,
  cartCount,
  updateQty,
  removeItem
} from "./store.js";
import { bindCartDrawerEvents, renderCartDrawer, cartItemHTML } from "./cart-helpers.js";
import "./account-ui.js";

const body = document.getElementById("cart-view-body");
let initialized = false;

function renderCartPage() {
  const items = getCart();
  const subtotal = cartSubtotal();
  const count = cartCount();

  if (items.length === 0) {
    body.innerHTML = `
      <div class="cart-empty cart-empty-page">
        <div class="cart-empty-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="56" height="56"><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" d="M6.6 8.4h10.8l-.85 11.2H7.45L6.6 8.4z"/><path fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" d="M9 8.4V6.7a3 3 0 0 1 6 0v1.7"/></svg>
        </div>
        <h1>Your cart is empty!</h1>
        <p>Browse the shop and find something you like.</p>
        <a href="shop.html" class="btn btn-primary">Start shopping</a>
      </div>`;
    return;
  }

  body.innerHTML = `
    <h1 class="cart-page-title">Cart <span class="muted">(${count})</span></h1>
    <div class="cart-layout">
      <ul class="cart-list cart-list-page">${items.map(cartItemHTML).join("")}</ul>
      <aside class="cart-summary cart-summary-card">
        <h3>Cart summary</h3>
        <div class="summary-row"><span>Subtotal</span><span>${formatGHS(subtotal)}</span></div>
        <div class="summary-row"><span>Delivery</span><span>At checkout</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatGHS(subtotal)}</span></div>
        <a href="checkout.html" class="btn btn-primary btn-full">Checkout (${formatGHS(subtotal)})</a>
      </aside>
    </div>`;
}

function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
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
      renderCartPage();
    }
    if (add) {
      const item = getCart().find((i) => i.key === add.getAttribute("data-cart-add"));
      if (item) updateQty(item.key, item.qty + 1);
      renderCartPage();
    }
    if (remove) {
      removeItem(remove.getAttribute("data-cart-remove"));
      renderCartPage();
    }
  });

  window.addEventListener("velloura:cart-changed", () => renderCartPage());
}

init();
