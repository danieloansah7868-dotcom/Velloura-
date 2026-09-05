// VELLOURA - one place to change shop settings.
// This is the ONLY file where the WhatsApp number and Supabase keys live.

export const CONFIG = Object.freeze({
  brandName: "VELLOURA",
  currency: "GHS",
  siteUrl: "https://vellouragh.com",

  // WhatsApp number in international format WITHOUT the + symbol.
  whatsappNumber: "233556555317",
  phoneDisplay: "055 655 5317",

  // Publishable Supabase settings (safe in the browser). Never put a
  // service_role or secret key here.
  supabaseUrl: "https://tslvalxmctnjimrbbvsd.supabase.co",
  supabaseAnonKey: "sb_publishable_d6HyDpoKRQiGiND_LH5Nxg_OMZhnK1M",

  // Listing photos. Seller Center uploads to this PUBLIC Storage bucket.
  // The bucket and its policies are created by supabase/setup.sql.
  storageBucket: "product-images",

  // Key for the gated product-write functions (seller_upsert_product /
  // seller_delete_product) in supabase/setup.sql. Front-door only, like the
  // Seller Center password — change it HERE and in the seller_auth table
  // together before launch.
  sellerKey: "velloura-seller-2026-change-me",

  // Checkout payment. The customer sees "Pay"; Valmont is the processor.
  valmontPayUrl: "https://valmontpay.app",

  // Delivery is Greater Accra only. Area fees live in js/delivery.js
  // and can be edited in Seller Center. Not listed on public pages.
  freeDeliveryThreshold: 500,

  // Seller Center login (change these before launch).
  // This is a front-door only — it is not bank-grade security.
  adminEmail: "admin@velloura.com",
  adminPassword: "velloura"
});

const supabaseReady = Boolean(
  CONFIG.supabaseUrl &&
  CONFIG.supabaseAnonKey &&
  CONFIG.supabaseUrl.startsWith("http")
);

export const isSupabaseConfigured = supabaseReady;
export const isDemoMode = !supabaseReady;
