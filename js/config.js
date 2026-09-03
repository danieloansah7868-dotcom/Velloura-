// VELLOURA - one place to change shop settings.
// This is the ONLY file where the WhatsApp number and Supabase keys live.

export const CONFIG = Object.freeze({
  brandName: "VELLOURA",
  currency: "GHS",

  // WhatsApp number in international format WITHOUT the + symbol.
  // The client sends her real number here before launch.
  whatsappNumber: "233XXXXXXXXX",

  // Publishable (anon) Supabase settings. Leave BOTH empty to run in demo
  // mode (products and orders/bookings are stored in this browser only).
  supabaseUrl: "",
  supabaseAnonKey: "",

  // Delivery
  deliveryFees: {
    Accra: 20,
    Kumasi: 30,
    Other: 40
  },
  freeDeliveryThreshold: 500,

  // Hair
  hairDepositGhs: 50
});

const supabaseReady = Boolean(
  CONFIG.supabaseUrl &&
  CONFIG.supabaseAnonKey &&
  CONFIG.supabaseUrl.startsWith("http")
);

export const isSupabaseConfigured = supabaseReady;
export const isDemoMode = !supabaseReady;
