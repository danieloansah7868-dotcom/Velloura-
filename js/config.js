// VELLOURA - one place to change shop settings.
// This is the ONLY file where the WhatsApp number and Supabase keys live.

export const CONFIG = Object.freeze({
  brandName: "VELLOURA",
  currency: "GHS",
  siteUrl: "https://vellouragh.com",

  // WhatsApp number in international format WITHOUT the + symbol.
  whatsappNumber: "233556555317",
  phoneDisplay: "055 655 5317",

  // Publishable (anon) Supabase settings. Leave BOTH empty to run in demo
  // mode (products and orders/bookings are stored in this browser only).
  supabaseUrl: "",
  supabaseAnonKey: "",

  // Checkout payment. Customers pay on Valmont Pay (MoMo or card).
  valmontPayUrl: "https://valmontpay.app",

  // Delivery
  deliveryFees: {
    Accra: 20,
    Kumasi: 30,
    Other: 40
  },
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
