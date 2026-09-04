// Shop page: department chips with e-commerce product grid.

import { loadProducts } from "./catalog.js";
import { renderProductGrid, showNotice } from "./render.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { getQueryParam } from "./utils.js";
import { CATEGORY_FILES, scoreProduct } from "./keywords.js";
import "./account-ui.js";

let allProducts = [];
let activeDept = "all";
let activeCollection = "";
let searchQuery = "";
let sortBy = "new";

const deptChips = document.getElementById("dept-chips");
const grid = document.getElementById("shop-grid");
const countEl = document.getElementById("result-count");
const introEl = document.querySelector(".page-intro p");
const sortEl = document.getElementById("shop-sort");

function updateChips() {
  if (!deptChips) return;
  deptChips.querySelectorAll(".chip").forEach((chip) => {
    const collection = chip.getAttribute("data-collection");
    if (collection) {
      const current = activeCollection || "all";
      chip.classList.toggle("active", collection === current);
      return;
    }
    chip.classList.toggle("active", chip.getAttribute("data-dept") === activeDept);
  });
}

function getVisibleProducts() {
  let products = allProducts.filter((p) => p.in_stock !== false);
  if (activeDept !== "all") {
    products = products.filter((p) => p.dept === activeDept);
  }
  if (activeCollection) {
    products = products.filter((p) => p.collection === activeCollection);
  }
  if (searchQuery && searchQuery.trim().length >= 2) {
    const q = searchQuery.trim();
    products = products
      .map((p) => ({ product: p, score: scoreProduct(p, q) }))
      .filter((row) => row.score > 0)
      .sort((a, b) => b.score - a.score)
      .map((row) => row.product);
  }
  if (sortBy === "price-asc") {
    products = [...products].sort((a, b) => Number(a.price_ghs) - Number(b.price_ghs));
  } else if (sortBy === "price-desc") {
    products = [...products].sort((a, b) => Number(b.price_ghs) - Number(a.price_ghs));
  } else if (!(searchQuery && searchQuery.trim().length >= 2)) {
    products = [...products].sort((a, b) => Number(b.sort_order || 0) - Number(a.sort_order || 0));
  }
  return products;
}

function updateGrid() {
  const products = getVisibleProducts();
  if (countEl) countEl.textContent = products.length
    ? `${products.length} ${products.length === 1 ? "piece" : "pieces"}`
    : "";
  renderProductGrid(grid, products);
  if (products.length === 0) {
    grid.innerHTML = `<p class="loading-note">${searchQuery ? "No products match that search." : "No products in this category yet."}</p>`;
  }
}

function applyUrlState() {
  const defaultDept = document.body.getAttribute("data-default-dept") || "";
  const urlDept = getQueryParam("dept");
  const urlCollection = getQueryParam("collection");
  const q = getQueryParam("q").trim();
  if (["jewelry", "hair", "wigs", "thrift"].includes(urlDept) || urlCollection === "thrift") {
    window.location.replace("shop.html");
    return true;
  }
  if (!defaultDept && urlDept && CATEGORY_FILES[urlDept] && !q) {
    window.location.replace(CATEGORY_FILES[urlDept]);
    return true;
  }
  if (urlCollection && CATEGORY_FILES[urlCollection] && !q) {
    window.location.replace(CATEGORY_FILES[urlCollection]);
    return true;
  }
  const dept = urlDept || defaultDept || "all";
  if (dept === "fashion") activeDept = "fashion";
  activeCollection = document.body.getAttribute("data-default-collection") || urlCollection || "";
  searchQuery = q;
  const searchInput = document.querySelector('.header-search input[name="q"]');
  if (searchInput && searchQuery) searchInput.value = searchQuery;
  if (introEl && searchQuery) {
    introEl.textContent = `Results for “${searchQuery}”.`;
  }
  return false;
}

function bindChips() {
  deptChips?.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    if (chip.tagName === "A") return;
    activeDept = chip.getAttribute("data-dept") || "all";
    const url = new URL(window.location.href);
    if (activeDept === "all") url.searchParams.delete("dept");
    else url.searchParams.set("dept", activeDept);
    window.history.replaceState({}, "", url);
    updateChips();
    updateGrid();
  });
  sortEl?.addEventListener("change", () => {
    sortBy = sortEl.value || "new";
    updateGrid();
  });
}

async function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  if (applyUrlState()) return;
  bindChips();
  updateChips();

  try {
    allProducts = await loadProducts();
    updateGrid();
  } catch (err) {
    console.error(err);
    showNotice("Could not load products. Please check the Supabase settings.", "error");
    grid.innerHTML = "";
  }
}

init();
