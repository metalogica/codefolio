import { useEffect, useRef } from "react";

// --- Tuning constants (spec §3.1) — no inline magic numbers below this block. ---
const CELL_PX = 12; // grid cell size; ~160×90 cells at 1080p, ~33×71 on a phone
const DAMPING = 0.985; // usable range 0.97–0.995
const IMPULSE_STRENGTH = 3.0;
const IMPULSE_RADIUS_CELLS = 2; // cosine falloff
const SIM_DT = 1 / 60; // fixed timestep
const SLEEP_EPSILON = 0.004; // max-amplitude threshold for teardown
const SLEEP_FRAMES = 30; // consecutive quiet frames before stop
const RENDER_EPSILON = 0.01; // cells below this skip drawing
const DITHER_STRENGTH = 1.5; // Bayer modulation
const MAX_DPR = 2; // caps 3× phones' canvas pixels
const GLYPH_RAMP = " .:-=+*#%@"; // index 0 never drawn
const NEUTRAL_TINT = 200; // gray fallback channel when sampling is unavailable

// Standard 4×4 Bayer ordered-dither matrix (values 0–15).
const BAYER4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
];

const FONT_STACK =
  "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace";

// --- Pure simulation core (exported for future unit tests; spec §3.1 Testability). ---

export type WaveField = {
  prev: Float32Array;
  curr: Float32Array;
  cols: number;
  rows: number;
};

export function createField(cols: number, rows: number): WaveField {
  const size = cols * rows;
  return {
    prev: new Float32Array(size),
    curr: new Float32Array(size),
    cols,
    rows,
  };
}

// Cosine-falloff impulse, additive (superposition), written into `prev`.
export function injectImpulse(
  field: WaveField,
  cellX: number,
  cellY: number,
  strength: number,
  radiusCells: number,
) {
  const { prev, cols, rows } = field;
  const r = Math.max(1, radiusCells);
  const minX = Math.max(0, cellX - r);
  const maxX = Math.min(cols - 1, cellX + r);
  const minY = Math.max(0, cellY - r);
  const maxY = Math.min(rows - 1, cellY + r);
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      const dx = x - cellX;
      const dy = y - cellY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > r) continue;
      // cos falloff: 1 at center → 0 at radius edge
      const falloff = 0.5 * (1 + Math.cos((Math.PI * dist) / r));
      prev[y * cols + x] += strength * falloff;
    }
  }
}

// Neighbour-average wave rule with clamped-index (Neumann) boundaries → edge
// reflection for free. Writes the next state into `curr`, then swaps buffers so
// the freshest heights always live in `field.prev`.
export function stepWaveField(field: WaveField, damping: number) {
  const { prev, curr, cols, rows } = field;
  for (let y = 0; y < rows; y++) {
    const yUp = y > 0 ? y - 1 : 0;
    const yDown = y < rows - 1 ? y + 1 : rows - 1;
    for (let x = 0; x < cols; x++) {
      const xLeft = x > 0 ? x - 1 : 0;
      const xRight = x < cols - 1 ? x + 1 : cols - 1;
      const i = y * cols + x;
      const sum =
        prev[y * cols + xLeft] +
        prev[y * cols + xRight] +
        prev[yUp * cols + x] +
        prev[yDown * cols + x];
      curr[i] = (sum / 2 - curr[i]) * damping;
    }
  }
  field.prev = curr;
  field.curr = prev;
}

// Discriminated result: a real sample, a taint-fallback (gray), or a decode
// failure that disables the effect entirely.
type SampleResult =
  | { status: "ok"; data: Uint8ClampedArray }
  | { status: "gray" }
  | { status: "disabled" };

export default function AsciiRipple({ backgroundUrl }: { backgroundUrl: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    // All browser APIs live inside this effect: the component is SSR'd by
    // `client:load`, so window/document/matchMedia must not run at render.
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotionMq = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );

    let disposed = false;
    let armed = false;
    let disabled = false; // decode failed permanently
    let field: WaveField = createField(1, 1);
    let sample: Uint8ClampedArray | null = null; // null → neutral gray tint
    let cols = 1;
    let rows = 1;
    let dpr = 1;
    let rafId = 0;
    let running = false;
    let quietFrames = 0;
    let lastTs = 0;
    let accumulator = 0;
    let resizeTimer = 0;

    function computeDims() {
      dpr = Math.min(window.devicePixelRatio || 1, MAX_DPR);
      cols = Math.ceil(window.innerWidth / CELL_PX);
      rows = Math.ceil(window.innerHeight / CELL_PX);
    }

    function sizeCanvas() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      canvas!.width = Math.floor(w * dpr);
      canvas!.height = Math.floor(h * dpr);
      canvas!.style.width = `${w}px`;
      canvas!.style.height = `${h}px`;
      // Draw in CSS-pixel units; the backing store carries the dpr scale.
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx!.font = `${CELL_PX}px ${FONT_STACK}`;
      ctx!.textAlign = "center";
      ctx!.textBaseline = "middle";
    }

    // Cover-fit rasterize the wallpaper into a cols×rows buffer (one pixel per
    // cell), replicating CSS object-cover / bg-center. Spec §3.1.
    async function rasterize(): Promise<SampleResult> {
      try {
        const img = new Image();
        img.crossOrigin = "anonymous"; // defensive against a future CDN move
        img.src = backgroundUrl;
        await img.decode();
        if (disposed) return { status: "disabled" };
        const off = document.createElement("canvas");
        off.width = cols;
        off.height = rows;
        const octx = off.getContext("2d");
        if (!octx) return { status: "gray" };
        const iw = img.naturalWidth || img.width;
        const ih = img.naturalHeight || img.height;
        const scale = Math.max(cols / iw, rows / ih);
        const dw = iw * scale;
        const dh = ih * scale;
        const dx = (cols - dw) / 2;
        const dy = (rows - dh) / 2;
        octx.drawImage(img, dx, dy, dw, dh);
        try {
          const data = octx.getImageData(0, 0, cols, rows).data;
          return { status: "ok", data };
        } catch {
          return { status: "gray" }; // tainted canvas → neutral tint
        }
      } catch {
        return { status: "disabled" }; // decode rejected → effect disabled
      }
    }

    function onPointerDown(e: PointerEvent) {
      // Never preventDefault/stopPropagation: MacTerminal's own document-level
      // drag/resize listeners must see every event untouched.
      if (e.pointerType === "mouse" && e.button !== 0) return;
      const cx = Math.min(cols - 1, Math.max(0, Math.floor(e.clientX / CELL_PX)));
      const cy = Math.min(rows - 1, Math.max(0, Math.floor(e.clientY / CELL_PX)));
      injectImpulse(field, cx, cy, IMPULSE_STRENGTH, IMPULSE_RADIUS_CELLS);
      if (!running) startLoop();
    }

    function startLoop() {
      running = true;
      quietFrames = 0;
      lastTs = 0;
      accumulator = 0;
      rafId = requestAnimationFrame(frame);
    }

    function stopLoop() {
      running = false;
      if (rafId) cancelAnimationFrame(rafId);
      rafId = 0;
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      field.prev.fill(0);
      field.curr.fill(0);
    }

    function frame(ts: number) {
      if (!running) return;
      if (lastTs === 0) lastTs = ts;
      let dt = (ts - lastTs) / 1000;
      lastTs = ts;
      if (dt > 0.25) dt = 0.25; // clamp huge gaps (backgrounded tab)
      accumulator += dt;
      let steps = 0;
      while (accumulator >= SIM_DT && steps < 3) {
        stepWaveField(field, DAMPING);
        accumulator -= SIM_DT;
        steps++;
      }
      if (steps === 3) accumulator = 0; // drop backlog beyond the step cap
      const maxAmp = render();
      if (maxAmp < SLEEP_EPSILON) {
        quietFrames++;
        if (quietFrames >= SLEEP_FRAMES) {
          stopLoop(); // idle teardown: zero rAF until the next input
          return;
        }
      } else {
        quietFrames = 0;
      }
      rafId = requestAnimationFrame(frame);
    }

    function render(): number {
      ctx!.clearRect(0, 0, window.innerWidth, window.innerHeight);
      const heights = field.prev; // freshest state after the swap
      const c = field.cols;
      const r = field.rows;
      const half = CELL_PX / 2;
      let maxAmp = 0;
      for (let y = 0; y < r; y++) {
        for (let x = 0; x < c; x++) {
          const amp = heights[y * c + x];
          const abs = amp < 0 ? -amp : amp;
          if (abs > maxAmp) maxAmp = abs;
          if (abs < RENDER_EPSILON) continue;
          const a = abs > 1 ? 1 : abs;
          const dither = (BAYER4[y & 3][x & 3] / 16 - 0.5) * DITHER_STRENGTH;
          let gi = Math.floor(a * 9 + dither);
          gi = gi < 0 ? 0 : gi > 9 ? 9 : gi;
          if (gi === 0) continue; // index 0 is blank space — never drawn
          let rr = NEUTRAL_TINT;
          let gg = NEUTRAL_TINT;
          let bb = NEUTRAL_TINT;
          if (sample) {
            const si = (y * c + x) * 4;
            rr = sample[si];
            gg = sample[si + 1];
            bb = sample[si + 2];
          }
          // brighten with amplitude, dissolve at rest; clamp channels to 255
          const f = 0.6 + 0.8 * a;
          rr = Math.min(255, rr * f) | 0;
          gg = Math.min(255, gg * f) | 0;
          bb = Math.min(255, bb * f) | 0;
          ctx!.fillStyle = `rgb(${rr},${gg},${bb})`;
          ctx!.fillText(GLYPH_RAMP[gi], x * CELL_PX + half, y * CELL_PX + half);
        }
      }
      return maxAmp;
    }

    async function arm() {
      if (armed || disposed || disabled) return;
      armed = true;
      computeDims();
      sizeCanvas();
      field = createField(cols, rows);
      const res = await rasterize();
      if (disposed || !armed) return;
      if (res.status === "disabled") {
        disabled = true;
        armed = false;
        return; // effect silently disabled — no listeners, no loop
      }
      sample = res.status === "ok" ? res.data : null;
      document.addEventListener("pointerdown", onPointerDown, { passive: true });
      window.addEventListener("resize", onResize);
    }

    function disarm() {
      armed = false;
      stopLoop();
      document.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("resize", onResize);
      if (resizeTimer) {
        clearTimeout(resizeTimer);
        resizeTimer = 0;
      }
    }

    function onResize() {
      // Reset, don't rescale (spec §3.1): rebuild buffers + sample at new dims.
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(async () => {
        resizeTimer = 0;
        if (disposed || !armed) return;
        stopLoop();
        computeDims();
        sizeCanvas();
        field = createField(cols, rows);
        const res = await rasterize();
        if (disposed || !armed) return;
        if (res.status === "ok") sample = res.data;
        else if (res.status === "gray") sample = null;
        // decode failure on resize keeps the prior sample rather than killing it
      }, 150);
    }

    function onReducedChange() {
      if (reducedMotionMq.matches) disarm();
      else void arm();
    }

    if (!reducedMotionMq.matches) void arm();
    reducedMotionMq.addEventListener("change", onReducedChange);

    return () => {
      disposed = true;
      reducedMotionMq.removeEventListener("change", onReducedChange);
      disarm();
    };
  }, [backgroundUrl]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      aria-hidden="true"
    />
  );
}
