// Customer accounts. Stored in this browser (demo). Not bank-grade security.

import { normalizeDigits } from "./utils.js";

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

export function listCustomers() {
  return readCustomers().map((c) => {
    const { password, ...safe } = c;
    return safe;
  });
}

export function currentCustomer() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw);
    if (!session || !session.email) return null;
    const customer = readCustomers().find((c) => c.email === session.email);
    if (!customer) return null;
    const { password, ...safe } = customer;
    return safe;
  } catch (err) {
    return null;
  }
}

export function registerCustomer({ name, email, phone, password }) {
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
  if (pass.length < 4) return { ok: false, error: "Password should be at least 4 characters." };

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
    created_at: new Date().toISOString()
  };
  customers.push(customer);
  writeCustomers(customers);
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: cleanEmail, at: Date.now() }));
  const { password: _pw, ...safe } = customer;
  return { ok: true, customer: safe };
}

export function loginCustomer(email, password) {
  const cleanEmail = String(email || "").trim().toLowerCase();
  const pass = encodePass(password);
  const customer = readCustomers().find((c) => c.email === cleanEmail && c.password === pass);
  if (!customer) return { ok: false, error: "Wrong email or password." };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify({ email: cleanEmail, at: Date.now() }));
  const { password: _pw, ...safe } = customer;
  return { ok: true, customer: safe };
}

export function logoutCustomer() {
  sessionStorage.removeItem(SESSION_KEY);
}

export function updateCustomer(fields) {
  const session = currentCustomer();
  if (!session) return { ok: false, error: "Please log in." };
  const customers = readCustomers();
  const idx = customers.findIndex((c) => c.email === session.email);
  if (idx < 0) return { ok: false, error: "Account not found." };
  const next = { ...customers[idx] };
  if (fields.name) next.name = String(fields.name).trim();
  if (fields.phone) next.phone = normalizeDigits(fields.phone);
  customers[idx] = next;
  writeCustomers(customers);
  const { password, ...safe } = next;
  return { ok: true, customer: safe };
}
