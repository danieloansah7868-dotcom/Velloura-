// Home page.

import { loadProducts } from "./catalog.js";
import { renderProductGrid, showDemoNotice } from "./render.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import "./account-ui.js";

async function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  showDemoNotice();

  const grid = document.getElementById("new-drops-grid");
  try {
    const products = await loadProducts();
    const available = products.filter((p) => p.in_stock !== false);
    const recent = [...available].sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0)).slice(0, 4);
    renderProductGrid(grid, recent.length ? recent : available.slice(0, 4));
  } catch (err) {
    grid.innerHTML = `<p class="loading-note">Could not load products. Please refresh or check the Supabase settings.</p>`;
    console.error(err);
  }
}

init();
