// Checkout: cart review, delivery fees, customer form, order save and success screen.

import { CONFIG } from "./config.js";
import {
  formatGHS,
  isValidGhanaPhone,
  normalizeDigits,
  escapeHtml,
  getProductImage,
  buildWhatsAppLink
} from "./utils.js";
import {
  getCart,
  cartSubtotal,
  clearCart,
  deliveryFee,
  placeOrder,
  buildOrderSummaryText
} from "./store.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { showDemoNotice, showNotice, hideNotice } from "./render.js";

const content = document.getElementById("checkout-content");
let selectedArea = "Accra";

function renderOrderItems() {
  return getCart().map((item) => `
    <div class="summary-row">
      <span>${escapeHtml(item.name)}${item.size ? ` / ${escapeHtml(item.size)}` : ""}${item.color ? ` / ${escapeHtml(item.color)}` : ""} x ${item.qty}</span>
      <span>${formatGHS(item.price_ghs * item.qty)}</span>
    </div>`).join("");
}

function renderCheckout() {
  const items = getCart();
  const subtotal = cartSubtotal();
  const fee = deliveryFee(subtotal, selectedArea);
  const total = subtotal + fee;

  const existingForm = document.getElementById("checkout-form");
  const prev = {};
  if (existingForm) {
    ["customer_name", "phone", "area", "neighborhood", "notes"].forEach((name) => {
      const el = existingForm.elements.namedItem(name);
      if (el) prev[name] = el.value;
    });
    const checked = existingForm.querySelector("input[name=payment]:checked");
    if (checked) prev.payment = checked.value;
  }

  content.innerHTML = `
    <section class="section">
      <div class="section-head">
        <h1>Checkout</h1>
        <a href="cart-view.html">Back to bag</a>
      </div>

      <div class="form-card">
        <h2>Your order</h2>
        ${items.length ? renderOrderItems() : `<p class="muted">Your bag is empty.</p>`}
        <div class="summary-row"><span>Delivery</span><span>${fee === 0 ? "Free" : formatGHS(fee)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatGHS(total)}</span></div>
      </div>

      <form id="checkout-form" novalidate>
        <div class="form-card">
          <h2>Delivery details</h2>
          <div class="field">
            <label for="customer_name">Full name</label>
            <input id="customer_name" name="customer_name" type="text" autocomplete="name" value="${escapeHtml(prev.customer_name || "")}" required>
          </div>
          <div class="field">
            <label for="phone">Phone number</label>
            <input id="phone" name="phone" type="tel" inputmode="tel" placeholder="0XX XXX XXXX" autocomplete="tel" value="${escapeHtml(prev.phone || "")}" required>
            <span class="hint">We will use this for the delivery person.</span>
          </div>
          <div class="field">
            <label for="area">Area</label>
            <select id="area" name="area" required>
              <option value="Accra" ${prev.area === "Accra" || (!prev.area && selectedArea === "Accra") ? "selected" : ""}>Accra</option>
              <option value="Kumasi" ${prev.area === "Kumasi" || (!prev.area && selectedArea === "Kumasi") ? "selected" : ""}>Kumasi</option>
              <option value="Other" ${prev.area === "Other" || (!prev.area && selectedArea === "Other") ? "selected" : ""}>Other region</option>
            </select>
          </div>
          <div class="field">
            <label for="neighborhood">Neighborhood</label>
            <input id="neighborhood" name="neighborhood" type="text" autocomplete="address-line2" value="${escapeHtml(prev.neighborhood || "")}">
          </div>
          <div class="field">
            <label for="notes">A note for Velloura <span class="hint">(optional)</span></label>
            <textarea id="notes" name="notes">${escapeHtml(prev.notes || "")}</textarea>
          </div>
        </div>

        <div class="form-card">
          <h2>Payment method</h2>
          <label class="radio-card">
            <input type="radio" name="payment" value="pay_on_delivery" ${prev.payment !== "momo" ? "checked" : ""}>
            <span class="radio-body">
              <strong>Pay on delivery (Accra only)</strong>
              <span>Pay the delivery person when your order arrives.</span>
            </span>
          </label>
          <label class="radio-card">
            <input type="radio" name="payment" value="momo" ${prev.payment === "momo" ? "checked" : ""}>
            <span class="radio-body">
              <strong>Mobile Money transfer</strong>
              <span>Velloura confirms on WhatsApp and sends the MoMo details.</span>
            </span>
          </label>
        </div>

        <div class="notice-box">
          <strong>How it works:</strong> Velloura confirms every order on WhatsApp. For Mobile Money, you receive the MoMo number on confirmation and pay before delivery. No fake card payment here.
        </div>

        <div id="form-error" class="error-text" hidden></div>
        <button id="place-order" type="submit" class="btn btn-primary btn-full">Place order - ${formatGHS(total)}</button>
      </form>
    </section>`;

  const form = document.getElementById("checkout-form");
  const areaSelect = document.getElementById("area");
  const placeBtn = document.getElementById("place-order");

  areaSelect.addEventListener("change", () => {
    selectedArea = areaSelect.value;
    renderCheckout();
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    submitOrder(form);
  });

  placeBtn.textContent = items.length
    ? `Place order - ${formatGHS(total)}`
    : "Your bag is empty";
  placeBtn.disabled = items.length === 0;
}

function getFieldValue(form, name) {
  const el = form.elements.namedItem(name);
  return el ? el.value : "";
}

function validateForm(form) {
  const name = getFieldValue(form, "customer_name").trim();
  const phone = getFieldValue(form, "phone").trim().replace(/[^0-9]/g, "");
  const area = getFieldValue(form, "area");
  const payment = form.querySelector("input[name=payment]:checked")?.value;
  const errors = [];

  if (name.length < 2) errors.push("Please enter your full name.");
  if (!isValidGhanaPhone(phone)) errors.push("Please enter a Ghana phone number like 024 123 4567.");
  if (!area) errors.push("Please choose your delivery area.");
  if (payment === "pay_on_delivery" && area !== "Accra") {
    errors.push("Pay on delivery is available in Accra only. Please choose Mobile Money.");
  }
  return errors;
}

function renderSuccess(record) {
  const waMessage = buildOrderSummaryText(record);
  const waLink = buildWhatsAppLink(CONFIG.whatsappNumber, waMessage);

  content.innerHTML = `
    <section class="section">
      <div class="success-card">
        <div class="success-icon">V</div>
        <h1>Order received</h1>
        <p>Thank you, ${escapeHtml(record.customer_name)}. Velloura will confirm your order on WhatsApp.</p>
        <div class="code-pill">${escapeHtml(record.order_code)}</div>
        <p class="muted">Items total: ${formatGHS(record.items_total)}<br>
          Delivery: ${record.delivery_fee === 0 ? "Free" : formatGHS(record.delivery_fee)}<br>
          <strong>Total: ${formatGHS(record.total_ghs)}</strong></p>
        <a class="btn btn-primary btn-full" href="${waLink}" target="_blank" rel="noopener">Send order to WhatsApp</a>
      </div>
      <div class="notice-box">
        <strong>Crown perk:</strong> order jewelry today and get 10 percent off your next hair or wig purchase.
      </div>
      <div class="flex-center mt-24">
        <a class="btn btn-ghost" href="shop.html">Continue shopping</a>
      </div>
    </section>`;
}

async function submitOrder(form) {
  const errors = validateForm(form);
  const errBox = document.getElementById("form-error");
  if (errors.length) {
    errBox.textContent = errors.join(" ");
    errBox.hidden = false;
    return;
  }
  errBox.hidden = true;
  hideNotice();

  const submitBtn = document.getElementById("place-order");
  submitBtn.disabled = true;
  submitBtn.textContent = "Saving order...";

  const items = getCart().map((item) => ({
    id: item.id,
    name: item.name,
    price_ghs: item.price_ghs,
    qty: item.qty,
    size: item.size || "",
    color: item.color || "",
    badge: item.badge || ""
  }));
  const subtotal = cartSubtotal();
  const area = getFieldValue(form, "area");
  const fee = deliveryFee(subtotal, area);
  const payload = {
    customer_name: getFieldValue(form, "customer_name").trim(),
    phone: normalizeDigits(getFieldValue(form, "phone")),
    area,
    neighborhood: getFieldValue(form, "neighborhood").trim(),
    notes: getFieldValue(form, "notes").trim(),
    items,
    items_total: subtotal,
    delivery_fee: fee,
    total_ghs: subtotal + fee
  };

  try {
    const { code, record } = await placeOrder(payload);
    clearCart();
    renderSuccess({ ...record, order_code: code });
  } catch (err) {
    console.error(err);
    submitBtn.disabled = false;
    submitBtn.textContent = "Try again";
    showNotice("We could not save your order. Please try again or contact Velloura on WhatsApp.", "error");
  }
}

function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  showDemoNotice();
  renderCheckout();
}

init();
