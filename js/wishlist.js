// Saved items. Stored in this browser.

const KEY = "velloura_wishlist_v1";

function readIds() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(data) ? data.map(String) : [];
  } catch (err) {
    return [];
  }
}

function writeIds(ids) {
  localStorage.setItem(KEY, JSON.stringify(ids));
  window.dispatchEvent(new CustomEvent("velloura:wishlist-changed"));
}

export function getWishlistIds() {
  return readIds();
}

export function isSaved(id) {
  return readIds().includes(String(id));
}

export function toggleSaved(id) {
  const sid = String(id || "");
  if (!sid) return false;
  const ids = readIds();
  const idx = ids.indexOf(sid);
  if (idx >= 0) ids.splice(idx, 1);
  else ids.unshift(sid);
  writeIds(ids);
  return ids.includes(sid);
}

export function removeSaved(id) {
  writeIds(readIds().filter((item) => item !== String(id)));
}

export function wishlistCount() {
  return readIds().length;
}

export function updateWishBadge() {
  const badge = document.getElementById("wish-badge");
  if (!badge) return;
  const n = wishlistCount();
  badge.textContent = String(n);
  badge.hidden = n === 0;
}
