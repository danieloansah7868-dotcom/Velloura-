// Product reviews. Stored in this browser (demo).

const KEY = "velloura_reviews_v1";

const SEED = {
  "1": [
    { id: "r1", name: "Ama", rating: 5, text: "Soft set and true to size. I wore it the same week.", created_at: "2026-08-12T10:00:00.000Z" },
    { id: "r2", name: "Efua", rating: 4, text: "Nice fit. Colour is a bit darker than the photo.", created_at: "2026-08-20T14:00:00.000Z" }
  ],
  "8": [
    { id: "r3", name: "Akosua", rating: 5, text: "Light on the ear and they look expensive.", created_at: "2026-07-30T09:00:00.000Z" }
  ],
  "13": [
    { id: "r4", name: "Yaa", rating: 5, text: "Glueless and easy to wear. Hair is soft.", created_at: "2026-08-05T16:20:00.000Z" },
    { id: "r5", name: "Nana", rating: 4, text: "Pretty wig. Took a day extra to arrive in Kumasi.", created_at: "2026-08-18T11:00:00.000Z" }
  ],
  "15": [
    { id: "r6", name: "Serwaa", rating: 5, text: "The wrap dress is easy and the fabric feels good.", created_at: "2026-08-22T13:00:00.000Z" }
  ]
};

function readAll() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) {
      localStorage.setItem(KEY, JSON.stringify(SEED));
      return structuredClone(SEED);
    }
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : {};
  } catch (err) {
    return structuredClone(SEED);
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
