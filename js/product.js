// Product detail page. Handles size, colour, quantity and add to bag.

import { getProduct } from "./catalog.js";
import { addToCart } from "./store.js";
import { formatGHS, escapeHtml, getProductImage, getQueryParam } from "./utils.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { showDemoNotice, showNotice, hideNotice } from "./render.js";

let currentProduct = null;
let selectedSize = "";
let selectedColor = "";
let quantity = 1;

const detail = document.getElementById("product-detail");
const stickyBar = document.getElementById("sticky-bar");
const stickyPrice = document.getElementById("sticky-price");
const addBtn = document.getElementById("add-to-bag-sticky");

function renderProduct() {
  const p = currentProduct;
  const sizes = Array.isArray(p.sizes) ? p.sizes : [];
  const colors = Array.isArray(p.colors) ? p.colors : [];
  const isOneOfOne = p.badge === "1 of 1";
  const maxQty = isOneOfOne ? 1 : 99;

  const badge = p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : "";
  const stock = p.in_stock === false
    ? `<span class="badge in-stock">Sold out</span>`
    : `<span class="badge in-stock">In stock</span>`;

  const sizeChoices = sizes.length
    ? `<span class="choice-label">Size</span>
       <div class="choice-group" id="size-choices">
         ${sizes.map((s) => `<button class="choice" data-size="${escapeHtml(s)}">${escapeHtml(s)}</button>`).join("")}
       </div>`
    : "";

  const colorChoices = colors.length
    ? `<span class="choice-label">Colour</span>
       <div class="choice-group" id="color-choices">
         ${colors.map((c) => `<button class="choice" data-color="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join("")}
       </div>`
    : "";

  const jewelryNote = p.dept === "jewelry"
    ? `<p class="muted">${escapeHtml(p.description || "Gold plated and tarnish free.")}</p>`
    : "";

  const quantityBlock = isOneOfOne
    ? `<span class="choice-label">One of one</span>
       <p class="muted">Only one piece is available.</p>`
    : `<div class="qty-picker">
         <button class="btn-chip" id="qty-minus" aria-label="Reduce quantity">-</button>
         <span class="qty-value" id="qty-value">1</span>
         <button class="btn-chip" id="qty-plus" aria-label="Increase quantity">+</button>
       </div>`;

  detail.innerHTML = `
    <div class="product-media">
      <img src="${escapeHtml(getProductImage(p))}" alt="${escapeHtml(p.name)}">
    </div>
    <div class="product-info">
      ${badge}
      ${stock}
      <h1>${escapeHtml(p.name)}</h1>
      <p class="price-big">${formatGHS(p.price_ghs)}</p>
      <p>${escapeHtml(p.description || "A stylish piece from Velloura.")}</p>
      ${jewelryNote}
      ${sizeChoices}
      ${colorChoices}
      ${quantityBlock}
    </div>`;

  stickyBar.classList.remove("hidden");
  stickyPrice.textContent = formatGHS(p.price_ghs * quantity);

  const minus = document.getElementById("qty-minus");
  const plus = document.getElementById("qty-plus");
  const qtyValue = document.getElementById("qty-value");
  if (minus) minus.addEventListener("click", () => {
    quantity = Math.max(1, quantity - 1);
    qtyValue.textContent = String(quantity);
    stickyPrice.textContent = formatGHS(p.price_ghs * quantity);
  });
  if (plus) plus.addEventListener("click", () => {
    quantity = Math.min(maxQty, quantity + 1);
    qtyValue.textContent = String(quantity);
    stickyPrice.textContent = formatGHS(p.price_ghs * quantity);
  });

  const sizeGroup = document.getElementById("size-choices");
  if (sizeGroup) sizeGroup.addEventListener("click", (event) => {
    const btn = event.target.closest(".choice");
    if (!btn) return;
    selectedSize = btn.getAttribute("data-size") || "";
    sizeGroup.querySelectorAll(".choice").forEach((el) => el.classList.toggle("selected", el === btn));
  });

  const colorGroup = document.getElementById("color-choices");
  if (colorGroup) colorGroup.addEventListener("click", (event) => {
    const btn = event.target.closest(".choice");
    if (!btn) return;
    selectedColor = btn.getAttribute("data-color") || "";
    colorGroup.querySelectorAll(".choice").forEach((el) => el.classList.toggle("selected", el === btn));
  });

  if (sizes.length) {
    selectedSize = sizes[0];
    document.querySelector("#size-choices .choice")?.classList.add("selected");
  }
  if (colors.length) {
    selectedColor = colors[0];
    document.querySelector("#color-choices .choice")?.classList.add("selected");
  }

  addBtn.addEventListener("click", () => validateAndAdd());
}

function validateAndAdd() {
  if (!currentProduct) return;
  if (currentProduct.in_stock === false) {
    showNotice("This item is sold out.", "warn");
    return;
  }
  if (Array.isArray(currentProduct.sizes) && currentProduct.sizes.length && !selectedSize) {
    showNotice("Please choose a size.", "warn");
    return;
  }
  if (Array.isArray(currentProduct.colors) && currentProduct.colors.length && !selectedColor) {
    showNotice("Please choose a colour.", "warn");
    return;
  }
  addToCart(currentProduct, { size: selectedSize, color: selectedColor, qty: quantity });
  hideNotice();
  renderCartDrawer();
  const drawer = document.getElementById("cart-drawer");
  const overlay = document.getElementById("cart-overlay");
  drawer?.classList.add("open");
  overlay?.classList.add("show");
  document.body.classList.add("no-scroll");
}

async function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  showDemoNotice();
  const id = getQueryParam("id");
  if (!id) {
    detail.innerHTML = `<p class="loading-note">Product not found.</p>`;
    return;
  }
  try {
    const product = await getProduct(id);
    if (!product) {
      detail.innerHTML = `<p class="loading-note">Product not found.</p>`;
      return;
    }
    currentProduct = product;
    renderProduct();
    document.title = `${product.name} - VELLOURA`;
  } catch (err) {
    console.error(err);
    detail.innerHTML = `<p class="loading-note">Could not load this product. Please try again.</p>`;
  }
}

init();
