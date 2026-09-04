import { currentCustomer, logoutCustomer, updateCustomer } from "./customers.js";
import { listOrders } from "./store.js";
import { formatGHS, escapeHtml, timeGreeting } from "./utils.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";

const customer = currentCustomer();
if (!customer) {
  window.location.replace("account-login.html");
} else {

renderCartDrawer();
bindCartDrawerEvents();

const nameEl = document.getElementById("account-name");
const emailEl = document.getElementById("account-email");
const ordersEl = document.getElementById("account-orders");
const form = document.getElementById("account-form");
const notice = document.getElementById("account-notice");

if (nameEl) nameEl.textContent = timeGreeting(customer.name);
if (emailEl) emailEl.textContent = customer.email;

if (form) {
  form.elements.namedItem("name").value = customer.name;
  form.elements.namedItem("phone").value = customer.phone;
}

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

function renderOrders() {
  if (!ordersEl) return;
  const orders = listOrders().filter((order) => (
    order.customer_email === customer.email || order.phone === customer.phone
  ));
  if (!orders.length) {
    ordersEl.innerHTML = `<p class="muted">You have no orders yet. <a href="shop.html">Start shopping</a></p>`;
    return;
  }
  ordersEl.innerHTML = orders.map((order) => `
    <article class="account-order">
      <div class="account-order-head">
        <strong>${escapeHtml(order.order_code)}</strong>
        <span class="admin-pill in">${escapeHtml(statusLabel(order.status))}</span>
      </div>
      <p class="muted">${escapeHtml((order.created_at || "").slice(0, 16).replace("T", " "))} · ${escapeHtml(order.area || "")}</p>
      <ul>
        ${(order.items || []).map((item) => `<li>${escapeHtml(item.name)} x ${item.qty}</li>`).join("")}
      </ul>
      <p><strong>${formatGHS(order.total_ghs)}</strong></p>
      <p><a href="track.html?code=${encodeURIComponent(order.order_code)}">Track</a></p>
    </article>`).join("");
}

form?.addEventListener("submit", (event) => {
  event.preventDefault();
  const result = updateCustomer({
    name: form.elements.namedItem("name").value,
    phone: form.elements.namedItem("phone").value
  });
  if (!result.ok) {
    notice.hidden = false;
    notice.className = "notice-box error";
    notice.textContent = result.error;
    return;
  }
  notice.hidden = false;
  notice.className = "notice-box";
  notice.textContent = "Details saved.";
  if (nameEl) nameEl.textContent = result.customer.name;
});

document.getElementById("account-logout")?.addEventListener("click", () => {
  logoutCustomer();
  window.location.href = "index.html";
});

renderOrders();
}
