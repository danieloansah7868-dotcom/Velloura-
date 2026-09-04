// Greater Accra delivery areas and fees.
// Shown at checkout only. Admin can edit fees in Seller Center.

const KEY = "velloura_delivery_areas_v3";

const INNER = { fee: 30, days: "1 day" };
const FAR = { fee: 30, days: "1–2 days" };
const NEAR = { fee: 25, days: "1–2 days" };

// Inner Accra and Circle: GHS 30
const INNER_NAMES = [
  "Abeka",
  "Abelenkpe",
  "Accra Central",
  "Accra New Town",
  "Achimota",
  "Adabraka",
  "Adenta",
  "Airport Residential",
  "Alajo",
  "Ashongman",
  "Asylum Down",
  "Burma Camp",
  "Cantonments",
  "Circle",
  "Dansoman",
  "Darkuman",
  "Dome",
  "Dzorwulu",
  "East Legon",
  "Haatso",
  "Kaneshie",
  "Kokomlemle",
  "Korle Bu",
  "Kwabenya",
  "La",
  "Labadi",
  "Labone",
  "Lapaz",
  "Lashibi",
  "Legon",
  "Madina",
  "Mallam",
  "Mamprobi",
  "Mataheko",
  "McCarthy Hill",
  "Nima",
  "North Kaneshie",
  "North Legon",
  "Nungua",
  "Odorkor",
  "Ofankor",
  "Osu",
  "Ridge",
  "Roman Ridge",
  "Sakumono",
  "Spintex",
  "Taifa",
  "Tesano",
  "Teshie",
  "West Legon",
  "37"
];

// Near Pokuase
const NEAR_NAMES = ["Amasaman", "Pokuase"];

// Far from Pokuase: GHS 30
const FAR_NAMES = [
  "Abokobi",
  "Ablekuma",
  "Afienya",
  "Anyaa",
  "Ashaiman",
  "Bortianor",
  "Dawhenya",
  "Dodowa",
  "Gbawe",
  "Kasoa",
  "Klagon",
  "Kokrobite",
  "Kpone",
  "Kwashieman",
  "Medie",
  "Oduman",
  "Oyibi",
  "Prampram",
  "Santa Maria",
  "Sowutuom",
  "Tema",
  "Weija"
];

export const DEFAULT_AREAS = [
  ...INNER_NAMES.map((name) => ({ name, ...INNER })),
  ...NEAR_NAMES.map((name) => ({ name, ...NEAR })),
  ...FAR_NAMES.map((name) => ({ name, ...FAR }))
].sort((a, b) => a.name.localeCompare(b.name, "en"));

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
  return area ? area.fee : 30;
}

export function areaDeliveryDays(areaName) {
  const area = getDeliveryArea(areaName);
  return area ? area.days : "1–2 days";
}
