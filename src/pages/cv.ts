import { readFileSync } from "node:fs";
import { join } from "node:path";
import type { APIRoute } from "astro";

export const prerender = false;

// The CV lives at public/cv.pdf, so Vercel already serves it statically at
// /cv.pdf. This route exists purely to give it a short, memorable URL that
// stays in the address bar — rei.gg/cv rather than rei.gg/cv.pdf — since the
// link gets shared by hand.
//
// Serving it means reading the file from the serverless bundle, which only
// contains it because of `includeFiles` in astro.config.mjs. Keep the two in
// sync: drop that entry and this route 404s in production while still working
// in dev, where the whole project directory is on disk.
const PDF_PATH = join(process.cwd(), "public", "cv.pdf");

// Name the browser uses if a visitor saves the file — /cv would otherwise
// suggest a extension-less "cv".
const DOWNLOAD_FILENAME = "rei-nova-cv.pdf";

// Read once per warm instance rather than per request; the file is immutable
// for the lifetime of a deployment.
let cached: Uint8Array | null = null;

function loadPdf(): Uint8Array {
  if (!cached) cached = new Uint8Array(readFileSync(PDF_PATH));
  return cached;
}

export const GET: APIRoute = () => {
  const pdf = loadPdf();

  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      // `inline` renders the PDF in the tab instead of downloading it.
      "Content-Disposition": `inline; filename="${DOWNLOAD_FILENAME}"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
};
