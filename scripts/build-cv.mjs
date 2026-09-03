#!/usr/bin/env node
// Compile src/cv/cv.html -> public/cv.pdf
//
// Deliberately zero-dependency: it drives a Chrome binary that is already on the
// machine rather than pulling in puppeteer. A devDependency would be installed on
// every Vercel build (and may fetch its own Chromium) for a script that only ever
// runs locally when the CV changes.
//
// Usage:  pnpm build:cv
// Override the browser with:  CHROME_PATH=/path/to/chrome pnpm build:cv

import { execFileSync, spawn } from "node:child_process";
import {
  existsSync,
  mkdirSync,
  mkdtempSync,
  readdirSync,
  rmSync,
  statSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const INPUT = join(ROOT, "src", "cv", "cv.html");
const OUTPUT = join(ROOT, "public", "cv.pdf");
const HOME = process.env.HOME ?? "";

// Full Chrome writes the PDF and then lingers instead of exiting, so it needs a
// watchdog. chrome-headless-shell exits on its own in a couple of seconds.
const TIMEOUT_MS = 60_000;

function firstExisting(paths) {
  return paths.find((candidate) => candidate && existsSync(candidate)) ?? null;
}

// Search a browser-cache root for a headless-shell binary, newest version first.
function findInCache(root, binaryName) {
  if (!existsSync(root)) return null;
  let found = null;
  const walk = (dir, depth) => {
    if (found || depth > 4) return;
    let entries;
    try {
      entries = readdirSync(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries.sort((a, b) => b.name.localeCompare(a.name))) {
      if (found) return;
      const full = join(dir, entry.name);
      if (entry.isDirectory()) walk(full, depth + 1);
      else if (entry.name === binaryName) found = full;
    }
  };
  walk(root, 0);
  return found;
}

// Prefer a headless shell (fast, exits cleanly); fall back to a full browser.
function findBrowser() {
  if (process.env.CHROME_PATH) {
    if (!existsSync(process.env.CHROME_PATH)) {
      console.error(`[build:cv] CHROME_PATH does not exist: ${process.env.CHROME_PATH}`);
      process.exit(1);
    }
    return { bin: process.env.CHROME_PATH, needsWatchdog: true };
  }

  const shell = firstExisting([
    findInCache(join(HOME, ".cache/puppeteer/chrome-headless-shell"), "chrome-headless-shell"),
    findInCache(join(HOME, "Library/Caches/ms-playwright"), "chrome-headless-shell"),
    findInCache(join(HOME, ".cache/ms-playwright"), "chrome-headless-shell"),
  ]);
  if (shell) return { bin: shell, needsWatchdog: false };

  const full = firstExisting([
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    "/Applications/Chromium.app/Contents/MacOS/Chromium",
    "/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge",
    "/usr/bin/google-chrome",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser",
  ]);
  return full ? { bin: full, needsWatchdog: true } : null;
}

function pdfIsUsable() {
  return existsSync(OUTPUT) && statSync(OUTPUT).size > 1024;
}

if (!existsSync(INPUT)) {
  console.error(`[build:cv] Missing CV source: ${INPUT}`);
  process.exit(1);
}

const browser = findBrowser();
if (!browser) {
  console.error(
    "[build:cv] No Chrome/Chromium found. Install Google Chrome, or set CHROME_PATH to a browser binary.",
  );
  process.exit(1);
}

mkdirSync(dirname(OUTPUT), { recursive: true });
rmSync(OUTPUT, { force: true });

// A throwaway profile keeps this from clashing with an already-running Chrome.
const profile = mkdtempSync(join(tmpdir(), "cv-pdf-"));

// The browser may still be flushing into the profile as we tear it down, which
// surfaces as ENOTEMPTY. Retry, and never let cleanup fail a build whose PDF is
// already on disk — a stray temp dir is not worth a non-zero exit.
function cleanupProfile() {
  try {
    rmSync(profile, { recursive: true, force: true, maxRetries: 10, retryDelay: 200 });
  } catch {
    // Leave it for the OS to sweep.
  }
}
const args = [
  "--headless",
  "--disable-gpu",
  `--user-data-dir=${profile}`,
  "--no-pdf-header-footer",
  `--print-to-pdf=${OUTPUT}`,
  pathToFileURL(INPUT).href,
];

const wait = (ms) => new Promise((done) => setTimeout(done, ms));

// Full Chrome writes the PDF and then keeps running, so poll for the output and
// stop it ourselves once the file has settled.
async function renderWithWatchdog() {
  const child = spawn(browser.bin, args, { stdio: "ignore" });
  const spawnFailed = new Promise((_, reject) => child.on("error", reject));
  const startedAt = Date.now();
  try {
    while (Date.now() - startedAt < TIMEOUT_MS) {
      if (pdfIsUsable()) {
        // Let the write flush, and confirm the size has stopped growing.
        const before = statSync(OUTPUT).size;
        await Promise.race([wait(1000), spawnFailed]);
        if (statSync(OUTPUT).size === before) return;
      }
      await Promise.race([wait(400), spawnFailed]);
    }
    throw new Error(`Timed out after ${TIMEOUT_MS / 1000}s waiting for the PDF.`);
  } finally {
    child.kill("SIGKILL");
  }
}

try {
  if (browser.needsWatchdog) {
    await renderWithWatchdog();
  } else {
    execFileSync(browser.bin, args, { stdio: ["ignore", "ignore", "pipe"], timeout: TIMEOUT_MS });
  }
} catch (error) {
  if (!pdfIsUsable()) {
    console.error(`[build:cv] Chrome failed to render the CV: ${error.message}`);
    if (error.stderr) console.error(String(error.stderr).trim());
    cleanupProfile();
    process.exit(1);
  }
} finally {
  cleanupProfile();
}

if (!pdfIsUsable()) {
  console.error("[build:cv] Chrome exited cleanly but produced no usable PDF.");
  process.exit(1);
}

const kb = (statSync(OUTPUT).size / 1024).toFixed(0);
console.log(`[build:cv] Wrote public/cv.pdf (${kb} KB) via ${browser.bin}`);
