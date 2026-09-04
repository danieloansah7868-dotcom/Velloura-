// Supabase client factory.
// The @supabase/supabase-js library is loaded from cdn.jsdelivr.net in the page head.
// Only the publishable anon key is used here. Never use a secret or service-role key.

import { CONFIG, isDemoMode } from "./config.js";

let client = null;

export async function waitForSupabase() {
  if (isDemoMode) return false;
  if (window.supabase) return true;
  for (let i = 0; i < 40; i += 1) {
    await new Promise((resolve) => setTimeout(resolve, 50));
    if (window.supabase) return true;
  }
  return false;
}

export function getSupabaseClient() {
  if (isDemoMode) return null;
  if (client) return client;
  if (!window.supabase) {
    throw new Error("Supabase JS library is not loaded. Check the CDN script in the page head.");
  }
  client = window.supabase.createClient(CONFIG.supabaseUrl, CONFIG.supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storage: window.localStorage
    }
  });
  return client;
}

export function getSupabaseConfigured() {
  return !isDemoMode;
}
