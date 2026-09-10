// Seller Center authentication.
// Sign-in is real Supabase Auth (email + password). After signing in, the
// account must also be listed in the public.admin_users table (checked with
// the public.is_admin() RPC) before any Seller Center data is shown.
// RLS on the database is the real security boundary; these helpers are UX.
//
// There is deliberately NO local/demo fallback session: without Supabase,
// Seller Center sign-in is unavailable.

import { isDemoMode } from "./config.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

// Leftover from the old client-side login. Clear it once on every page so a
// stale homemade session can never look like a valid one.
try {
  sessionStorage.removeItem("velloura_admin_session");
} catch (err) {
  /* storage unavailable */
}

export const ADMIN_PAGES = new Set(["admin.html"]);

function sanitizeNextPage(value) {
  const next = String(value || "").trim();
  return ADMIN_PAGES.has(next) ? next : "admin.html";
}

export function adminLoginAvailable() {
  return !isDemoMode;
}

async function readyClient() {
  if (isDemoMode) return null;
  const ready = await waitForSupabase();
  if (!ready) return null;
  try {
    return getSupabaseClient();
  } catch (err) {
    return null;
  }
}

/**
 * Check the current session and admin allowlist.
 * Resolves to { ok: true, email } or { ok: false, reason } where reason is one of:
 * "demo" | "unavailable" | "signed-out" | "not-admin" | "error"
 */
export async function checkAdmin() {
  if (isDemoMode) return { ok: false, reason: "demo" };
  const sb = await readyClient();
  if (!sb) return { ok: false, reason: "unavailable" };
  const { data, error } = await sb.auth.getSession();
  if (error) return { ok: false, reason: "error" };
  const user = data?.session?.user;
  if (!user) return { ok: false, reason: "signed-out" };
  const { data: isAdmin, error: rpcError } = await sb.rpc("is_admin");
  if (rpcError) return { ok: false, reason: "error" };
  if (!isAdmin) return { ok: false, reason: "not-admin", user };
  return { ok: true, email: user.email || "", user };
}

/**
 * Sign in with Supabase Auth. Returns { ok: true } or { ok: false, error }
 * with a nonrevealing message (never confirms whether an email is an admin).
 */
export async function login(email, password) {
  const sb = await readyClient();
  if (!sb) return { ok: false, error: "Sign-in is not available right now. Please try again." };
  const { data, error } = await sb.auth.signInWithPassword({
    email: String(email || "").trim().toLowerCase(),
    password: String(password || "")
  });
  if (error || !data?.user) {
    const text = String(error?.message || "");
    if (/invalid login credentials/i.test(text)) {
      return { ok: false, error: "Wrong email or password. Try again." };
    }
    if (/email not confirmed/i.test(text)) {
      return { ok: false, error: "Check your email and confirm your account, then log in." };
    }
    return { ok: false, error: "Could not sign in right now. Please try again." };
  }
  return { ok: true, user: data.user };
}

export async function logout() {
  const sb = await readyClient();
  try {
    await sb?.auth.signOut();
  } catch (err) {
    /* best effort — the redirect clears the screen anyway */
  }
}

/**
 * Guard for admin pages. Redirects to login.html (with a reason) when the
 * visitor is not a signed-in admin, and signs out authenticated non-admins.
 * Resolves to the admin status when allowed, or null after redirecting.
 */
export async function requireAdmin() {
  const status = await checkAdmin();
  if (status.ok) return status;
  if (status.reason === "not-admin") {
    await logout();
    window.location.replace("login.html?next=admin.html&reason=denied");
    return null;
  }
  const reason = status.reason === "unavailable" ? "unavailable" : "";
  const suffix = reason ? `&reason=${reason}` : "";
  window.location.replace(`login.html?next=admin.html${suffix}`);
  return null;
}

/**
 * Subscribe to auth events that should kick an admin out mid-session
 * (sign-out from another tab, expired/failed refresh). Returns a no-op
 * unsubscriber for API symmetry.
 */
export function onAdminAuthChange(handler) {
  if (isDemoMode) return () => {};
  let unsub = () => {};
  waitForSupabase().then((ready) => {
    if (!ready) return;
    try {
      const sb = getSupabaseClient();
      const { data } = sb.auth.onAuthStateChange((event) => {
        if (event === "SIGNED_OUT" || event === "TOKEN_REFRESH_FAILED" || event === "USER_DELETED") {
          handler(event);
        }
      });
      unsub = data?.subscription?.unsubscribe ? data.subscription.unsubscribe : () => {};
    } catch (err) {
      /* stay silent; next page load re-checks */
    }
  });
  return () => unsub();
}

export { sanitizeNextPage };
