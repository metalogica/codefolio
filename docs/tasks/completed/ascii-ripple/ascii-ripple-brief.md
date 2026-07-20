# ASCII Ripple Brief

**Author**: Rei Jarram (Q&A with Claude)
**Date**: 2026-07-20
**Status**: Draft

---

## User Story

As a visitor to the portfolio site,
I want every click (desktop) or tap (mobile) to spawn a light, dithered ASCII ripple that
propagates outward from the pointer with water-like physics and dissolves into the wallpaper,
so that the macOS desktop feels alive and tactile, reinforcing the site's terminal/ASCII identity.

---

## Design Decisions (from Socratic Q&A)

- **Rendering**: full-screen `<canvas>` overlay quantized to a coarse ASCII grid (~10–16px
  cells). Each cell's wave amplitude maps to a glyph density ramp (` .:-=+*#%@`), optionally
  modulated by an ordered (Bayer) dither threshold for the "light dithering" texture.
- **Blend style — wallpaper-sampled glyphs**: each cell samples the active background image's
  color under it; amplitude modulates glyph density + brightness, so the wallpaper itself
  appears to ripple into ASCII and the effect dissolves into the image at the ripple's edge.
- **Physics — full height-field simulation**: two amplitude buffers; each frame every cell
  takes the neighbor average minus its previous value, times a damping factor. Overlapping
  ripples interfere; waves reflect off screen edges; amplitude decays naturally.
- **Trigger — everywhere, clicks/taps only**: document-level listeners; any click/touch
  anywhere (desktop, terminal, dock) injects one impulse at that point. No drag/swipe trails.
  Listeners are passive and never intercept or delay UI interaction.
- **Z-order — occluded by UI**: the canvas sits above the wallpaper but below the terminal
  window, MacToolbar, dock, and icons. A ripple born under a window emerges from beneath its
  edges ("the desktop is the water surface").
- **Background sampling — draw once, sample buffer**: on mount and on resize, draw the active
  background into an offscreen canvas sized to the ASCII grid and read it once with
  `getImageData`; per-frame sampling is an array lookup. `AppLayout` passes the resolved
  background URL as a prop (it already owns background selection + localStorage rotation).
- **Idle teardown**: the rAF loop stops when all cell amplitudes decay below a threshold;
  idle cost is zero.

---

## Constraints

- MUST: disable the effect entirely when `prefers-reduced-motion: reduce` is set.
- MUST: never intercept, delay, or swallow pointer events — the canvas is
  `pointer-events: none`; ripple impulses come from document-level passive listeners.
- MUST: stop the animation loop when no ripple energy remains (no idle rAF/CPU cost).
- MUST: work on both mouse (click) and touch (tap) input.
- MUST: sit below all interactive UI (terminal, toolbar, dock, icons) in z-order.
- MUST NOT: touch the chatbot/API code or the background rotation logic beyond passing the
  resolved background URL into the effect component.
- SHOULD: hold 60fps on a mid-range phone at the chosen grid resolution; the sim grid is
  coarse (~100×60 cells) so this is expected, but verify.
- SHOULD: handle window resize and devicePixelRatio correctly (re-rasterize the sample
  buffer, preserve or reset the wave field).
- SHOULD: be a self-contained React component (e.g. `src/components/global/AsciiRipple.tsx`)
  mounted from `AppLayout.tsx`.

---

## References

- Doctrine: `docs/doctrine/desktop-doctrine.md` (desktop environment — windows, dock,
  background system)
- `src/layouts/AppLayout.tsx` — owns background selection/rotation; mount point and
  background-URL prop source.
- `src/components/global/MacTerminal.tsx` — existing z-order reference for the window layer.

---

## Acceptance Criteria

- [ ] Clicking anywhere on desktop spawns a ripple that expands from the click point,
      interferes with other active ripples, reflects off screen edges, and fully decays.
- [ ] Tapping on a touch device does the same.
- [ ] Ripple glyphs are tinted with the wallpaper's colors under them (visibly different
      across the 3 backgrounds) and fade into the wallpaper at low amplitude.
- [ ] The terminal window, toolbar, dock, and icons render above the ripple; a ripple
      started under the terminal emerges from beneath its edges.
- [ ] All existing interactions (dragging/resizing the terminal, dock clicks, icon opens,
      chatbot input) behave identically with the effect active.
- [ ] With `prefers-reduced-motion: reduce`, no canvas work happens at all.
- [ ] After ripples decay, no requestAnimationFrame loop is running (verifiable via
      Performance panel).
- [ ] `pnpm build` and `pnpm lint` pass.

---

## Out of Scope

- Drag/swipe ripple trails (explicitly deferred in Q&A).
- Rendering the effect over UI chrome (screen-space shader variant).
- Animated/video wallpapers or live per-frame background sampling.
- Ambient/idle ripples (rain effect) with no user input.
- Sound effects.

---

## Open Questions

1. Exact glyph ramp, cell size, damping coefficient, and impulse strength — tune visually;
   the architect should propose defaults and make them named constants.
2. Should the mobile grid be coarser than desktop for battery headroom, or is the uniform
   grid cheap enough? (Q&A leaned "uniform is fine" — verify, don't assume.)
3. Font choice for glyphs (monospace stack vs. matching the terminal's font) and whether
   glyphs render via `fillText` per cell or a prebuilt glyph atlas if `fillText` proves slow.
4. Whether the wave field should reset or rescale on window resize.
