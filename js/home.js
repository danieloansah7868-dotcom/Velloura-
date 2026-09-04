// Home page: flash sales, new arrivals.

import { loadProducts } from "./catalog.js";
import { renderProductGrid } from "./render.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { timeGreeting } from "./utils.js";
import { currentCustomer } from "./customers.js";
import "./account-ui.js";

function flashEnd() {
  const end = new Date();
  end.setHours(23, 59, 59, 0);
  if (end.getTime() <= Date.now()) end.setDate(end.getDate() + 1);
  return end;
}

function pad(n) {
  return String(n).padStart(2, "0");
}

function tickFlash() {
  const el = document.getElementById("flash-countdown");
  if (!el) return;
  const ms = flashEnd().getTime() - Date.now();
  if (ms <= 0) {
    el.textContent = "00:00:00";
    return;
  }
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  el.textContent = `${pad(h)}:${pad(m)}:${pad(s)}`;
}

async function init() {
  renderCartDrawer();
  bindCartDrawerEvents();
  const kicker = document.querySelector(".hero-kicker");
  if (kicker) kicker.textContent = timeGreeting(currentCustomer()?.name);
  tickFlash();
  setInterval(tickFlash, 1000);

  const flashGrid = document.getElementById("flash-grid");
  const newGrid = document.getElementById("new-drops-grid");
  try {
    const products = await loadProducts();
    const available = products.filter((p) => p.in_stock !== false);
    const flash = available.filter((p) => p.flash_sale || Number(p.compare_at_ghs) > Number(p.price_ghs));
    const recent = [...available].sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0)).slice(0, 4);
    if (flashGrid) {
      renderProductGrid(flashGrid, flash.length ? flash : available.slice(0, 4));
    }
    if (newGrid) {
      renderProductGrid(newGrid, recent.length ? recent : available.slice(0, 4));
    }
  } catch (err) {
    if (flashGrid) flashGrid.innerHTML = `<p class="loading-note">Could not load products.</p>`;
    if (newGrid) newGrid.innerHTML = `<p class="loading-note">Could not load products.</p>`;
    console.error(err);
  }
}

init();
