// Greater Accra delivery areas and fees.
// Shown at checkout only. Admin can edit fees in Seller Center.

const KEY = "velloura_delivery_areas_v1";

export const DEFAULT_AREAS = [
  { name: "Abeka", fee: 20, days: "1 day" },
  { name: "Abokobi", fee: 25, days: "1–2 days" },
  { name: "Ablekuma", fee: 25, days: "1–2 days" },
  { name: "Accra Central", fee: 20, days: "1 day" },
  { name: "Achimota", fee: 20, days: "1 day" },
  { name: "Adabraka", fee: 20, days: "1 day" },
  { name: "Adenta", fee: 20, days: "1 day" },
  { name: "Afienya", fee: 25, days: "1–2 days" },
  { name: "Airport Residential", fee: 20, days: "1 day" },
  { name: "Alajo", fee: 20, days: "1 day" },
  { name: "Amasaman", fee: 25, days: "1–2 days" },
  { name: "Anyaa", fee: 25, days: "1–2 days" },
  { name: "Ashaiman", fee: 25, days: "1–2 days" },
  { name: "Ashongman", fee: 20, days: "1 day" },
  { name: "Asylum Down", fee: 20, days: "1 day" },
  { name: "Bortianor", fee: 25, days: "1–2 days" },
  { name: "Cantonments", fee: 20, days: "1 day" },
  { name: "Circle", fee: 20, days: "1 day" },
  { name: "Dansoman", fee: 20, days: "1 day" },
  { name: "Darkuman", fee: 20, days: "1 day" },
  { name: "Dawhenya", fee: 25, days: "1–2 days" },
  { name: "Dodowa", fee: 25, days: "1–2 days" },
  { name: "Dome", fee: 20, days: "1 day" },
  { name: "Dzorwulu", fee: 20, days: "1 day" },
  { name: "East Legon", fee: 20, days: "1 day" },
  { name: "Gbawe", fee: 25, days: "1–2 days" },
  { name: "Haatso", fee: 20, days: "1 day" },
  { name: "Kaneshie", fee: 20, days: "1 day" },
  { name: "Kasoa", fee: 25, days: "1–2 days" },
  { name: "Kokrobite", fee: 25, days: "1–2 days" },
  { name: "Kpone", fee: 25, days: "1–2 days" },
  { name: "Kwabenya", fee: 20, days: "1 day" },
  { name: "Kwashieman", fee: 25, days: "1–2 days" },
  { name: "Labone", fee: 20, days: "1 day" },
  { name: "Lapaz", fee: 20, days: "1 day" },
  { name: "Lashibi", fee: 20, days: "1 day" },
  { name: "Legon", fee: 20, days: "1 day" },
  { name: "Madina", fee: 20, days: "1 day" },
  { name: "Mallam", fee: 20, days: "1 day" },
  { name: "McCarthy Hill", fee: 20, days: "1 day" },
  { name: "Medie", fee: 25, days: "1–2 days" },
  { name: "Nungua", fee: 20, days: "1 day" },
  { name: "Oduman", fee: 25, days: "1–2 days" },
  { name: "Ofankor", fee: 20, days: "1 day" },
  { name: "Osu", fee: 20, days: "1 day" },
  { name: "Oyibi", fee: 25, days: "1–2 days" },
  { name: "Pokuase", fee: 25, days: "1–2 days" },
  { name: "Prampram", fee: 25, days: "1–2 days" },
  { name: "Ridge", fee: 20, days: "1 day" },
  { name: "Roman Ridge", fee: 20, days: "1 day" },
  { name: "Sakumono", fee: 20, days: "1 day" },
  { name: "Santa Maria", fee: 25, days: "1–2 days" },
  { name: "Sowutuom", fee: 25, days: "1–2 days" },
  { name: "Spintex", fee: 20, days: "1 day" },
  { name: "Taifa", fee: 20, days: "1 day" },
  { name: "Tema", fee: 20, days: "1 day" },
  { name: "Tesano", fee: 20, days: "1 day" },
  { name: "Teshie", fee: 20, days: "1 day" },
  { name: "Weija", fee: 25, days: "1–2 days" }
];

function normalizeArea(row) {
  return {
    name: String(row.name || "").trim(),
    fee: Math.max(0, Number(row.fee) || 0),
    days: String(row.days || "1–2 days").trim() || "1–2 days"
  };
}

export function listDeliveryAreas() {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (Array.isArray(data) && data.length) {
        return data.map(normalizeArea).filter((a) => a.name);
      }
    }
  } catch (err) {
    /* use defaults */
  }
  return DEFAULT_AREAS.map(normalizeArea);
}

export function saveDeliveryAreas(areas) {
  const list = (areas || []).map(normalizeArea).filter((a) => a.name);
  localStorage.setItem(KEY, JSON.stringify(list));
  return list;
}

export function getDeliveryArea(name) {
  const wanted = String(name || "").trim().toLowerCase();
  return listDeliveryAreas().find((a) => a.name.toLowerCase() === wanted) || null;
}

export function areaDeliveryFee(areaName, subtotal, freeFrom) {
  if (Number(subtotal) >= Number(freeFrom || 500)) return 0;
  const area = getDeliveryArea(areaName);
  return area ? area.fee : 20;
}

export function areaDeliveryDays(areaName) {
  const area = getDeliveryArea(areaName);
  return area ? area.days : "1–2 days";
}
