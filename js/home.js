// Home page: flipping flash-sale and new-arrivals carousels + trending grid.

import { loadProducts } from "./catalog.js";
import { productCardHTML, bindProductGrid, renderProductGrid } from "./render.js";
import { bindCartDrawerEvents, renderCartDrawer } from "./cart-helpers.js";
import { timeGreeting } from "./utils.js";
import { currentCustomer } from "./customers.js";
import { productTypes } from "./keywords.js";
import "./account-ui.js";

// Curated 12 new arrival drops (accessory-led market sets & fresh drops)
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
  "Yellow one-shoulder top, shorts & cap set",
  "Olive photo-print tee set with bag & cap"
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

// Flipping carousel: pages of cards auto-rotate with smooth hardware acceleration, dots, arrows and swipe.
function renderFlip(container, items, intervalMs = 4500) {
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
  function go(i, user = false) {
    idx = (i + pages.length) % pages.length;
    track.style.transform = `translate3d(-${idx * 100}%, 0, 0)`;
    dotBtns.forEach((d, j) => d.classList.toggle("on", j === idx));
    if (user) restart();
  }
  function restart() {
    if (timer) clearInterval(timer);
    timer = setInterval(() => go(idx + 1), intervalMs);
  }

  // Handle pointer gestures without freezing desktop on mouse hover
  let startX = null;
  let startY = null;
  let isPointerDown = false;

  container.addEventListener("pointerdown", (e) => {
    if (e.target.closest(".flip-nav") || e.target.closest(".flip-dots") || e.target.closest(".btn-card-add") || e.target.closest(".wish-toggle")) return;
    startX = e.clientX;
    startY = e.clientY;
    isPointerDown = true;
    if (timer) clearInterval(timer);
  }, { passive: true });

  container.addEventListener("pointerup", (e) => {
    if (!isPointerDown || startX === null) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - (startY ?? e.clientY);
    if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
      go(idx + (dx < 0 ? 1 : -1), true);
    } else {
      restart();
    }
    startX = null;
    startY = null;
    isPointerDown = false;
  }, { passive: true });

  container.addEventListener("pointercancel", () => {
    startX = null;
    startY = null;
    isPointerDown = false;
    restart();
  }, { passive: true });

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
  const trendingGrid = document.getElementById("trending-grid");
  const homeChips = document.getElementById("home-chips");

  try {
    const products = await loadProducts();
    const available = products.filter((p) => p.in_stock !== false);

    // 1. Flash sales: 12 products (3 full 4-card pages)
    const flash = available.filter((p) => p.flash_sale || Number(p.compare_at_ghs) > Number(p.price_ghs)).slice(0, 12);

    // 2. New arrivals: 12 products (3 full 4-card pages)
    const arrivalFound = ARRIVAL_NAMES
      .map((n) => available.find((p) => p.name === n))
      .filter(Boolean);
    const flashIds = new Set(flash.map((p) => String(p.id)));
    const arrivals = arrivalFound.length >= 12
      ? arrivalFound.slice(0, 12)
      : [...arrivalFound, ...available.filter((p) => !flashIds.has(String(p.id)) && !arrivalFound.includes(p))].slice(0, 12);

    // 3. Trending collection grid: 26 products (making exactly 50 total products across home: 12 + 12 + 26 = 50)
    const usedIds = new Set([...flash.map((p) => String(p.id)), ...arrivals.map((p) => String(p.id))]);
    const remaining = available.filter((p) => !usedIds.has(String(p.id)));
    const defaultTrending = remaining.slice(0, 26);

    renderFlip(flashGrid, flash.length ? flash : available.slice(0, 12), 4200);
    renderFlip(newGrid, arrivals.length ? arrivals : available.slice(0, 12), 5000);

    if (trendingGrid) {
      const renderTrending = (type) => {
        let list = defaultTrending;
        if (type && type !== "all") {
          list = remaining.filter((p) => productTypes(p).includes(type)).slice(0, 24);
          if (!list.length) {
            list = available.filter((p) => productTypes(p).includes(type)).slice(0, 24);
          }
        }
        renderProductGrid(trendingGrid, list);
      };

      renderTrending("all");

      if (homeChips) {
        homeChips.addEventListener("click", (e) => {
          const btn = e.target.closest("button[data-type]");
          if (!btn) return;
          homeChips.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
          btn.classList.add("active");
          const type = btn.getAttribute("data-type");
          renderTrending(type);
        });
      }
    }
  } catch (err) {
    if (flashGrid) flashGrid.innerHTML = `<p class="loading-note">Could not load products.</p>`;
    if (newGrid) newGrid.innerHTML = `<p class="loading-note">Could not load products.</p>`;
    if (trendingGrid) trendingGrid.innerHTML = `<p class="loading-note">Could not load products.</p>`;
    console.error(err);
  }
}

init();
