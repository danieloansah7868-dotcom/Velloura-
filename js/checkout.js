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
import { currentCustomer } from "./customers.js";
import "./account-ui.js";

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
  const customer = currentCustomer();
  const prev = {};
  if (existingForm) {
    ["customer_name", "phone", "email", "area", "neighborhood", "notes"].forEach((name) => {
      const el = existingForm.elements.namedItem(name);
      if (el) prev[name] = el.value;
    });
    const checked = existingForm.querySelector("input[name=payment]:checked");
    if (checked) prev.payment = checked.value;
  } else if (customer) {
    prev.customer_name = customer.name;
    prev.phone = customer.phone;
    prev.email = customer.email || "";
  }

  content.innerHTML = `
    <section class="section">
      <div class="page-intro">
        <h1>Checkout</h1>
        <p><a href="cart-view.html">Back to bag</a></p>
      </div>

      <div class="form-card">
        <h2>Your order</h2>
        ${items.length ? renderOrderItems() : `<p class="muted">Your bag is empty.</p>`}
        <div class="summary-row"><span>Delivery</span><span>${fee === 0 ? "Free" : formatGHS(fee)}</span></div>
        <div class="summary-row total"><span>Total</span><span>${formatGHS(total)}</span></div>
      </div>

      <form id="checkout-form" novalidate>
        ${customer ? "" : `<p class="muted">Have an account? <a href="account-login.html?next=checkout.html">Log in</a> to fill your details.</p>`}
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
            <label for="email">Email <span class="hint">(optional)</span></label>
            <input id="email" name="email" type="email" autocomplete="email" value="${escapeHtml(prev.email || "")}">
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
          <h2>Payment</h2>
          <label class="radio-card selected">
            <input type="radio" name="payment" value="valmont" checked>
            <span class="radio-body">
              <strong>Valmont Pay</strong>
              <span>Pay with MTN MoMo, Vodafone Cash, AirtelTigo or card on valmontpay.app.</span>
            </span>
          </label>
        </div>

        <div class="notice-box">
          After you place the order you will pay on Valmont Pay. Keep your order code. Velloura will confirm on WhatsApp once payment shows.
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
    ? `Place order and pay - ${formatGHS(total)}`
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
  const errors = [];

  if (name.length < 2) errors.push("Please enter your full name.");
  if (!isValidGhanaPhone(phone)) errors.push("Please enter a Ghana phone number like 024 123 4567.");
  if (!area) errors.push("Please choose your delivery area.");
  return errors;
}

function valmontPayHref(record) {
  const base = CONFIG.valmontPayUrl || "https://valmontpay.app";
  const url = new URL(base);
  url.searchParams.set("ref", record.order_code || "");
  url.searchParams.set("amount", String(record.total_ghs || ""));
  url.searchParams.set("currency", "GHS");
  if (record.customer_name) url.searchParams.set("name", record.customer_name);
  if (record.phone) url.searchParams.set("phone", record.phone);
  if (record.customer_email) url.searchParams.set("email", record.customer_email);
  return url.toString();
}

function renderSuccess(record) {
  const waMessage = buildOrderSummaryText(record);
  const waLink = buildWhatsAppLink(CONFIG.whatsappNumber, waMessage);
  const payHref = valmontPayHref(record);

  content.innerHTML = `
    <section class="section">
      <div class="success-card">
        <div class="success-icon">V</div>
        <h1>Order received</h1>
        <p>Thank you, ${escapeHtml(record.customer_name)}. Pay now on Valmont Pay, then we confirm on WhatsApp.</p>
        <div class="code-pill">${escapeHtml(record.order_code)}</div>
        <p class="muted">Items total: ${formatGHS(record.items_total)}<br>
          Delivery: ${record.delivery_fee === 0 ? "Free" : formatGHS(record.delivery_fee)}<br>
          <strong>Total: ${formatGHS(record.total_ghs)}</strong></p>
        <a class="btn btn-primary btn-full" href="${escapeHtml(payHref)}" target="_blank" rel="noopener">Pay now on Valmont Pay</a>
        <a class="btn btn-ghost btn-full" href="${waLink}" target="_blank" rel="noopener">Send order to WhatsApp</a>
        <a class="btn btn-ghost btn-full" href="track.html?code=${encodeURIComponent(record.order_code)}">Track this order</a>
      </div>
      <div class="flex-center mt-24">
        <a class="btn btn-ghost" href="shop.html">Continue shopping</a>
      </div>
    </section>`;
  window.open(payHref, "_blank", "noopener");
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
    customer_email: getFieldValue(form, "email").trim() || currentCustomer()?.email || "",
    payment: "valmont",
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
