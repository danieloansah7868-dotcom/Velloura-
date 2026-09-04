// Product detail page. Handles size, colour, quantity and add to bag.

import { getProduct, getProductBySlug, loadProducts, relatedProducts } from "./catalog.js";
import { addToCart } from "./store.js";
import { formatGHS, escapeHtml, getProductImage, getQueryParam, discountPercent } from "./utils.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { showNotice, hideNotice, renderProductGrid } from "./render.js";
import { isSaved, toggleSaved, updateWishBadge } from "./wishlist.js";
import { addReview, listReviews, ratingSummary, starsText } from "./reviews.js";
import { currentCustomer } from "./customers.js";
import "./account-ui.js";

let currentProduct = null;
let selectedSize = "";
let selectedColor = "";
let quantity = 1;
let selectedRating = 0;

const detail = document.getElementById("product-detail");
const stickyBar = document.getElementById("sticky-bar");
const stickyPrice = document.getElementById("sticky-price");
const addBtn = document.getElementById("add-to-bag-sticky");
const relatedGrid = document.getElementById("related-grid");
const reviewsEl = document.getElementById("reviews-wrap");

function formatWhen(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return String(iso).slice(0, 10);
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function renderProduct() {
  const p = currentProduct;
  const sizes = Array.isArray(p.sizes) ? p.sizes : [];
  const colors = Array.isArray(p.colors) ? p.colors : [];
  const isOneOfOne = p.badge === "1 of 1";
  const maxQty = isOneOfOne ? 1 : 99;
  const rating = ratingSummary(p.id);

  const deptLabel = p.dept ? `<span class="eyebrow">${escapeHtml(p.dept)}</span>` : "";
  const badge = p.badge ? `<span class="badge">${escapeHtml(p.badge)}</span>` : "";
  const stock = p.in_stock === false
    ? `<span class="badge in-stock">Sold out</span>`
    : `<span class="badge in-stock">In stock</span>`;
  const ratingLine = `<p class="review-summary"><span class="stars">${starsText(rating.average)}</span> ${rating.count ? `${rating.average} · ${rating.count} review${rating.count === 1 ? "" : "s"}` : "No reviews yet"}</p>`;
  const off = discountPercent(p);
  const was = Number(p.compare_at_ghs || 0);
  const priceBlock = was > Number(p.price_ghs)
    ? `<p class="price-big"><span class="price-now">${formatGHS(p.price_ghs)}</span> <span class="price-was">${formatGHS(was)}</span>${off ? ` <span class="price-off">-${off}%</span>` : ""}</p>`
    : `<p class="price-big">${formatGHS(p.price_ghs)}</p>`;
  const flashBadge = p.flash_sale ? `<span class="badge badge-flash">Flash sale</span>` : "";

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

  const jewelryNote = "";

  const quantityBlock = isOneOfOne
    ? `<span class="choice-label">One of one</span>
       <p class="muted">Only one piece is available.</p>`
    : `<span class="choice-label">Quantity</span>
       <div class="qty-picker">
         <button class="btn-chip" id="qty-minus" aria-label="Reduce quantity">-</button>
         <span class="qty-value" id="qty-value">1</span>
         <button class="btn-chip" id="qty-plus" aria-label="Increase quantity">+</button>
       </div>`;

  detail.innerHTML = `
    <div class="product-media">
      <img src="${escapeHtml(getProductImage(p))}" alt="${escapeHtml(p.name)}">
    </div>
    <div class="product-info">
      ${deptLabel}
      ${flashBadge}
      ${badge}
      ${stock}
      <h1>${escapeHtml(p.name)}</h1>
      ${ratingLine}
      ${priceBlock}
      <p>${escapeHtml(p.description || "A stylish piece from Velloura.")}</p>
      ${jewelryNote}
      ${sizeChoices}
      ${colorChoices}
      ${quantityBlock}
      <p><button class="btn btn-ghost" type="button" id="save-product">${isSaved(p.id) ? "Saved" : "Save for later"}</button></p>
      <div class="pdp-perks">
        <p>Delivery in Greater Accra</p>
        <p>Pay with MoMo or card<br><span class="muted">Valmont</span></p>
        <p>Fitting photos on request for clothing</p>
      </div>
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

  addBtn.onclick = () => validateAndAdd();

  document.getElementById("save-product")?.addEventListener("click", (event) => {
    const now = toggleSaved(p.id);
    event.currentTarget.textContent = now ? "Saved" : "Save for later";
    updateWishBadge();
  });
}

function renderReviews() {
  if (!reviewsEl || !currentProduct) return;
  const reviews = listReviews(currentProduct.id);
  const customer = currentCustomer();
  reviewsEl.innerHTML = `
    <div class="section-head">
      <h2>Reviews</h2>
    </div>
    ${reviews.length
      ? reviews.map((review) => `
        <article class="review-card">
          <div class="review-head">
            <strong>${escapeHtml(review.name)}</strong>
            <span class="stars">${starsText(review.rating)}</span>
          </div>
          <p class="muted">${escapeHtml(formatWhen(review.created_at))}</p>
          <p>${escapeHtml(review.text)}</p>
        </article>`).join("")
      : `<p class="muted">No reviews yet. Be the first to review this piece.</p>`}
    <form class="form-card" id="review-form">
      <h2>Write a review</h2>
      <div class="field">
        <label for="review-name">Name</label>
        <input id="review-name" name="name" type="text" required value="${escapeHtml(customer?.name || "")}">
      </div>
      <div class="field">
        <span class="choice-label">Rating</span>
        <div class="star-picker" id="star-picker">
          ${[1, 2, 3, 4, 5].map((n) => `<button class="star-btn" type="button" data-star="${n}" aria-label="${n} stars">★</button>`).join("")}
        </div>
      </div>
      <div class="field">
        <label for="review-text">Your review</label>
        <textarea id="review-text" name="text" required placeholder="How was the fit, colour or quality?"></textarea>
      </div>
      <p id="review-error" class="error-text" hidden></p>
      <button class="btn btn-primary" type="submit">Post review</button>
    </form>`;

  const picker = document.getElementById("star-picker");
  selectedRating = 0;
  picker?.addEventListener("click", (event) => {
    const btn = event.target.closest("[data-star]");
    if (!btn) return;
    selectedRating = Number(btn.getAttribute("data-star"));
    picker.querySelectorAll(".star-btn").forEach((el) => {
      el.classList.toggle("on", Number(el.getAttribute("data-star")) <= selectedRating);
    });
  });

  document.getElementById("review-form")?.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const errorEl = document.getElementById("review-error");
    const result = addReview({
      productId: currentProduct.id,
      name: form.elements.namedItem("name")?.value || "",
      rating: selectedRating,
      text: form.elements.namedItem("text")?.value || ""
    });
    if (!result.ok) {
      errorEl.hidden = false;
      errorEl.textContent = result.error;
      return;
    }
    renderProduct();
    renderReviews();
  });
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
  const id = getQueryParam("id");
  const slugFromPath = (window.location.pathname.match(/\/p\/([^/]+)\.html$/) || [])[1];
  const slug = document.body.getAttribute("data-product-slug") || (slugFromPath ? decodeURIComponent(slugFromPath) : "");
  if (!id && !slug) {
    detail.innerHTML = `<p class="loading-note">Product not found.</p>`;
    return;
  }
  try {
    const products = await loadProducts();
    let product = slug
      ? products.find((p) => p.slug === slug) || await getProductBySlug(slug)
      : null;
    if (!product && id) {
      product = products.find((p) => String(p.id) === String(id)) || await getProduct(id);
    }
    if (!product) {
      detail.innerHTML = `<p class="loading-note">Product not found.</p>`;
      return;
    }
    if (id && product.slug && !slug) {
      window.location.replace(`p/${encodeURIComponent(product.slug)}.html`);
      return;
    }
    currentProduct = product;
    renderProduct();
    renderReviews();
    document.title = `${product.name} | VELLOURA`;
    const desc = document.querySelector('meta[name="description"]');
    if (desc) {
      desc.setAttribute("content", `${product.name} — GHS ${product.price_ghs}. ${product.description || "Shop VELLOURA in Accra."}`.slice(0, 160));
    }
    const related = relatedProducts(product, products, 4);
    if (relatedGrid) {
      if (related.length) renderProductGrid(relatedGrid, related);
      else relatedGrid.innerHTML = `<p class="muted">No similar pieces right now.</p>`;
    }
  } catch (err) {
    console.error(err);
    detail.innerHTML = `<p class="loading-note">Could not load this product. Please try again.</p>`;
  }
}

init();
