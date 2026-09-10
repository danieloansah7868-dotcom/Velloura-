// Product photo uploads for Seller Center.
// Files go to the Supabase Storage bucket "products" (created by
// supabase/migrations/20260909_auth_catalog_alignment.sql). Public reads,
// admin-only writes. Paths are sanitized and collision-resistant.

import { CONFIG } from "./config.js";
import { getSupabaseClient, waitForSupabase } from "./supabase.js";

export const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"];
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

const EXT_BY_TYPE = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/avif": ".avif"
};

async function adminStorageClient() {
  const ready = await waitForSupabase();
  if (!ready) return null;
  try {
    return getSupabaseClient();
  } catch (err) {
    return null;
  }
}

function buildObjectPath(file) {
  const ext = EXT_BY_TYPE[file.type] || ".jpg";
  const base = String(file.name || "product")
    .toLowerCase()
    .replace(/\.[^.]*$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${stamp}-${rand}-${base || "product"}${ext}`;
}

/**
 * Validate and upload an image file. Resolves to { path, url } — the object
 * path inside the bucket and its public URL.
 */
export async function uploadProductImage(file) {
  if (!file) throw new Error("Choose a photo to upload.");
  if (!IMAGE_TYPES.includes(file.type)) {
    throw new Error("Photos must be JPG, PNG, WEBP or AVIF images.");
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error("That photo is too large. Please use an image under 5 MB.");
  }
  const sb = await adminStorageClient();
  if (!sb) throw new Error("Photo upload is not available right now. Please try again.");
  const path = buildObjectPath(file);
  const { error } = await sb.storage
    .from("products")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) {
    throw new Error("Could not upload the photo. Please try again.");
  }
  const { data } = sb.storage.from("products").getPublicUrl(path);
  return { path, url: data?.publicUrl || "" };
}

/** Best-effort removal of an uploaded object (e.g. when a later save fails). */
export async function removeProductImageQuietly(path) {
  if (!path) return;
  try {
    const sb = await adminStorageClient();
    await sb?.storage.from("products").remove([path]);
  } catch (err) {
    /* orphan object; harmless */
  }
}

/**
 * If a product's image lives in our storage bucket, return its object path.
 * Use before/after deleting a product row so the file does not linger.
 */
export function storedImagePath(imageUrl) {
  const url = String(imageUrl || "");
  const prefix = `${CONFIG.supabaseUrl}/storage/v1/object/public/products/`;
  if (!url.startsWith(prefix)) return "";
  return decodeURIComponent(url.slice(prefix.length));
}
