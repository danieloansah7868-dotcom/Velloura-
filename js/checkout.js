// Checkout: Greater Accra delivery, Pay now, order save and success screen.

import { CONFIG } from "./config.js";
import {
  formatGHS,
  isValidGhanaPhone,
  normalizeDigits,
  escapeHtml,
  buildWhatsAppLink
} from "./utils.js";
import {
  getCart,
  cartSubtotal,
  clearCart,
  deliveryFee,
  deliveryDays,
  isDeliverableArea,
  placeOrder,
  buildOrderSummaryText
} from "./store.js";
import { listDeliveryAreas } from "./delivery.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { showNotice, hideNotice } from "./render.js";
import { currentCustomer } from "./customers.js";
import "./account-ui.js";

const content = document.getElementById("checkout-content");
const areas = listDeliveryAreas();
let selectedArea = areas[0]?.name || "East Legon";

function renderOrderItems() {
  return getCart().map((item) => `
    <div class="summary-row">
      <span>${escapeHtml(item.name)}${item.size ? ` / ${escapeHtml(item.size)}` : ""}${item.color ? ` / ${escapeHtml(item.color)}` : ""} x ${item.qty}</span>
      <span>${formatGHS(item.price_ghs * item.qty)}</span>
    </div>`).join("");
}

function areaOptions(selected) {
  return areas.map((area) => {
    const isOn = area.name === selected;
    return `<option value="${escapeHtml(area.name)}" ${isOn ? "selected" : ""}>${escapeHtml(area.name)}</option>`;
  }).join("");
}

function renderCheckout() {
  const items = getCart();
  const subtotal = cartSubtotal();
  const fee = deliveryFee(subtotal, selectedArea);
  const days = deliveryDays(selectedArea);
  const total = subtotal + fee;

  const existingForm = document.getElementById("checkout-form");
  const customer = currentCustomer();
  const prev = {};
  if (existingForm) {
    ["customer_name", "phone", "email", "area", "notes"].forEach((name) => {
      const el = existingForm.elements.namedItem(name);
      if (el) prev[name] = el.value;
    });
  } else if (customer) {
    prev.customer_name = customer.name;
    prev.phone = customer.phone;
    prev.email = customer.email || "";
  }
  if (prev.area) selectedArea = prev.area;

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
        <div class="summary-row"><span>Arrives</span><span>${escapeHtml(days)}</span></div>
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
            <span class="hint">Use this number to track your order.</span>
          </div>
          <div class="field">
            <label for="email">Email <span class="hint">(optional)</span></label>
            <input id="email" name="email" type="email" autocomplete="email" value="${escapeHtml(prev.email || "")}">
          </div>
          <div class="field">
            <label for="area">Area in Greater Accra</label>
            <select id="area" name="area" required>
              ${areaOptions(selectedArea)}
            </select>
            <span class="hint">We deliver in Greater Accra only. Fee and delivery days update when you pick an area.</span>
          </div>
          <div class="field">
            <label for="notes">Landmark or note <span class="hint">(optional)</span></label>
            <textarea id="notes" name="notes">${escapeHtml(prev.notes || "")}</textarea>
          </div>
        </div>

        <div class="form-card">
          <h2>Payment</h2>
          <label class="radio-card selected">
            <input type="radio" name="payment" value="valmont" checked>
            <span class="radio-body">
              <strong>Pay now</strong>
              <span>Valmont · MTN MoMo, Vodafone Cash, AirtelTigo or card</span>
            </span>
          </label>
        </div>

        <div class="notice-box">
          Tap Pay now. Track with your phone number. WhatsApp is for your order number and status.
        </div>

        <div id="form-error" class="error-text" hidden></div>
        <button id="place-order" type="submit" class="btn btn-primary btn-full pay-now-btn">Pay now</button>
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

  if (items.length) {
    placeBtn.innerHTML = `<span>Pay now · ${formatGHS(total)}</span><small>Valmont</small>`;
  } else {
    placeBtn.textContent = "Your bag is empty";
  }
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
  if (!isDeliverableArea(area)) errors.push("Please choose a Greater Accra area.");
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
  const days = deliveryDays(record.area);

  content.innerHTML = `
    <section class="section">
      <div class="success-card">
        <div class="success-icon">V</div>
        <h1>Order received</h1>
        <p>Thank you, ${escapeHtml(record.customer_name)}. Pay now. Delivery to ${escapeHtml(record.area || "Greater Accra")} in ${escapeHtml(days)}.</p>
        <div class="code-pill">${escapeHtml(record.order_code)}</div>
        <p class="muted">Track with your phone number.<br>
          WhatsApp is for your order number and status.<br>
          Items: ${formatGHS(record.items_total)} · Delivery: ${record.delivery_fee === 0 ? "Free" : formatGHS(record.delivery_fee)}<br>
          <strong>Total: ${formatGHS(record.total_ghs)}</strong></p>
        <a class="btn btn-primary btn-full pay-now-btn" href="${escapeHtml(payHref)}" target="_blank" rel="noopener">
          <span>Pay now</span>
          <small>Valmont</small>
        </a>
        <a class="btn btn-ghost btn-full" href="${waLink}" target="_blank" rel="noopener">WhatsApp order number</a>
        <a class="btn btn-ghost btn-full" href="track.html?phone=${encodeURIComponent(record.phone)}">Track with phone</a>
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
    neighborhood: area,
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
    showNotice("We could not save your order. Please try again or send the order number on WhatsApp.", "error");
  }
}

function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  renderCheckout();
}

init();
