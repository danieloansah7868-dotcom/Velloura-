// Supabase client factory.
// The @supabase/supabase-js library is loaded from cdn.jsdelivr.net in the page head.
// Only the publishable anon key is used here. Never use a secret or service-role key.

import { CONFIG, isDemoMode } from "./config.js";

let client = null;

export function getSupabaseClient() {
  if (isDemoMode) return null;
  if (client) return client;
  if (!window.supabase) {
    throw new Error("Supabase JS library is not loaded. Check the CDN script in the page head.");
  }
  client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey);
  return client;
}

export function getSupabaseConfigured() {
  return !isDemoMode;
}
