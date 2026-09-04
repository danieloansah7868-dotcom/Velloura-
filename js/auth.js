// Seller Center session. Front-door only — change the password in config.js.

import { CONFIG } from "./config.js";

const AUTH_KEY = "velloura_admin_session";

export function isLoggedIn() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    if (!raw) return false;
    const session = JSON.parse(raw);
    return Boolean(session && session.ok && session.email);
  } catch (err) {
    return false;
  }
}

export function currentAdmin() {
  try {
    const raw = sessionStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function login(email, password) {
  const e = String(email || "").trim().toLowerCase();
  const p = String(password || "");
  const expectedEmail = String(CONFIG.adminEmail || "").trim().toLowerCase();
  const expectedPass = String(CONFIG.adminPassword || "");
  if (!e || !p || e !== expectedEmail || p !== expectedPass) return false;
  sessionStorage.setItem(AUTH_KEY, JSON.stringify({
    ok: true,
    email: e,
    at: Date.now()
  }));
  return true;
}

export function logout() {
  sessionStorage.removeItem(AUTH_KEY);
}

export function requireAdmin() {
  if (isLoggedIn()) return true;
  const next = encodeURIComponent(window.location.pathname.split("/").pop() || "admin.html");
  window.location.href = `login.html?next=${next}`;
  return false;
}
