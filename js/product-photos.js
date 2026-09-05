// Listing photos for products.
// - Photos picked in Seller Center are resized in the browser (longest side
//   1600px) so the shop stays fast on mobile data.
// - When Supabase is connected, photos are uploaded to the public
//   "product-photos" storage bucket and the product keeps the public URL.
// - In demo mode (no Supabase) the resized photo is stored as a data URL.

import { CONFIG, isDemoMode } from "./config.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

export const PHOTO_MAX_BYTES = 5 * 1024 * 1024; // must match the bucket limit in supabase/setup.sql
export const PHOTO_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const PHOTO_MAX_EDGE = 1600;
const BUCKET = "product-photos";
const BUCKET_URL_MARKER = "/storage/v1/object/public/product-photos/";

export function sellerError(code, message) {
  const err = new Error(message);
  err.code = code;
  return err;
}

export function validatePhotoFile(file) {
  if (!file) return "";
  if (!PHOTO_MIME_TYPES.includes(file.type)) {
    return "That file type is not supported. Use a JPEG, PNG, WebP or AVIF photo.";
  }
  if (file.size > PHOTO_MAX_BYTES) {
    return "That photo is larger than 5 MB. Choose a smaller one.";
  }
  return "";
}

function loadBitmap(file) {
  if (typeof window.createImageBitmap === "function") {
    return createImageBitmap(file, { imageOrientation: "from-image" })
      .catch(() => loadViaImageElement(file));
  }
  return loadViaImageElement(file);
}

function loadViaImageElement(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not read that photo. Try a different file."));
    };
    img.src = url;
  });
}

// Resize + re-encode so uploads stay small. Falls back to the original
// file when resizing would not help (small file, already within limits).
export async function prepareProductPhoto(file) {
  const bitmap = await loadBitmap(file);
  const width = bitmap.width || bitmap.naturalWidth || 0;
  const height = bitmap.height || bitmap.naturalHeight || 0;
  if (!width || !height) throw new Error("Could not read that photo. Try a different file.");

  const scale = Math.min(1, PHOTO_MAX_EDGE / Math.max(width, height));
  const outWidth = Math.max(1, Math.round(width * scale));
  const outHeight = Math.max(1, Math.round(height * scale));
  const keepPng = file.type === "image/png";
  const outMime = keepPng ? "image/png" : "image/jpeg";

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");
  if (keepPng) {
    // Keep transparency for PNGs.
    ctx.drawImage(bitmap, 0, 0, outWidth, outHeight);
  } else {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, outWidth, outHeight);
    ctx.drawImage(bitmap, 0, 0, outWidth, outHeight);
  }
  if (bitmap.close) bitmap.close();

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, outMime, 0.85));
  const shrunk = Boolean(blob && blob.size > 0 && blob.size < file.size);
  if (scale < 1 || shrunk) {
    return { blob, type: outMime };
  }
  // Re-encoding did not help — keep the original bytes.
  return { blob: file, type: file.type };
}

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the photo."));
    reader.readAsDataURL(blob);
  });
}

function extForType(type) {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  if (type === "image/avif") return "avif";
  return "jpg";
}

function randomToken() {
  if (window.crypto && typeof window.crypto.randomUUID === "function") {
    return window.crypto.randomUUID().slice(0, 8);
  }
  return Math.random().toString(36).slice(2, 10);
}

function mapUploadError(error) {
  const text = `${error?.message || ""} ${error?.statusCode || ""} ${error?.code || ""}`;
  if (/row-level security|42501|unauthorized|forbidden|jwt/i.test(text)) {
    return sellerError(
      "seller_access",
      "This account cannot upload photos yet. Give it seller access — see “Listing photos” in the README."
    );
  }
  if (/exceeded the maximum|payload too large|too large|413/i.test(text)) {
    return new Error("That photo is too large. Keep photos under 5 MB.");
  }
  if (/mime|type|invalid|not allowed/i.test(text)) {
    return new Error("That file type is not supported. Use a JPEG, PNG, WebP or AVIF photo.");
  }
  if (/failed to fetch|network/i.test(text)) {
    return new Error("Could not reach Supabase. Check your internet connection and try again.");
  }
  return new Error(error?.message || "Could not upload the photo. Please try again.");
}

async function requireSellerClient() {
  const ready = await waitForSupabase();
  if (!ready) throw new Error("Supabase is not connected. Refresh the page and try again.");
  const sb = getSupabaseClient();
  const { data } = await sb.auth.getSession();
  if (!data?.session?.user) {
    throw sellerError(
      "seller_signin",
      "Connect your seller account first — Seller Center → Dashboard → Live shop connection."
    );
  }
  return sb;
}

// Uploads a picked photo and returns its public URL.
export async function uploadProductPhoto(file) {
  const invalid = validatePhotoFile(file);
  if (invalid) throw new Error(invalid);
  const sb = await requireSellerClient();
  const prepared = await prepareProductPhoto(file);
  const path = `products/${Date.now()}-${randomToken()}.${extForType(prepared.type)}`;
  const { error } = await sb.storage
    .from(BUCKET)
    .upload(path, prepared.blob, { contentType: prepared.type, upsert: false });
  if (error) throw mapUploadError(error);
  const { data } = sb.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("The photo uploaded but no URL came back. Please try again.");
  return data.publicUrl;
}

export function isBucketPhotoUrl(url) {
  const value = String(url || "");
  return value.startsWith(`${CONFIG.supabaseUrl}${BUCKET_URL_MARKER}`);
}

// Best-effort cleanup: removes the old photo file from the bucket after a
// listing has been given a new one. Never throws.
export async function removeProductPhoto(url) {
  if (!isBucketPhotoUrl(url)) return;
  try {
    const path = decodeURIComponent(String(url).split(BUCKET_URL_MARKER)[1].split("?")[0]);
    if (!path) return;
    const ready = await waitForSupabase();
    if (!ready) return;
    const sb = getSupabaseClient();
    await sb.storage.from(BUCKET).remove([path]);
  } catch (err) {
    // Old photo stays in the bucket — harmless. It can be deleted in the
    // Supabase dashboard later.
  }
}

// Demo mode: store the resized photo in the browser as a data URL.
export async function photoToDataUrl(file) {
  const prepared = await prepareProductPhoto(file);
  return blobToDataUrl(prepared.blob);
}

export { isDemoMode };
