import { loadProducts } from "./catalog.js";
import { renderProductGrid, showDemoNotice, showNotice } from "./render.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { getWishlistIds, updateWishBadge } from "./wishlist.js";
import "./account-ui.js";

const grid = document.getElementById("wishlist-grid");
const empty = document.getElementById("wishlist-empty");

async function renderSaved() {
  updateWishBadge();
  try {
    const products = await loadProducts();
    const ids = getWishlistIds();
    const saved = ids
      .map((id) => products.find((p) => String(p.id) === String(id)))
      .filter(Boolean);
    if (!saved.length) {
      if (grid) grid.innerHTML = "";
      if (empty) empty.hidden = false;
      return;
    }
    if (empty) empty.hidden = true;
    renderProductGrid(grid, saved);
  } catch (err) {
    console.error(err);
    showNotice("Could not load saved items.", "error");
  }
}

function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  showDemoNotice();
  renderSaved();
  window.addEventListener("velloura:wishlist-changed", () => renderSaved());
}

init();
