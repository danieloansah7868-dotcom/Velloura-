// Listing photo uploads.
// - Supabase mode: photos go to the public "product-images" Storage bucket
//   (created by supabase/setup.sql) and products store real public URLs.
// - Demo mode (or if an upload fails): the compressed photo is kept as a
//   data URL in the browser, matching the old behaviour.

import { CONFIG, isDemoMode } from "./config.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";
import { blobToDataUrl } from "./photo-editor.js";

function extensionFor(mime) {
  const type = String(mime || "").toLowerCase();
  if (type.includes("png")) return "png";
  if (type.includes("webp")) return "webp";
  if (type.includes("avif")) return "avif";
  if (type.includes("gif")) return "gif";
  return "jpg";
}

function sanitizeName(hint) {
  const slug = String(hint || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);
  return slug || "photo";
}

// Upload one photo blob. Resolves { url, remote, path }.
export async function uploadProductImage(blob, nameHint = "") {
  if (!isDemoMode) {
    try {
      const ready = await waitForSupabase();
      const sb = ready ? getSupabaseClient() : null;
      if (!sb) throw new Error("Supabase is not connected.");
      const bucket = CONFIG.storageBucket || "product-images";
      const path = `products/${sanitizeName(nameHint)}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${extensionFor(blob.type)}`;
      const { error } = await sb.storage.from(bucket).upload(path, blob, {
        contentType: blob.type || "image/jpeg",
        upsert: false
      });
      if (error) throw error;
      const { data } = sb.storage.from(bucket).getPublicUrl(path);
      return { url: data.publicUrl, remote: true, path };
    } catch (err) {
      // Keep the photo in the browser instead of losing the whole listing.
      console.error("Photo upload failed, keeping it in the browser:", err);
    }
  }
  return { url: await blobToDataUrl(blob), remote: false, path: "" };
}

function storagePathFromUrl(url) {
  const marker = `/storage/v1/object/public/${CONFIG.storageBucket || "product-images"}/`;
  const value = String(url || "");
  const at = value.indexOf(marker);
  if (at < 0) return null;
  return decodeURIComponent(value.slice(at + marker.length).split("?")[0]);
}

// Best-effort cleanup of a photo we uploaded earlier. Never throws.
export async function deleteProductImageByUrl(url) {
  const path = storagePathFromUrl(url);
  if (!path || isDemoMode) return false;
  try {
    const ready = await waitForSupabase();
    const sb = ready ? getSupabaseClient() : null;
    if (!sb) return false;
    const { error } = await sb.storage.from(CONFIG.storageBucket || "product-images").remove([path]);
    if (error) {
      console.error("Could not delete the old photo from storage:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error(err);
    return false;
  }
}
