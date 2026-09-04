// Customer accounts: Supabase Auth (email + Google) with a local fallback.

import { normalizeDigits } from "./utils.js";
import { isDemoMode } from "./config.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

const CUSTOMERS_KEY = "velloura_customers_v1";
const SESSION_KEY = "velloura_customer_session";

function readCustomers() {
  try {
    const raw = localStorage.getItem(CUSTOMERS_KEY);
    const data = raw ? JSON.parse(raw) : [];
    return Array.isArray(data) ? data : [];
  } catch (err) {
    return [];
  }
}

function writeCustomers(list) {
  localStorage.setItem(CUSTOMERS_KEY, JSON.stringify(list));
}

function encodePass(password) {
  try {
    return btoa(unescape(encodeURIComponent(String(password || ""))));
  } catch (err) {
    return String(password || "");
  }
}

function cacheSession(customer) {
  if (customer) localStorage.setItem(SESSION_KEY, JSON.stringify(customer));
  else localStorage.removeItem(SESSION_KEY);
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch (err) {
    /* ignore */
  }
}

function safeCustomer(row) {
  if (!row) return null;
  const { password, ...safe } = row;
  return {
    id: safe.id || "",
    name: safe.name || "",
    email: safe.email || "",
    phone: safe.phone || "",
    provider: safe.provider || "email"
  };
}

function customerFromUser(user) {
  if (!user) return null;
  const meta = user.user_metadata || {};
  const name = meta.name || meta.full_name || meta.given_name || String(user.email || "").split("@")[0] || "";
  const phone = normalizeDigits(meta.phone || user.phone || "");
  const provider = user.app_metadata?.provider || (user.identities || [])[0]?.provider || "email";
  return {
    id: user.id,
    name,
    email: user.email || "",
    phone,
    provider
  };
}

function rememberLocal(customer) {
  if (!customer || !customer.email) return;
  const list = readCustomers();
  const idx = list.findIndex((c) => c.email === customer.email);
  const row = { ...list[idx], ...customer };
  if (idx >= 0) list[idx] = row;
  else list.push(row);
  writeCustomers(list);
}

export function listCustomers() {
  return readCustomers().map((c) => safeCustomer(c)).filter(Boolean);
}

export function currentCustomer() {
  try {
    const raw = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (session && session.name && session.email) return safeCustomer(session);
    if (!session || !session.email) return null;
    const customer = readCustomers().find((c) => c.email === session.email);
    return customer ? safeCustomer(customer) : safeCustomer(session);
  } catch (err) {
    return null;
  }
}

export async function hydrateCustomer() {
  if (isDemoMode) return currentCustomer();
  try {
    const ready = await waitForSupabase();
    if (!ready) return currentCustomer();
    const sb = getSupabaseClient();
    if (!sb) return currentCustomer();
    const { data } = await sb.auth.getSession();
    const user = data?.session?.user;
    if (!user) return currentCustomer();
    const customer = customerFromUser(user);
    cacheSession(customer);
    rememberLocal(customer);
    return customer;
  } catch (err) {
    return currentCustomer();
  }
}

function localRegister({ name, email, phone, password }) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const cleanName = String(name || "").trim();
  const cleanPhone = normalizeDigits(phone);
  const pass = String(password || "");

  if (cleanName.length < 2) return { ok: false, error: "Please enter your full name." };
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
    return { ok: false, error: "Please enter a valid email." };
  }
  if (!/^0\d{9}$/.test(cleanPhone)) {
    return { ok: false, error: "Please enter a Ghana phone number like 024 123 4567." };
  }
  if (pass.length < 6) return { ok: false, error: "Password should be at least 6 characters." };

  const customers = readCustomers();
  if (customers.some((c) => c.email === cleanEmail)) {
    return { ok: false, error: "An account with this email already exists. Log in instead." };
  }

  const customer = {
    id: `c-${Date.now()}`,
    name: cleanName,
    email: cleanEmail,
    phone: cleanPhone,
    password: encodePass(pass),
    provider: "email",
    created_at: new Date().toISOString()
  };
  customers.push(customer);
  writeCustomers(customers);
  const safe = safeCustomer(customer);
  cacheSession(safe);
  return { ok: true, customer: safe };
}

function localLogin(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const pass = encodePass(password);
  const customer = readCustomers().find((c) => c.email === cleanEmail && c.password === pass);
  if (!customer) return { ok: false, error: "Wrong email or password." };
  const safe = safeCustomer(customer);
  cacheSession(safe);
  return { ok: true, customer: safe };
}

function authErrorMessage(error) {
  const text = String(error?.message || error || "");
  if (/invalid login credentials/i.test(text)) return "Wrong email or password.";
  if (/already registered|already exists/i.test(text)) return "An account with this email already exists. Log in instead.";
  if (/provider is not enabled|unsupported provider/i.test(text)) {
    return "Google sign-in is not turned on yet. Use email, or enable Google in Supabase Authentication.";
  }
  if (/email not confirmed/i.test(text)) return "Check your email and confirm your account, then log in.";
  return text || "Could not sign in. Please try again.";
}

export async function registerCustomer({ name, email, phone, password }) {
  const local = localRegister({ name, email, phone, password });
  if (!local.ok) return local;
  if (isDemoMode) return local;

  try {
    const ready = await waitForSupabase();
    if (!ready) return local;
    const sb = getSupabaseClient();
    if (!sb) return local;
    const { data, error } = await sb.auth.signUp({
      email: String(email || "").trim().toLowerCase(),
      password: String(password || ""),
      options: {
        data: {
          name: String(name || "").trim(),
          full_name: String(name || "").trim(),
          phone: normalizeDigits(phone)
        }
      }
    });
    if (error) {
      if (/already registered|already exists/i.test(error.message || "")) {
        return { ok: false, error: "An account with this email already exists. Log in instead." };
      }
      return local;
    }
    if (data?.user) {
      const customer = {
        ...customerFromUser(data.user),
        name: String(name || "").trim(),
        phone: normalizeDigits(phone)
      };
      cacheSession(customer);
      rememberLocal(customer);
      if (!data.session) {
        return {
          ok: true,
          customer,
          notice: "Account created. If email confirmation is on, check your inbox before you log in."
        };
      }
      return { ok: true, customer };
    }
    return local;
  } catch (err) {
    return local;
  }
}

export async function loginCustomer(email, password) {
  if (!isDemoMode) {
    try {
      const ready = await waitForSupabase();
      if (ready) {
        const sb = getSupabaseClient();
        if (sb) {
          const { data, error } = await sb.auth.signInWithPassword({
            email: String(email || "").trim().toLowerCase(),
            password: String(password || "")
          });
          if (!error && data?.user) {
            const customer = customerFromUser(data.user);
            cacheSession(customer);
            rememberLocal(customer);
            return { ok: true, customer };
          }
          if (error && !/invalid login credentials/i.test(error.message || "")) {
            return { ok: false, error: authErrorMessage(error) };
          }
        }
      }
    } catch (err) {
      /* fall back to local */
    }
  }
  return localLogin(email, password);
}

export async function loginWithGoogle(nextPage) {
  if (isDemoMode) {
    return { ok: false, error: "Google sign-in needs Supabase. Add your project keys first." };
  }
  const ready = await waitForSupabase();
  if (!ready) return { ok: false, error: "Could not reach sign-in. Try email instead." };
  const sb = getSupabaseClient();
  if (!sb) return { ok: false, error: "Could not reach sign-in. Try email instead." };
  const redirect = new URL("account-login.html", window.location.href);
  if (nextPage) redirect.searchParams.set("next", nextPage);
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: redirect.toString(),
      queryParams: { prompt: "select_account" }
    }
  });
  if (error) return { ok: false, error: authErrorMessage(error) };
  return { ok: true, redirecting: true };
}

export async function logoutCustomer() {
  cacheSession(null);
  try {
    if (!isDemoMode) {
      const ready = await waitForSupabase();
      if (ready) {
        const sb = getSupabaseClient();
        if (sb) await sb.auth.signOut();
      }
    }
  } catch (err) {
    /* already cleared locally */
  }
}

export function updateCustomer(fields) {
  const session = currentCustomer();
  if (!session) return { ok: false, error: "Please log in." };
  const customers = readCustomers();
  const idx = customers.findIndex((c) => c.email === session.email);
  const next = { ...(idx >= 0 ? customers[idx] : session) };
  if (fields.name) next.name = String(fields.name).trim();
  if (fields.phone) next.phone = normalizeDigits(fields.phone);
  if (idx >= 0) customers[idx] = next;
  else customers.push(next);
  writeCustomers(customers);
  const safe = safeCustomer(next);
  cacheSession(safe);
  if (!isDemoMode) {
    waitForSupabase().then((ready) => {
      if (!ready) return;
      const sb = getSupabaseClient();
      if (!sb) return;
      sb.auth.updateUser({
        data: { name: safe.name, full_name: safe.name, phone: safe.phone }
      }).catch(() => {});
    });
  }
  return { ok: true, customer: safe };
}
