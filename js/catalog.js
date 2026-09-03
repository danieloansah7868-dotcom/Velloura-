// Product catalog.
// - When Supabase is configured, products are read from the public.products table.
// - When Supabase is not configured (demo mode), a matching local placeholder set is used.

import { isDemoMode } from "./config.js";
import { stringId } from "./utils.js";
import { getSupabaseClient } from "./supabase.js";

const LOCAL_PRODUCTS = [
  {
    id: "1",
    dept: "fashion",
    collection: "streetwear",
    name: "Brooklyn Crop Set",
    description: "A soft two-piece crop top and joggers set for easy street days.",
    price_ghs: 180,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Black", "White"],
    badge: null,
    in_stock: true,
    sort_order: 1,
    image: "assets/products/fashion-crop-set.jpg"
  },
  {
    id: "2",
    dept: "fashion",
    collection: "streetwear",
    name: "Royal Oversized Tee",
    description: "An oversized cotton tee in royal navy for a bold everyday look.",
    price_ghs: 90,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Royal Navy", "White", "Black"],
    badge: null,
    in_stock: true,
    sort_order: 2,
    image: "assets/products/fashion-royal-tee.jpg"
  },
  {
    id: "3",
    dept: "fashion",
    collection: "modest",
    name: "Modest Satin Maxi Dress",
    description: "A relaxed satin maxi dress with long sleeves, made to move with you.",
    price_ghs: 260,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Emerald", "Navy", "Burgundy"],
    badge: null,
    in_stock: true,
    sort_order: 3,
    image: "assets/products/fashion-modest-maxi.jpg"
  },
  {
    id: "4",
    dept: "fashion",
    collection: "modest",
    name: "Everyday Modest Set",
    description: "A long-line top and wide trousers set. Comfortable and easy to style.",
    price_ghs: 220,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Beige", "Navy"],
    badge: null,
    in_stock: true,
    sort_order: 4,
    image: "assets/products/fashion-modest-set.jpg"
  },
  {
    id: "5",
    dept: "fashion",
    collection: "thrift",
    name: "Vintage Denim Blazer",
    description: "A one-piece vintage denim blazer. Only one available, so it will not be repeated.",
    price_ghs: 140,
    sizes: ["M", "L"],
    colors: ["Grey Denim"],
    badge: "1 of 1",
    in_stock: true,
    sort_order: 5,
    image: "assets/products/fashion-denim-blazer.jpg"
  },
  {
    id: "6",
    dept: "fashion",
    collection: "thrift",
    name: "Classic Cream Blouse",
    description: "A timeless cream blouse. Only one piece available.",
    price_ghs: 80,
    sizes: ["S", "M"],
    colors: ["Cream"],
    badge: "1 of 1",
    in_stock: true,
    sort_order: 6,
    image: "assets/products/fashion-cream-blouse.jpg"
  },
  {
    id: "7",
    dept: "jewelry",
    collection: null,
    name: "Crown Gold Ring",
    description: "24k gold plated ring with a small crown detail. Tarnish free.",
    price_ghs: 120,
    sizes: [],
    colors: [],
    badge: null,
    in_stock: true,
    sort_order: 7,
    image: "assets/products/jewelry-crown-ring.jpg"
  },
  {
    id: "8",
    dept: "jewelry",
    collection: null,
    name: "Estate Pearl Earrings",
    description: "18k plated drop earrings. Hypoallergenic and light on the ear.",
    price_ghs: 150,
    sizes: [],
    colors: [],
    badge: null,
    in_stock: true,
    sort_order: 8,
    image: "assets/products/jewelry-pearl-earrings.jpg"
  },
  {
    id: "9",
    dept: "jewelry",
    collection: null,
    name: "Woven Gold Necklace",
    description: "A fine woven gold-toned chain. Tarnish free and good for daily wear.",
    price_ghs: 180,
    sizes: [],
    colors: [],
    badge: null,
    in_stock: true,
    sort_order: 9,
    image: "assets/products/jewelry-woven-necklace.jpg"
  },
  {
    id: "10",
    dept: "jewelry",
    collection: null,
    name: "Velloura Charm Bangle",
    description: "18k plated adjustable bangle with a small crown charm.",
    price_ghs: 170,
    sizes: [],
    colors: [],
    badge: null,
    in_stock: true,
    sort_order: 10,
    image: "assets/products/jewelry-charm-bangle.jpg"
  },
  {
    id: "11",
    dept: "hair",
    collection: null,
    name: "Silky Straight Bundle (24 inch)",
    description: "A single bundle of silky straight virgin hair. Sold as a bundle.",
    price_ghs: 480,
    sizes: ["12 inch", "14 inch", "16 inch", "18 inch", "20 inch", "22 inch", "24 inch"],
    colors: ["Natural Black"],
    badge: null,
    in_stock: true,
    sort_order: 11,
    image: "assets/products/hair-virgin-bundle.jpg"
  },
  {
    id: "12",
    dept: "hair",
    collection: null,
    name: "Lace Closure (18 inch)",
    description: "A transparent lace closure with straight hair for a natural finish.",
    price_ghs: 320,
    sizes: ["14 inch", "16 inch", "18 inch", "20 inch"],
    colors: ["Natural Black"],
    badge: null,
    in_stock: true,
    sort_order: 12,
    image: "assets/products/hair-closure.jpg"
  },
  {
    id: "13",
    dept: "wigs",
    collection: null,
    name: "Glueless Lace Front Wig (26 inch)",
    description: "A long glueless lace front wig with a soft natural part.",
    price_ghs: 850,
    sizes: ["18 inch", "20 inch", "22 inch", "24 inch", "26 inch"],
    colors: ["Natural Black", "Honey Blonde"],
    badge: null,
    in_stock: true,
    sort_order: 13,
    image: "assets/products/wig-lace-front.jpg"
  },
  {
    id: "14",
    dept: "wigs",
    collection: null,
    name: "Sleek Bob Wig",
    description: "A polished jet black bob wig with a clean, lightweight finish.",
    price_ghs: 650,
    sizes: ["10 inch", "12 inch"],
    colors: ["Jet Black", "Brown"],
    badge: null,
    in_stock: true,
    sort_order: 14,
    image: "assets/products/wig-bob.jpg"
  },
  {
    id: "15",
    dept: "fashion",
    collection: "modest",
    name: "Ivory Wrap Dress",
    description: "A soft ivory wrap dress with a flattering tie waist. Easy to dress up or down.",
    price_ghs: 240,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Ivory"],
    badge: null,
    in_stock: true,
    sort_order: 15,
    image: "assets/products/fashion-ivory-wrap-dress.jpg"
  },
  {
    id: "16",
    dept: "fashion",
    collection: "streetwear",
    name: "Navy Wide-Leg Trousers",
    description: "High-waist navy trousers with a relaxed wide leg. A polished streetwear staple.",
    price_ghs: 160,
    sizes: ["XS", "S", "M", "L", "XL"],
    colors: ["Navy"],
    badge: null,
    in_stock: true,
    sort_order: 16,
    image: "assets/products/fashion-wide-leg-trousers.jpg"
  },
  {
    id: "17",
    dept: "fashion",
    collection: "streetwear",
    name: "Burgundy Pleated Skirt",
    description: "A modern burgundy pleated midi skirt with a soft movement.",
    price_ghs: 130,
    sizes: ["XS", "S", "M", "L"],
    colors: ["Burgundy"],
    badge: null,
    in_stock: true,
    sort_order: 17,
    image: "assets/products/fashion-pleated-skirt.jpg"
  },
  {
    id: "18",
    dept: "jewelry",
    collection: null,
    name: "Gilded Hoop Earrings",
    description: "Lightweight gold hoops for everyday wear. Tarnish free.",
    price_ghs: 95,
    sizes: [],
    colors: [],
    badge: null,
    in_stock: true,
    sort_order: 18,
    image: "assets/products/jewelry-gold-hoops.jpg"
  },
  {
    id: "19",
    dept: "jewelry",
    collection: null,
    name: "Royal Pendant Necklace",
    description: "A delicate gold pendant with a small round charm.",
    price_ghs: 200,
    sizes: [],
    colors: [],
    badge: null,
    in_stock: true,
    sort_order: 19,
    image: "assets/products/jewelry-pendant-necklace.jpg"
  },
  {
    id: "20",
    dept: "jewelry",
    collection: null,
    name: "Gold Link Bracelet",
    description: "A clean gold link bracelet. Tarnish free and easy to layer.",
    price_ghs: 110,
    sizes: [],
    colors: [],
    badge: null,
    in_stock: true,
    sort_order: 20,
    image: "assets/products/jewelry-link-bracelet.jpg"
  },
  {
    id: "21",
    dept: "hair",
    collection: null,
    name: "Deep Wave Bundle (18 inch)",
    description: "A single bundle of deep wave virgin hair with a soft pattern.",
    price_ghs: 420,
    sizes: ["12 inch", "14 inch", "16 inch", "18 inch", "20 inch"],
    colors: ["Natural Black"],
    badge: null,
    in_stock: true,
    sort_order: 21,
    image: "assets/products/hair-deep-wave-bundle.jpg"
  },
  {
    id: "22",
    dept: "hair",
    collection: null,
    name: "4x4 Lace Closure (16 inch)",
    description: "A 4x4 lace closure with natural wavy hair for a soft finish.",
    price_ghs: 280,
    sizes: ["14 inch", "16 inch", "18 inch"],
    colors: ["Natural Black"],
    badge: null,
    in_stock: true,
    sort_order: 22,
    image: "assets/products/hair-4x4-closure.jpg"
  },
  {
    id: "23",
    dept: "wigs",
    collection: null,
    name: "Body Wave Lace Front Wig (24 inch)",
    description: "A long body wave lace front wig with a natural flow.",
    price_ghs: 780,
    sizes: ["18 inch", "20 inch", "22 inch", "24 inch"],
    colors: ["Natural Black", "Dark Brown"],
    badge: null,
    in_stock: true,
    sort_order: 23,
    image: "assets/products/wig-body-wave.jpg"
  },
  {
    id: "24",
    dept: "wigs",
    collection: null,
    name: "Highlighted Bob Wig",
    description: "A chic bob wig with soft honey highlights for a fresh finish.",
    price_ghs: 550,
    sizes: ["10 inch", "12 inch"],
    colors: ["Honey Brown", "Jet Black"],
    badge: null,
    in_stock: true,
    sort_order: 24,
    image: "assets/products/wig-highlight-bob.jpg"
  }
];

let productsCache = null;

function normalizeProduct(row) {
  const sizes = Array.isArray(row.sizes) ? row.sizes : [];
  const colors = Array.isArray(row.colors) ? row.colors : [];
  const id = stringId(row.id);
  return {
    id,
    dept: row.dept,
    collection: row.collection || null,
    name: row.name,
    description: row.description || "",
    price_ghs: Number(row.price_ghs),
    sizes,
    colors,
    badge: row.badge || null,
    in_stock: row.in_stock !== false,
    sort_order: Number(row.sort_order || 0),
    image: row.image || null
  };
}

function cloneProduct(p) {
  return {
    ...p,
    sizes: [...(p.sizes || [])],
    colors: [...(p.colors || [])]
  };
}

export function getLocalProducts() {
  return LOCAL_PRODUCTS.map(cloneProduct);
}

export async function loadProducts({ force = false } = {}) {
  if (isDemoMode) return getLocalProducts();
  if (productsCache && !force) return productsCache.map(cloneProduct);
  const sb = getSupabaseClient();
  if (!sb) throw new Error("Supabase is not connected.");
  const { data, error } = await sb
    .from("products")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) throw error;
  productsCache = (data || []).map(normalizeProduct);
  return productsCache.map(cloneProduct);
}

export async function getProduct(idValue) {
  const products = await loadProducts();
  const wanted = stringId(idValue);
  return products.find((p) => stringId(p.id) === wanted) || null;
}
