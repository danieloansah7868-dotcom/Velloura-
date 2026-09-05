// Seller Center ↔ Supabase connection.
// The Seller Center front door (admin@velloura.com) is just a password check.
// To save products and photos to the live shop, the owner also signs in here
// with her own Supabase user. That user must be listed in the public.sellers
// table (see supabase/setup.sql and the README section "Listing photos").

import { isDemoMode } from "./config.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

// Returns one of:
//   { mode: "demo" }
//   { mode: "signed-out" }
//   { mode: "signed-in", email, isSeller }  // isSeller: true/false/null (unknown)
export async function getSellerSession() {
  if (isDemoMode) return { mode: "demo" };
  const ready = await waitForSupabase();
  if (!ready) return { mode: "signed-out" };
  const sb = getSupabaseClient();
  const { data } = await sb.auth.getUser().catch(() => ({ data: { user: null } }));
  const user = data?.user;
  if (!user) return { mode: "signed-out" };
  let isSeller = null;
  try {
    const { data: row, error } = await sb
      .from("sellers")
      .select("user_id")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!error) isSeller = Boolean(row);
  } catch (err) {
    // Table missing or not readable — the real error will surface on save.
  }
  return { mode: "signed-in", email: user.email || "", isSeller };
}

export async function signInSeller(email, password) {
  const ready = await waitForSupabase();
  if (!ready) throw new Error("Supabase is not connected. Refresh the page and try again.");
  const sb = getSupabaseClient();
  const { error } = await sb.auth.signInWithPassword({
    email: String(email || "").trim(),
    password: String(password || "")
  });
  if (error) {
    if (/invalid login credentials|invalid credentials/i.test(error.message || "")) {
      throw new Error("Wrong email or password. Check the seller account in Supabase → Authentication → Users.");
    }
    if (/failed to fetch|network/i.test(error.message || "")) {
      throw new Error("Could not reach Supabase. Check your internet connection and try again.");
    }
    throw new Error(error.message || "Could not sign in. Please try again.");
  }
  return getSellerSession();
}

export async function signOutSeller() {
  if (isDemoMode) return;
  try {
    const ready = await waitForSupabase();
    if (!ready) return;
    const sb = getSupabaseClient();
    await sb.auth.signOut();
  } catch (err) {
    // Ignore — next sign-in overwrites the session.
  }
}
