import { requireAdmin, logout, currentAdmin } from "./auth.js";
import { formatGHS, escapeHtml, getProductImage, buildWhatsAppLink, normalizeDigits, timeGreeting } from "./utils.js";
import { listOrders, updateOrderStatus } from "./store.js";
import { loadProducts, saveProduct, deleteProduct } from "./catalog.js";
import { listCustomers } from "./customers.js";
import { listDeliveryAreas, saveDeliveryAreas, DEFAULT_AREAS } from "./delivery.js";
import { isDemoMode } from "./config.js";
import {
  validatePhotoFile,
  uploadProductPhoto,
  photoToDataUrl,
  removeProductPhoto,
  isBucketPhotoUrl
} from "./product-photos.js";
import { getSellerSession, signInSeller, signOutSeller } from "./seller-session.js";

const allowed = requireAdmin();

let sellerState = { mode: "signed-out" };

const STATUSES = ["new", "confirmed", "packed", "delivered", "cancelled"];

const titleEl = document.getElementById("admin-title");
const emailEl = document.getElementById("admin-email");
const homeEl = document.getElementById("admin-home");
const ordersEl = document.getElementById("admin-orders");
const productsEl = document.getElementById("admin-products");
const customersEl = document.getElementById("admin-customers");
const deliveryEl = document.getElementById("admin-delivery");
const tabs = document.querySelectorAll("[data-tab]");

const session = currentAdmin();
if (emailEl && session) emailEl.textContent = session.email;

const TABS = ["home", "orders", "products", "customers", "delivery"];
let orderFilter = "all";
let openOrderCode = "";

function tabFromHash() {
  const name = (window.location.hash || "#home").slice(1).split("?")[0];
  return TABS.includes(name) ? name : "home";
}

function showTab(name) {
  const tab = TABS.includes(name) ? name : "home";
  const map = { home: homeEl, orders: ordersEl, products: productsEl, customers: customersEl, delivery: deliveryEl };
  Object.entries(map).forEach(([key, el]) => {
    if (el) el.hidden = key !== tab;
  });
  tabs.forEach((el) => el.classList.toggle("active", el.getAttribute("data-tab") === tab));
  const labels = { home: "Dashboard", orders: "Orders", products: "Products", customers: "Customers", delivery: "Delivery" };
  if (titleEl) titleEl.textContent = labels[tab] || "Seller Center";
  if (`#${tab}` !== window.location.hash) {
    window.history.replaceState(null, "", `#${tab}`);
  }
}

tabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();
    showTab(tab.getAttribute("data-tab"));
  });
});

window.addEventListener("hashchange", () => showTab(tabFromHash()));

document.getElementById("admin-logout")?.addEventListener("click", () => {
  logout();
  window.location.href = "login.html";
});

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

function statusClass(status) {
  if (status === "delivered") return "in";
  if (status === "cancelled") return "out";
  if (status === "packed" || status === "confirmed") return "mid";
  return "wait";
}

function paymentLabel(payment) {
  if (payment === "valmont") return "Pay now · Valmont";
  if (payment === "momo") return "Mobile Money";
  if (payment === "pay_on_delivery") return "Pay on delivery";
  return payment || "Not set";
}

function formatWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 16).replace("T", " ");
  return d.toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function itemCount(order) {
  return Array.isArray(order.items)
    ? order.items.reduce((n, i) => n + Number(i.qty || 1), 0)
    : 0;
}

function toWhatsAppNumber(phone) {
  const digits = normalizeDigits(phone);
  if (digits.startsWith("233")) return digits;
  if (digits.startsWith("0") && digits.length === 10) return `233${digits.slice(1)}`;
  return digits;
}

function customerWhatsAppLink(order) {
  const number = toWhatsAppNumber(order.phone);
  if (!number) return "";
  const message = [
    `${timeGreeting(order.customer_name)},`,
    `Order number: ${order.order_code}.`,
    `Status: ${statusLabel(order.status)}.`
  ].join("\n");
  return buildWhatsAppLink(number, message);
}

function statusSelect(order) {
  return `
    <select class="admin-status" data-order="${escapeHtml(order.order_code)}">
      ${STATUSES.map((s) => `<option value="${s}" ${order.status === s ? "selected" : ""}>${statusLabel(s)}</option>`).join("")}
    </select>`;
}

function splitList(value) {
  return String(value || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function productFormHTML(product) {
  const p = product || {
    id: "",
    name: "",
    dept: "fashion",
    collection: "",
    description: "",
    price_ghs: "",
    sizes: [],
    colors: [],
    badge: "",
    in_stock: true,
    image: ""
  };
  return `
    <form class="admin-product-form" id="product-form">
      <input type="hidden" name="id" value="${escapeHtml(p.id)}">
      <div class="admin-form-grid">
        <div class="field">
          <label for="p-name">Name</label>
          <input id="p-name" name="name" required value="${escapeHtml(p.name)}">
        </div>
        <div class="field">
          <label for="p-dept">Category</label>
          <select id="p-dept" name="dept">
            ${["fashion"].map((d) => `<option value="${d}" ${p.dept === d ? "selected" : ""}>Clothes</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label for="p-price">Price (GHS)</label>
          <input id="p-price" name="price_ghs" type="number" min="0" step="1" required value="${escapeHtml(p.price_ghs)}">
        </div>
        <div class="field">
          <label for="p-was">Old price (GHS)</label>
          <input id="p-was" name="compare_at_ghs" type="number" min="0" step="1" value="${escapeHtml(p.compare_at_ghs || "")}">
        </div>
        <div class="field">
          <label for="p-flash">Flash sale</label>
          <select id="p-flash" name="flash_sale">
            <option value="false" ${p.flash_sale ? "" : "selected"}>No</option>
            <option value="true" ${p.flash_sale ? "selected" : ""}>Yes</option>
          </select>
        </div>
        <div class="field">
          <label for="p-collection">Collection</label>
          <select id="p-collection" name="collection">
            ${["streetwear", "modest"].map((c) => `<option value="${c}" ${(p.collection || "streetwear") === c ? "selected" : ""}>${c}</option>`).join("")}
          </select>
        </div>
        <div class="field field-full">
          <label for="p-description">Description</label>
          <textarea id="p-description" name="description">${escapeHtml(p.description || "")}</textarea>
        </div>
        <div class="field">
          <label for="p-sizes">Sizes (comma separated)</label>
          <input id="p-sizes" name="sizes" placeholder="S, M, L" value="${escapeHtml((p.sizes || []).join(", "))}">
        </div>
        <div class="field">
          <label for="p-colors">Colours (comma separated)</label>
          <input id="p-colors" name="colors" placeholder="Black, White" value="${escapeHtml((p.colors || []).join(", "))}">
        </div>
        <div class="field">
          <label for="p-badge">Badge</label>
          <input id="p-badge" name="badge" placeholder="1 of 1" value="${escapeHtml(p.badge || "")}">
        </div>
        <div class="field">
          <label for="p-stock">Stock</label>
          <select id="p-stock" name="in_stock">
            <option value="true" ${p.in_stock !== false ? "selected" : ""}>In stock</option>
            <option value="false" ${p.in_stock === false ? "selected" : ""}>Out of stock</option>
          </select>
        </div>
        <div class="field field-full">
          <label id="p-photo-label">Listing photo</label>
          <div class="admin-image-edit">
            <div class="admin-image-frame" id="p-image-frame">
              <img id="p-image-preview" src="${escapeHtml(getProductImage({ image: p.image }))}" alt="Listing photo preview">
              <span class="admin-pill wait" id="p-image-tag" hidden>New photo</span>
            </div>
            <div class="admin-image-side">
              <div class="admin-image-actions">
                <label class="btn btn-primary" for="p-file">Upload / replace photo</label>
                <input id="p-file" name="file" type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden>
                <button class="btn btn-ghost" type="button" id="p-photo-reset" hidden>Undo new photo</button>
              </div>
              <p class="admin-image-note" id="p-photo-note">JPEG, PNG, WebP or AVIF · up to 5 MB. Big photos are resized automatically.</p>
            </div>
          </div>
        </div>
        <div class="field field-full">
          <label for="p-image">Image link or path (optional)</label>
          <input id="p-image" name="image" placeholder="https://… or assets/products/my-photo.jpg" value="${escapeHtml(p.image || "")}">
          <p class="faint">Only needed when you are not uploading a file above.</p>
        </div>
      </div>
      <div id="product-form-error" class="error-text" hidden></div>
      <div class="admin-form-actions">
        <button class="btn btn-primary" type="submit">${p.id ? "Save changes" : "Add product"}</button>
        ${p.id ? `<button class="btn btn-ghost" type="button" id="cancel-edit">Cancel</button>` : ""}
      </div>
    </form>`;
}

function bindProductPhotoPicker(form, product) {
  const fileInput = form.elements.namedItem("file");
  const previewEl = document.getElementById("p-image-preview");
  const frameEl = document.getElementById("p-image-frame");
  const tagEl = document.getElementById("p-image-tag");
  const noteEl = document.getElementById("p-photo-note");
  const resetBtn = document.getElementById("p-photo-reset");
  const urlInput = document.getElementById("p-image");
  if (!fileInput || !previewEl || !noteEl) return { file: null, previousBucketUrl: "" };

  const savedImage = product?.image || "";
  const previousBucketUrl = isBucketPhotoUrl(savedImage) ? savedImage : "";
  const defaultNote = noteEl.textContent;
  const state = { file: null, objectUrl: "" };

  function setNote(text, isError) {
    noteEl.textContent = text || defaultNote;
    noteEl.classList.toggle("error", Boolean(isError));
  }

  function refreshPreview() {
    if (state.objectUrl) {
      previewEl.src = state.objectUrl;
    } else {
      previewEl.src = getProductImage({ image: urlInput.value || savedImage });
    }
    tagEl.hidden = !state.file;
    resetBtn.hidden = !state.file;
    urlInput.disabled = Boolean(state.file);
  }

  async function chooseFile(file) {
    const invalid = validatePhotoFile(file);
    if (invalid) {
      fileInput.value = "";
      state.file = null;
      if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = "";
      setNote(invalid, true);
      refreshPreview();
      return;
    }
    frameEl.classList.add("is-loading");
    setNote("Preparing photo…");
    try {
      const objectUrl = URL.createObjectURL(file);
      if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = objectUrl;
      state.file = file;
      setNote(`${file.name || "New photo"} ready — it will be saved with this product.`);
    } catch (err) {
      state.file = null;
      if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
      state.objectUrl = "";
      setNote(err.message || "Could not read that photo. Try a different file.", true);
    } finally {
      frameEl.classList.remove("is-loading");
      refreshPreview();
    }
  }

  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    if (file) chooseFile(file);
  });

  resetBtn?.addEventListener("click", () => {
    fileInput.value = "";
    state.file = null;
    if (state.objectUrl) URL.revokeObjectURL(state.objectUrl);
    state.objectUrl = "";
    setNote("");
    refreshPreview();
  });

  urlInput?.addEventListener("input", () => {
    if (!state.file) refreshPreview();
  });

  refreshPreview();
  return state;
}

function bindProductForm(products) {
  const form = document.getElementById("product-form");
  if (!form) return;
  const editingId = String(form.elements.namedItem("id")?.value || "");
  const editing = editingId ? products.find((p) => String(p.id) === editingId) || null : null;
  document.getElementById("cancel-edit")?.addEventListener("click", () => {
    renderProducts(products);
  });
  const photoState = bindProductPhotoPicker(form, editing);
  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const errorEl = document.getElementById("product-form-error");
    const submitBtn = form.querySelector('button[type="submit"]');
    const data = new FormData(form);
    const file = photoState.file;
    const name = String(data.get("name") || "").trim();
    const price = Number(data.get("price_ghs"));
    errorEl.hidden = true;
    if (name.length < 2) {
      errorEl.hidden = false;
      errorEl.textContent = "Please enter a product name.";
      return;
    }
    if (!(price >= 0)) {
      errorEl.hidden = false;
      errorEl.textContent = "Please enter a valid price.";
      return;
    }
    const invalid = validatePhotoFile(file);
    if (invalid) {
      errorEl.hidden = false;
      errorEl.textContent = invalid;
      return;
    }
    const busyLabel = submitBtn?.textContent;
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = file ? "Uploading & saving…" : "Saving…";
    }
    try {
      let image = String(data.get("image") || "").trim();
      if (file) {
        image = isDemoMode
          ? await photoToDataUrl(file)
          : await uploadProductPhoto(file);
      }
      await saveProduct({
        id: String(data.get("id") || ""),
        name,
        dept: String(data.get("dept") || "fashion"),
        collection: String(data.get("collection") || "").trim(),
        description: String(data.get("description") || "").trim(),
        price_ghs: price,
        compare_at_ghs: data.get("compare_at_ghs") ? Number(data.get("compare_at_ghs")) : null,
        flash_sale: String(data.get("flash_sale")) === "true",
        sizes: splitList(data.get("sizes")),
        colors: splitList(data.get("colors")),
        badge: String(data.get("badge") || "").trim(),
        in_stock: String(data.get("in_stock")) !== "false",
        image
      });
      // Best effort: remove the replaced photo from the bucket so it does
      // not pile up as an orphan.
      if (file && !isDemoMode && photoState.previousBucketUrl && photoState.previousBucketUrl !== image) {
        removeProductPhoto(photoState.previousBucketUrl).catch(() => {});
      }
      boot();
      showTab("products");
    } catch (err) {
      errorEl.hidden = false;
      errorEl.textContent = err.message || "Could not save the product. Please try again.";
      errorEl.scrollIntoView({ behavior: "smooth", block: "center" });
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = busyLabel || "Save";
      }
    }
  });
}

function renderHome(orders, products) {
  const pending = orders.filter((o) => o.status === "new" || o.status === "confirmed").length;
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + Number(o.total_ghs || 0), 0);
  const inStock = products.filter((p) => p.in_stock !== false).length;

  homeEl.innerHTML = `
    <div class="admin-stats">
      <article class="admin-stat">
        <span>Orders</span>
        <strong>${orders.length}</strong>
      </article>
      <article class="admin-stat">
        <span>Pending</span>
        <strong>${pending}</strong>
      </article>
      <article class="admin-stat">
        <span>Revenue</span>
        <strong>${formatGHS(revenue)}</strong>
      </article>
      <article class="admin-stat">
        <span>In stock</span>
        <strong>${inStock}</strong>
      </article>
    </div>
    <div class="admin-card" id="seller-connect"></div>
    <div class="admin-card">
      <h2>Recent orders</h2>
      ${ordersTable(orders.slice(0, 6))}
    </div>`;
  renderSellerConnection();
}

function sellerConnectionPill() {
  if (sellerState.mode === "demo") return "Demo";
  if (sellerState.mode === "signed-in") return sellerState.isSeller ? "Live" : "No access";
  return "Not connected";
}

function sellerConnectionText() {
  if (sellerState.mode === "demo") {
    return "Demo mode — Supabase is not connected. Product changes stay in this browser.";
  }
  if (sellerState.mode === "signed-in" && sellerState.isSeller) {
    return "Changes and photos save to the live shop.";
  }
  if (sellerState.mode === "signed-in") {
    return "This account has no seller access yet.";
  }
  return "Not connected — connect a seller account to save changes.";
}

function renderSellerConnection() {
  const box = document.getElementById("seller-connect");
  if (!box) return;

  if (sellerState.mode === "demo") {
    box.innerHTML = `
      <div class="admin-card-head">
        <h2>Live shop connection</h2>
        <span class="admin-pill out">Demo</span>
      </div>
      <p class="muted">Supabase is not connected, so products and photos are saved in this browser only. Add the Supabase URL and key in <code>js/config.js</code> to go live.</p>`;
    return;
  }

  if (sellerState.mode === "signed-in") {
    const ok = sellerState.isSeller !== false;
    box.innerHTML = `
      <div class="admin-card-head">
        <h2>Live shop connection</h2>
        <span class="admin-pill ${ok ? "in" : "wait"}">${ok ? "Connected" : "No seller access"}</span>
      </div>
      <p class="muted">Signed in as <strong>${escapeHtml(sellerState.email)}</strong>. ${
        ok
          ? "Product changes and photos save to the live shop."
          : "This account cannot edit products yet. Add it to the sellers table in Supabase — see “Listing photos” in the README."
      }</p>
      <div class="admin-form-actions">
        <button class="btn btn-ghost" type="button" id="seller-signout">Disconnect</button>
      </div>`;
    return;
  }

  box.innerHTML = `
    <div class="admin-card-head">
      <h2>Live shop connection</h2>
      <span class="admin-pill out">Not connected</span>
    </div>
    <p class="muted">Sign in with your VELLOURA seller account to save product changes and photos to the live shop.</p>
    <form id="seller-signin-form" class="admin-signin-form">
      <div class="field">
        <label for="seller-email">Email</label>
        <input id="seller-email" type="email" autocomplete="username" required>
      </div>
      <div class="field">
        <label for="seller-password">Password</label>
        <input id="seller-password" type="password" autocomplete="current-password" required>
      </div>
      <div id="seller-signin-error" class="error-text" hidden></div>
      <div class="admin-form-actions">
        <button class="btn btn-primary" type="submit">Connect</button>
      </div>
    </form>
    <p class="faint">Create this account once in Supabase → Authentication → Users → “Add user”, then run the sellers insert from the README (“Listing photos”).</p>`;
}

async function handleSellerSignIn(form) {
  const errorEl = document.getElementById("seller-signin-error");
  const submitBtn = form.querySelector('button[type="submit"]');
  const email = form.elements.namedItem("seller-email")?.value || "";
  const password = form.elements.namedItem("seller-password")?.value || "";
  if (errorEl) errorEl.hidden = true;
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Connecting…";
  }
  try {
    sellerState = await signInSeller(email, password);
    boot();
  } catch (err) {
    if (errorEl) {
      errorEl.hidden = false;
      errorEl.textContent = err.message || "Could not sign in. Please try again.";
    }
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = "Connect";
    }
  }
}

function ordersTable(orders) {
  if (!orders.length) {
    return `<p class="muted">No orders yet. Place a test order from the shop, then come back here.</p>`;
  }
  return `
    <div class="admin-table-wrap">
      <table class="admin-table">
        <thead>
          <tr>
            <th>Order</th>
            <th>Customer</th>
            <th>Total</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          ${orders.map((order) => `
            <tr>
              <td>
                <strong>${escapeHtml(order.order_code)}</strong>
                <div class="faint">${escapeHtml(formatWhen(order.created_at))}</div>
              </td>
              <td>
                ${escapeHtml(order.customer_name || "")}
                <div class="faint">${escapeHtml(order.phone || "")} · ${escapeHtml(order.area || "")}</div>
              </td>
              <td>${formatGHS(order.total_ghs)}</td>
              <td><span class="admin-pill ${statusClass(order.status)}">${escapeHtml(statusLabel(order.status))}</span></td>
              <td>
                <button class="btn btn-ghost" type="button" data-open-order="${escapeHtml(order.order_code)}">View</button>
              </td>
            </tr>`).join("")}
        </tbody>
      </table>
    </div>`;
}

function orderCard(order) {
  const items = Array.isArray(order.items) ? order.items : [];
  const wa = customerWhatsAppLink(order);
  const open = openOrderCode === order.order_code;
  return `
    <article class="admin-order ${open ? "is-open" : ""}" id="order-${escapeHtml(order.order_code)}">
      <div class="admin-order-head">
        <div>
          <strong>${escapeHtml(order.order_code)}</strong>
          <div class="faint">${escapeHtml(formatWhen(order.created_at))} · ${itemCount(order)} item${itemCount(order) === 1 ? "" : "s"}</div>
        </div>
        <div class="admin-order-head-actions">
          <span class="admin-pill ${statusClass(order.status)}">${escapeHtml(statusLabel(order.status))}</span>
          ${statusSelect(order)}
        </div>
      </div>
      <div class="admin-order-grid">
        <div>
          <h3>Customer</h3>
          <p>${escapeHtml(order.customer_name || "")}</p>
          <p class="muted">${escapeHtml(order.phone || "")}${order.customer_email ? `<br>${escapeHtml(order.customer_email)}` : ""}</p>
          <p class="muted">${escapeHtml([order.neighborhood, order.area].filter(Boolean).join(", "))}</p>
        </div>
        <div>
          <h3>Payment</h3>
          <p>${escapeHtml(paymentLabel(order.payment))}</p>
          <p class="muted">Items ${formatGHS(order.items_total)} · Delivery ${Number(order.delivery_fee) === 0 ? "Free" : formatGHS(order.delivery_fee)}</p>
          <p><strong>${formatGHS(order.total_ghs)}</strong></p>
        </div>
      </div>
      <div class="admin-order-items">
        <h3>Items</h3>
        <ul>
          ${items.map((item) => {
            const extra = [item.size, item.color].filter(Boolean).join(" / ");
            return `<li>
              <span>${escapeHtml(item.name)}${extra ? ` <span class="faint">(${escapeHtml(extra)})</span>` : ""} × ${item.qty}</span>
              <span>${formatGHS(Number(item.price_ghs || 0) * Number(item.qty || 1))}</span>
            </li>`;
          }).join("")}
        </ul>
      </div>
      ${order.notes ? `<p class="admin-order-note"><strong>Note:</strong> ${escapeHtml(order.notes)}</p>` : ""}
      <div class="admin-form-actions">
        ${wa ? `<a class="btn btn-primary" href="${escapeHtml(wa)}" target="_blank" rel="noopener">WhatsApp customer</a>` : ""}
      </div>
    </article>`;
}

function renderOrders(orders) {
  const pending = orders.filter((o) => o.status === "new").length;
  const filtered = orderFilter === "all" ? orders : orders.filter((o) => o.status === orderFilter);
  const filters = [
    ["all", "All"],
    ["new", "Pending"],
    ["confirmed", "Confirmed"],
    ["packed", "Packed"],
    ["delivered", "Delivered"],
    ["cancelled", "Cancelled"]
  ];
  ordersEl.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-head">
        <h2>Orders ${pending ? `<span class="admin-pill wait">${pending} pending</span>` : ""}</h2>
      </div>
      <div class="choice-group admin-order-filters">
        ${filters.map(([value, label]) => `
          <button class="chip ${orderFilter === value ? "active" : ""}" type="button" data-order-filter="${value}">${label}</button>
        `).join("")}
      </div>
      ${filtered.length
        ? filtered.map(orderCard).join("")
        : `<p class="muted">${orders.length ? "No orders in this status." : "No orders yet. Place a test order from the shop, then come back here."}</p>`}
    </div>`;
}

function renderProducts(products, editingId) {
  const editing = editingId ? products.find((p) => String(p.id) === String(editingId)) : null;
  productsEl.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-head">
        <h2>${editing ? "Edit product" : "Add a product"}</h2>
        <span class="admin-pill ${sellerState.mode === "signed-in" && sellerState.isSeller ? "in" : "wait"}">${sellerConnectionPill()}</span>
      </div>
      <p class="faint">${sellerConnectionText()}</p>
      ${productFormHTML(editing)}
    </div>
    <div class="admin-card">
      <h2>All products</h2>
      <div class="admin-table-wrap">
        <table class="admin-table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            ${products.map((p) => `
              <tr>
                <td class="admin-product-cell">
                  <img src="${escapeHtml(getProductImage(p))}" alt="">
                  <div>
                    <strong>${escapeHtml(p.name)}</strong>
                    <div class="faint">${escapeHtml(p.badge || "")}</div>
                  </div>
                </td>
                <td>${escapeHtml(p.dept || "")}</td>
                <td>${formatGHS(p.price_ghs)}</td>
                <td><span class="admin-pill ${p.in_stock === false ? "out" : "in"}">${p.in_stock === false ? "Out of stock" : "In stock"}</span></td>
                <td class="admin-row-actions">
                  <button class="btn btn-ghost" type="button" data-edit-product="${escapeHtml(String(p.id))}">Edit</button>
                  <button class="btn btn-ghost" type="button" data-delete-product="${escapeHtml(String(p.id))}">Delete</button>
                </td>
              </tr>`).join("")}
          </tbody>
        </table>
      </div>
    </div>`;
  bindProductForm(products);
}

function renderDelivery() {
  if (!deliveryEl) return;
  const areas = listDeliveryAreas();
  deliveryEl.innerHTML = `
    <div class="admin-card">
      <div class="admin-card-head">
        <h2>Greater Accra delivery fees</h2>
      </div>
      <p class="muted">Customers pick an area at checkout. Fees and days are not listed on the shop pages.</p>
      <form id="delivery-form">
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Area</th><th>Fee (GHS)</th><th>Days</th></tr>
            </thead>
            <tbody>
              ${areas.map((area, i) => `
                <tr>
                  <td><input name="name-${i}" value="${escapeHtml(area.name)}" required></td>
                  <td><input name="fee-${i}" type="number" min="0" step="1" value="${escapeHtml(area.fee)}" required></td>
                  <td><input name="days-${i}" value="${escapeHtml(area.days)}" required></td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>
        <input type="hidden" name="count" value="${areas.length}">
        <div class="admin-form-actions">
          <button class="btn btn-primary" type="submit">Save delivery fees</button>
          <button class="btn btn-ghost" type="button" id="reset-delivery">Reset to defaults</button>
        </div>
      </form>
    </div>`;
  document.getElementById("delivery-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const count = Number(form.elements.namedItem("count")?.value || 0);
    const next = [];
    for (let i = 0; i < count; i += 1) {
      next.push({
        name: form.elements.namedItem(`name-${i}`)?.value || "",
        fee: form.elements.namedItem(`fee-${i}`)?.value || 0,
        days: form.elements.namedItem(`days-${i}`)?.value || ""
      });
    }
    saveDeliveryAreas(next);
    renderDelivery();
  });
  document.getElementById("reset-delivery")?.addEventListener("click", () => {
    saveDeliveryAreas(DEFAULT_AREAS);
    renderDelivery();
  });
}

function renderCustomers() {
  const customers = listCustomers();
  customersEl.innerHTML = `
    <div class="admin-card">
      <h2>Customers</h2>
      ${customers.length ? `
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr><th>Name</th><th>Email</th><th>Phone</th></tr>
            </thead>
            <tbody>
              ${customers.map((c) => `
                <tr>
                  <td>${escapeHtml(c.name)}</td>
                  <td>${escapeHtml(c.email)}</td>
                  <td>${escapeHtml(c.phone)}</td>
                </tr>`).join("")}
            </tbody>
          </table>
        </div>` : `<p class="muted">No customer accounts yet.</p>`}
    </div>`;
}

function bindAdminClicks() {
  document.body.addEventListener("click", async (event) => {
    const filterBtn = event.target.closest("[data-order-filter]");
    if (filterBtn) {
      orderFilter = filterBtn.getAttribute("data-order-filter") || "all";
      renderOrders(listOrders());
      return;
    }
    const openBtn = event.target.closest("[data-open-order]");
    if (openBtn) {
      openOrderCode = openBtn.getAttribute("data-open-order") || "";
      showTab("orders");
      renderOrders(listOrders());
      const card = document.getElementById(`order-${openOrderCode}`);
      if (card) card.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    const signOutBtn = event.target.closest("#seller-signout");
    if (signOutBtn) {
      await signOutSeller();
      sellerState = await getSellerSession();
      boot();
      return;
    }
    const editBtn = event.target.closest("[data-edit-product]");
    const deleteBtn = event.target.closest("[data-delete-product]");
    if (editBtn) {
      const id = editBtn.getAttribute("data-edit-product");
      loadProducts().then((products) => {
        renderProducts(products, id);
        showTab("products");
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    }
    if (deleteBtn) {
      const id = deleteBtn.getAttribute("data-delete-product");
      const ok = window.confirm("Delete this product from the shop?");
      if (!ok) return;
      try {
        await deleteProduct(id);
      } catch (err) {
        window.alert(err.message || "Could not delete the product. Please try again.");
        return;
      }
      boot();
      showTab("products");
    }
  });
}

function bindSellerSignIn() {
  document.body.addEventListener("submit", (event) => {
    const form = event.target.closest("#seller-signin-form");
    if (!form) return;
    event.preventDefault();
    handleSellerSignIn(form);
  });
}

function bindStatusChanges() {
  document.body.addEventListener("change", (event) => {
    const select = event.target.closest("[data-order]");
    if (!select) return;
    updateOrderStatus(select.getAttribute("data-order"), select.value);
    boot();
  });
}

let bound = false;

async function boot() {
  try {
    sellerState = await getSellerSession();
  } catch (err) {
    console.error(err);
    sellerState = { mode: "signed-out" };
  }
  const orders = listOrders();
  let products = [];
  try {
    products = await loadProducts();
  } catch (err) {
    console.error(err);
  }
  renderHome(orders, products);
  renderOrders(orders);
  renderProducts(products);
  renderCustomers();
  renderDelivery();
  updateOrdersNav(orders);
  if (!bound) {
    bound = true;
    bindStatusChanges();
    bindAdminClicks();
    bindSellerSignIn();
  }
}

function updateOrdersNav(orders) {
  const link = document.querySelector('[data-tab="orders"]');
  if (!link) return;
  const pending = orders.filter((o) => o.status === "new").length;
  link.textContent = pending ? `Orders (${pending})` : "Orders";
}

if (allowed) {
  showTab(tabFromHash());
  boot();
}
