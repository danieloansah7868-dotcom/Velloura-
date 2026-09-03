// Shop page: department chips with e-commerce product grid.

import { loadProducts } from "./catalog.js";
import { renderProductGrid, showDemoNotice, showNotice } from "./render.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { getQueryParam } from "./utils.js";

let allProducts = [];
let activeDept = "all";

const deptChips = document.getElementById("dept-chips");
const grid = document.getElementById("shop-grid");
const countEl = document.getElementById("result-count");

function updateChips() {
  deptChips.querySelectorAll(".chip").forEach((chip) => {
    chip.classList.toggle("active", chip.getAttribute("data-dept") === activeDept);
  });
}

function getVisibleProducts() {
  let products = allProducts.filter((p) => p.in_stock !== false);
  if (activeDept !== "all") {
    products = products.filter((p) => p.dept === activeDept);
  }
  return products;
}

function updateGrid() {
  const products = getVisibleProducts();
  if (countEl) countEl.textContent = products.length
    ? `${products.length} ${products.length === 1 ? "product" : "products"}`
    : "";
  renderProductGrid(grid, products);
  if (products.length === 0) {
    grid.innerHTML = `<p class="loading-note">No products in this category yet.</p>`;
  }
}

function applyUrlState() {
  const dept = getQueryParam("dept") || document.body.getAttribute("data-default-dept") || "all";
  if (["fashion", "jewelry", "hair", "wigs"].includes(dept)) activeDept = dept;
}

function bindChips() {
  deptChips.addEventListener("click", (event) => {
    const chip = event.target.closest(".chip");
    if (!chip) return;
    activeDept = chip.getAttribute("data-dept");
    updateChips();
    updateGrid();
  });
}

async function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  showDemoNotice();
  applyUrlState();
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
