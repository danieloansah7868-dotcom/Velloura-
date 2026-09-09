// Home page: flipping flash-sale and new-arrivals carousels.

import { loadProducts } from "./catalog.js";
import { productCardHTML, bindProductGrid } from "./render.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { timeGreeting } from "./utils.js";
import { currentCustomer } from "./customers.js";
import "./account-ui.js";

// Curated "new arrivals" rail: the accessory-led market sets (cap / sneaker /
// bag co-ords) plus the freshest market drops. Names match the catalogue.
const ARRIVAL_NAMES = [
  "Pink hoodie, shorts & sneakers set",
  "White harlem 17 tee set with cap",
  "Purple nike two-piece & sneaker set",
  "White top, colour-block shorts & cap set",
  "Stitch lilac tee set with cap",
  "Black tee set with pink cap & bag",
  "Black tee set with red cap & bag",
  "Lilac photo-print tee set with cap & bag",
  "White 90 jersey & grey skirt set with cap",
  "Pink top & light denim shorts set",
  "Blue Polka-Dot Ruffle-Hem Dress",
  "Pink-White Stripe Keyhole Midi Dress"
];

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

function chunk(list, size) {
  const pages = [];
  for (let i = 0; i < list.length; i += size) pages.push(list.slice(i, i + size));
  return pages;
}

// Flipping carousel: pages of cards auto-rotate, with dots, arrows and swipe.
function renderFlip(container, items, intervalMs) {
  if (!container) return;
  container.className = "flip";
  container.innerHTML = "";
  const perPage = 4;
  const pages = chunk(items, perPage);
  if (!pages.length) {
    container.innerHTML = `<p class="loading-note">Nothing here yet.</p>`;
    return;
  }
  const track = document.createElement("div");
  track.className = "flip-track";
  for (const page of pages) {
    const div = document.createElement("div");
    div.className = "flip-page";
    div.innerHTML = page.map(productCardHTML).join("");
    bindProductGrid(div);
    track.appendChild(div);
  }
  container.appendChild(track);
  if (pages.length < 2) return;

  const dots = document.createElement("div");
  dots.className = "flip-dots";
  dots.setAttribute("role", "tablist");
  const dotBtns = pages.map((_, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.setAttribute("aria-label", `Page ${i + 1}`);
    b.addEventListener("click", () => go(i, true));
    dots.appendChild(b);
    return b;
  });
  container.appendChild(dots);

  const prev = document.createElement("button");
  prev.className = "flip-nav prev";
  prev.type = "button";
  prev.setAttribute("aria-label", "Previous");
  prev.textContent = "‹";
  const next = document.createElement("button");
  next.className = "flip-nav next";
  next.type = "button";
  next.setAttribute("aria-label", "Next");
  next.textContent = "›";
  prev.addEventListener("click", () => go(idx - 1, true));
  next.addEventListener("click", () => go(idx + 1, true));
  container.appendChild(prev);
  container.appendChild(next);

  let idx = 0;
  let timer = null;
  function go(i, user) {
    idx = (i + pages.length) % pages.length;
    track.style.transform = `translateX(-${idx * 100}%)`;
    dotBtns.forEach((d, j) => d.classList.toggle("on", j === idx));
    if (user) restart();
  }
  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(idx + 1), intervalMs);
  }
  container.addEventListener("pointerenter", () => timer && clearInterval(timer));
  container.addEventListener("pointerleave", restart);
  let startX = null;
  container.addEventListener("pointerdown", (e) => { startX = e.clientX; });
  container.addEventListener("pointerup", (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
    startX = null;
  });
  go(0);
  restart();
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
    const arrivals = ARRIVAL_NAMES
      .map((n) => available.find((p) => p.name === n))
      .filter(Boolean);
    const recent = [...available].sort((a, b) => (b.sort_order || 0) - (a.sort_order || 0)).slice(0, 8);
    renderFlip(flashGrid, flash.length ? flash : available.slice(0, 4), 4200);
    renderFlip(newGrid, arrivals.length ? arrivals : recent, 6000);
  } catch (err) {
    if (flashGrid) flashGrid.innerHTML = `<p class="loading-note">Could not load products.</p>`;
    if (newGrid) newGrid.innerHTML = `<p class="loading-note">Could not load products.</p>`;
    console.error(err);
  }
}

init();
