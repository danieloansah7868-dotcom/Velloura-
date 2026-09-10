// Product reviews.
// Reviews are written by shoppers in their own browser (localStorage) and
// stay private to that browser until a real backend reviews feature exists.
// There are deliberately NO seeded demo reviews: invented testimonials are
// fake proof.

const KEY = "velloura_reviews_v1";

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : {};
  } catch (err) {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(KEY, JSON.stringify(data));
}

export function listReviews(productId) {
  const all = readAll();
  const list = all[String(productId)] || [];
  return list.slice().sort((a, b) => String(b.created_at || "").localeCompare(String(a.created_at || "")));
}

export function ratingSummary(productId) {
  const list = listReviews(productId);
  if (!list.length) return { count: 0, average: 0 };
  const sum = list.reduce((n, r) => n + Number(r.rating || 0), 0);
  return { count: list.length, average: Math.round((sum / list.length) * 10) / 10 };
}

export function addReview({ productId, name, rating, text }) {
  const cleanName = String(name || "").trim();
  const cleanText = String(text || "").trim();
  const stars = Number(rating);
  if (cleanName.length < 2) return { ok: false, error: "Please enter your name." };
  if (!(stars >= 1 && stars <= 5)) return { ok: false, error: "Please choose a star rating." };
  if (cleanText.length < 8) return { ok: false, error: "Please write a short review." };
  const all = readAll();
  const id = String(productId);
  const review = {
    id: `r-${Date.now()}`,
    name: cleanName,
    rating: stars,
    text: cleanText,
    created_at: new Date().toISOString()
  };
  all[id] = [review, ...(all[id] || [])];
  writeAll(all);
  return { ok: true, review };
}

export function starsText(value) {
  const n = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  return `${"★".repeat(n)}${"☆".repeat(5 - n)}`;
}
