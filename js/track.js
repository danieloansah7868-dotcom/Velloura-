import { findOrder } from "./store.js";
import { formatGHS, escapeHtml, getQueryParam } from "./utils.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import "./account-ui.js";

const form = document.getElementById("track-form");
const result = document.getElementById("track-result");
const errorEl = document.getElementById("track-error");

const STEPS = ["new", "confirmed", "packed", "delivered"];

function statusLabel(status) {
  const map = {
    new: "Pending",
    confirmed: "Confirmed",
    packed: "Packed",
    delivered: "Delivered",
    cancelled: "Cancelled"
  };
  return map[status] || status || "Pending";
}

function stepClass(status, step) {
  if (status === "cancelled") return "";
  const current = STEPS.indexOf(status);
  const idx = STEPS.indexOf(step);
  if (idx < 0) return "";
  if (idx < current) return "done";
  if (idx === current) return "current";
  return "";
}

function renderOrder(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const cancelled = order.status === "cancelled";
  result.hidden = false;
  result.innerHTML = `
    <article class="account-order">
      <div class="account-order-head">
        <strong>${escapeHtml(order.order_code)}</strong>
        <span class="admin-pill ${cancelled ? "out" : "in"}">${escapeHtml(statusLabel(order.status))}</span>
      </div>
      <p class="muted">${escapeHtml(order.customer_name || "")} · ${escapeHtml(order.area || "")}</p>
      ${cancelled
        ? `<p class="muted">This order was cancelled. Message Velloura on WhatsApp if you need help.</p>`
        : `<ol class="track-steps">
            ${STEPS.map((step) => `<li class="${stepClass(order.status, step)}">${statusLabel(step)}</li>`).join("")}
          </ol>`}
      <ul>
        ${items.map((item) => {
          const extra = [item.size, item.color].filter(Boolean).join(" / ");
          return `<li>${escapeHtml(item.name)}${extra ? ` (${escapeHtml(extra)})` : ""} × ${item.qty}</li>`;
        }).join("")}
      </ul>
      <p><strong>${formatGHS(order.total_ghs)}</strong></p>
    </article>`;
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const code = form.elements.namedItem("code")?.value || "";
  const phone = form.elements.namedItem("phone")?.value || "";
  const order = findOrder(code, phone);
  if (!order) {
    errorEl.hidden = false;
    errorEl.textContent = "No order matches that code and phone number.";
    result.hidden = true;
    result.innerHTML = "";
    return;
  }
  errorEl.hidden = true;
  renderOrder(order);
});

function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  const code = getQueryParam("code");
  if (code && form?.elements.namedItem("code")) {
    form.elements.namedItem("code").value = code;
  }
}

init();
