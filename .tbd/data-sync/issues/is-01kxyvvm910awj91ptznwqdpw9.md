---
type: is
id: is-01kxyvvm910awj91ptznwqdpw9
title: Implement AsciiRipple component (sim core + sampling + render/input/lifecycle)
kind: task
status: closed
priority: 2
version: 5
labels:
  - epic:ascii-ripple
  - group:window-1
dependencies:
  - type: blocks
    target: is-01kxyvvms2adqyp661qyt2r854
  - type: blocks
    target: is-01kxyvvnx95g77yysv5zge72md
  - type: blocks
    target: is-01kxyvvpd1tttfttanyf6zqkax
parent_id: is-01kxyvvksg4m7vef1nyq78ppnm
created_at: 2026-07-20T04:16:59.681Z
updated_at: 2026-07-20T04:33:21.486Z
closed_at: 2026-07-20T04:33:21.484Z
close_reason: Landed in 1f4647f (ascii-ripple spec executed, gate green)
---
spec: docs/tasks/ongoing/ascii-ripple/ascii-ripple-spec.md#phase-1-asciiripple-component (Steps 1.1-1.3)

Goal: Create src/components/global/AsciiRipple.tsx — the complete effect component. Named module-level constants (CELL_PX=12, DAMPING=0.985, IMPULSE_STRENGTH=3.0, IMPULSE_RADIUS_CELLS=2, SIM_DT=1/60, SLEEP_EPSILON=0.004, SLEEP_FRAMES=30, RENDER_EPSILON=0.01, DITHER_STRENGTH=1.5, MAX_DPR=2, GLYPH_RAMP=" .:-=+*#%@", BAYER4). Pure exported sim fns: createField / injectImpulse (cosine falloff, additive) / stepWaveField (neighbor-avg minus prev, clamped-index boundaries, x DAMPING). Background sampling: cover-fit rasterize backgroundUrl prop into cols x rows offscreen canvas, one getImageData, try/catch degrade to gray tint; crossOrigin=anonymous; disposed-flag guard. Render loop: rAF + fixed-dt accumulator (max 3 steps/frame), skip cells < RENDER_EPSILON, Bayer-dithered glyph index, wallpaper RGB x (0.6+0.8a), fillText, terminal-matching monospace stack. Input: one document pointerdown passive listener (clientX/Y, ignore non-primary mouse buttons), never preventDefault. prefers-reduced-motion: attach nothing when reduced, live change handling. Debounced resize (~150ms): reset-don't-rescale. Idle teardown: SLEEP_FRAMES quiet frames -> cancel rAF, clear, zero buffers. Full unmount cleanup. All browser APIs inside useEffect (component is SSR'd). Canvas: className='absolute inset-0 pointer-events-none', no z-index, aria-hidden.

Files: src/components/global/AsciiRipple.tsx (new)
reconcile: none (purely additive; no test tree exists)

Acceptance: file exists, exports default component + pure sim fns; pnpm build green; pnpm lint green.

Gate:
- pnpm build
- echo 'no tests yet'
- pnpm lint
