// Canvas tools for listing photos: compress/resize + a crop modal.
// No dependencies — plain browser APIs. Used by Seller Center (admin.js).

export const PHOTO_MAX_DIM = 1400;      // long edge for listing photos
export const PHOTO_QUALITY = 0.82;      // keeps phone photos around 150-400 KB
export const PHOTO_MAX_PER_LISTING = 6;

export function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the photo."));
    reader.readAsDataURL(blob);
  });
}

export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // Remote photos (Supabase Storage) need CORS so the canvas stays usable.
    if (/^https?:/i.test(src)) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not load that photo."));
    img.src = src;
  });
}

function canvasToBlob(canvas, type = "image/jpeg", quality = PHOTO_QUALITY) {
  return new Promise((resolve, reject) => {
    try {
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Could not save that photo."));
      }, type, quality);
    } catch (err) {
      reject(new Error("Could not edit that photo (it may be blocked by the server it came from)."));
    }
  });
}

// Resize any image source (File, object URL, data URL, http URL) down to a
// web-friendly JPEG blob. Transparent PNGs are flattened onto white.
export async function compressImageSource(src, opts = {}) {
  const { maxDim = PHOTO_MAX_DIM, quality = PHOTO_QUALITY, type = "image/jpeg" } = opts;
  const img = await loadImage(typeof src === "string" ? src : URL.createObjectURL(src));
  const w = img.naturalWidth || img.width;
  const h = img.naturalHeight || img.height;
  if (!w || !h) throw new Error("That file does not look like a photo.");
  const scale = Math.min(1, maxDim / Math.max(w, h));
  const cw = Math.max(1, Math.round(w * scale));
  const ch = Math.max(1, Math.round(h * scale));
  const canvas = document.createElement("canvas");
  canvas.width = cw;
  canvas.height = ch;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, cw, ch);
  ctx.drawImage(img, 0, 0, cw, ch);
  return canvasToBlob(canvas, type, quality);
}

const ASPECTS = [
  { id: "listing", label: "Listing 3:4", value: 3 / 4 },
  { id: "square", label: "Square 1:1", value: 1 },
  { id: "portrait", label: "Portrait 4:5", value: 4 / 5 },
  { id: "original", label: "Original", value: 0 }
];

function editorMarkup() {
  return `
    <div class="pe-modal" role="dialog" aria-modal="true" aria-label="Edit photo">
      <div class="pe-head">
        <h3>Edit photo</h3>
        <button type="button" class="pe-close" aria-label="Close">✕</button>
      </div>
      <div class="pe-stage">
        <canvas class="pe-canvas" aria-label="Crop preview"></canvas>
      </div>
      <div class="pe-toolbar">
        <div class="choice-group pe-aspects">
          ${ASPECTS.map((a, i) => `<button type="button" class="chip ${i === 0 ? "active" : ""}" data-aspect="${a.id}">${a.label}</button>`).join("")}
        </div>
        <div class="pe-tools">
          <button type="button" class="btn btn-ghost pe-rotate" data-rotate="-1" aria-label="Rotate left">⟲</button>
          <button type="button" class="btn btn-ghost pe-rotate" data-rotate="1" aria-label="Rotate right">⟳</button>
          <label class="pe-zoom">Zoom
            <input type="range" min="1" max="3" step="0.01" value="1" aria-label="Zoom">
          </label>
        </div>
        <p class="pe-hint">Drag the photo to position it. Only what is inside the frame is saved.</p>
      </div>
      <div class="pe-actions">
        <button type="button" class="btn btn-ghost pe-cancel">Cancel</button>
        <button type="button" class="btn btn-primary pe-apply">Save photo</button>
      </div>
    </div>`;
}

// Opens a crop/resize modal for the given image source.
// Resolves with { blob } on Save, or null on Cancel.
export function openPhotoEditor(src) {
  return new Promise((resolve, reject) => {
    loadImage(src)
      .then((img) => {
        const overlay = document.createElement("div");
        overlay.className = "pe-overlay";
        overlay.innerHTML = editorMarkup();
        document.body.appendChild(overlay);
        document.body.classList.add("no-scroll");

        const canvas = overlay.querySelector(".pe-canvas");
        const ctx = canvas.getContext("2d");
        const zoomInput = overlay.querySelector(".pe-zoom input");
        const aspectBtns = overlay.querySelectorAll("[data-aspect]");

        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const WORK_W = 900;

        const state = { rot: 0, zoom: 1, ox: 0, oy: 0, aspect: ASPECTS[0].value };

        function rotatedDims() {
          return state.rot % 2 === 0 ? { w: iw, h: ih } : { w: ih, h: iw };
        }

        function baseScale() {
          const dims = rotatedDims();
          return Math.max(canvas.width / dims.w, canvas.height / dims.h);
        }

        function applyAspect() {
          const dims = rotatedDims();
          const ratio = state.aspect > 0 ? state.aspect : dims.w / dims.h;
          canvas.width = WORK_W;
          canvas.height = Math.max(1, Math.round(WORK_W / ratio));
          clampOffsets();
          render();
        }

        function clampOffsets() {
          const dims = rotatedDims();
          const s = baseScale() * state.zoom;
          const maxX = Math.max(0, (dims.w * s - canvas.width) / 2);
          const maxY = Math.max(0, (dims.h * s - canvas.height) / 2);
          state.ox = Math.min(maxX, Math.max(-maxX, state.ox));
          state.oy = Math.min(maxY, Math.max(-maxY, state.oy));
        }

        function render() {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.save();
          ctx.translate(canvas.width / 2 + state.ox, canvas.height / 2 + state.oy);
          ctx.rotate((state.rot * Math.PI) / 2);
          const s = baseScale() * state.zoom;
          ctx.scale(s, s);
          ctx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
          ctx.restore();
        }

        // --- pan -------------------------------------------------------
        let dragging = false;
        let lastX = 0;
        let lastY = 0;
        canvas.addEventListener("pointerdown", (event) => {
          dragging = true;
          lastX = event.clientX;
          lastY = event.clientY;
          canvas.setPointerCapture(event.pointerId);
          canvas.classList.add("dragging");
        });
        canvas.addEventListener("pointermove", (event) => {
          if (!dragging) return;
          const rect = canvas.getBoundingClientRect();
          const factor = rect.width ? canvas.width / rect.width : 1;
          state.ox += (event.clientX - lastX) * factor;
          state.oy += (event.clientY - lastY) * factor;
          lastX = event.clientX;
          lastY = event.clientY;
          clampOffsets();
          render();
        });
        const stopDrag = () => {
          dragging = false;
          canvas.classList.remove("dragging");
        };
        canvas.addEventListener("pointerup", stopDrag);
        canvas.addEventListener("pointercancel", stopDrag);

        // --- controls ----------------------------------------------------
        zoomInput.addEventListener("input", () => {
          state.zoom = Number(zoomInput.value) || 1;
          clampOffsets();
          render();
        });

        overlay.querySelectorAll("[data-rotate]").forEach((btn) => {
          btn.addEventListener("click", () => {
            state.rot = (state.rot + Number(btn.getAttribute("data-rotate")) + 4) % 4;
            applyAspect();
          });
        });

        aspectBtns.forEach((btn) => {
          btn.addEventListener("click", () => {
            const preset = ASPECTS.find((a) => a.id === btn.getAttribute("data-aspect"));
            if (!preset) return;
            state.aspect = preset.value;
            aspectBtns.forEach((b) => b.classList.toggle("active", b === btn));
            applyAspect();
          });
        });

        function close(result) {
          document.removeEventListener("keydown", onKey);
          overlay.remove();
          document.body.classList.remove("no-scroll");
          resolve(result);
        }

        function onKey(event) {
          if (event.key === "Escape") close(null);
        }
        document.addEventListener("keydown", onKey);

        overlay.querySelector(".pe-close").addEventListener("click", () => close(null));
        overlay.querySelector(".pe-cancel").addEventListener("click", () => close(null));
        overlay.addEventListener("click", (event) => {
          if (event.target === overlay) close(null);
        });

        overlay.querySelector(".pe-apply").addEventListener("click", async () => {
          try {
            const ratio = canvas.width / canvas.height;
            let ow;
            let oh;
            if (ratio >= 1) {
              ow = PHOTO_MAX_DIM;
              oh = Math.round(PHOTO_MAX_DIM / ratio);
            } else {
              oh = PHOTO_MAX_DIM;
              ow = Math.round(PHOTO_MAX_DIM * ratio);
            }
            const out = document.createElement("canvas");
            out.width = ow;
            out.height = oh;
            const octx = out.getContext("2d");
            const k = ow / canvas.width;
            octx.fillStyle = "#ffffff";
            octx.fillRect(0, 0, ow, oh);
            octx.save();
            octx.translate(ow / 2 + state.ox * k, oh / 2 + state.oy * k);
            octx.rotate((state.rot * Math.PI) / 2);
            const s = baseScale() * state.zoom * k;
            octx.scale(s, s);
            octx.drawImage(img, -iw / 2, -ih / 2, iw, ih);
            octx.restore();
            const blob = await canvasToBlob(out);
            close({ blob });
          } catch (err) {
            close(null);
            reject(err);
          }
        });

        applyAspect();
      })
      .catch(reject);
  });
}
