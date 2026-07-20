# Desktop Doctrine (DOCTRINE)

> Load when touching the desktop environment: windows, toolbar, dock, icons, backgrounds,
> or desktop-layer effects.

**Authority**: Binding
**Version**: 0.2.0
**Date**: 2026-07-20
**Status**: Active

---

## 1. Scope

### In scope
- The macOS-inspired desktop environment: window management (draggable/resizable terminal), MacToolbar, Dock, desktop icons, and the background rotation system.
- The desktop **effects layer**: full-viewport decorative overlays (canvas or otherwise) that render between the wallpaper and the interactive UI — e.g. `src/components/global/AsciiRipple.tsx`.

### Out of scope
- Chatbot / OpenAI request behaviour (`src/pages/api/chat.ts`, MacTerminal's message loop) — an API concern, not a desktop-layer concern.
- Background *selection* internals: which wallpaper is chosen and the `lastBackground` localStorage persistence live in `src/layouts/AppLayout.tsx` alone. Consumers of the wallpaper receive a resolved URL; they do not re-derive selection.

---

## 2. Binding Rules (MUSTs)

- MUST: decorative overlays (effect layers) are `pointer-events: none` and are placed by **DOM order** in `AppLayout.tsx` — after the wallpaper block, before the first interactive UI layer. They claim **no z-index band**; DOM order is the stacking mechanism.
- MUST: the reserved z bands stay stable and decorative layers never occupy one — icons `z-0`, toolbar `z-10`, terminal `z-20`, modal windows `z-25`, docks `z-30`/`z-50`.
- MUST: desktop animation loops are **self-suspending** — zero idle `requestAnimationFrame` cost once energy decays; the loop is cancelled and only restarts on new input.
- MUST: desktop-wide input observation uses **document-level passive listeners** (`{ passive: true }`) and never calls `preventDefault`/`stopPropagation`. Interaction ownership stays with the components that own it (e.g. MacTerminal's own document-level drag/resize listeners must see every event untouched).
- MUST NOT: gate a motion feature on `prefers-reduced-motion: reduce` by merely pausing. When reduced motion is active — including a **live** media-query change — the feature registers no listeners and does no draw work at all, and tears down cleanly if it was already running.

---

## 3. Recommended Practices (SHOULDs)

- SHOULD: background consumers receive the resolved wallpaper URL as a **prop from AppLayout** (`backgroundUrl={backgroundMap[currentBg]}`) rather than reading selection state or `lastBackground` localStorage themselves.
- SHOULD: express tuning parameters as **named module-level constants** (SCREAMING_SNAKE) at the top of the file — no inline magic numbers — so behaviour is legible and adjustable in one place.
- SHOULD: keep any pure computation (e.g. a simulation step) as **exported pure functions** separate from the React lifecycle, so it can be unit-tested later without restructuring.
- SHOULD: put **all** browser API access (`window`, `document`, `matchMedia`, canvas) inside `useEffect` — desktop components are SSR'd by `client:load`, so render must touch no browser globals.

---

## 4. Anti-patterns

- Giving a decorative overlay an explicit z-index — it competes with the reserved bands and breaks the DOM-order contract. (`AsciiRipple` deliberately uses `className='absolute inset-0 pointer-events-none'` with no z-index.)
- Attaching a non-passive listener, or calling `preventDefault`/`stopPropagation`, from a desktop-wide observer — it can swallow or delay the drag/resize/click handling that owning components depend on.
- Leaving a `requestAnimationFrame` loop running after the animation is visually at rest — it drains battery for zero visible benefit. Track amplitude/energy and cancel the loop.
- Reading background-selection state (`currentBg`, `lastBackground`) from a consumer component instead of taking the resolved URL as a prop — it duplicates ownership of a decision AppLayout already made.
- Referencing `window`/`document` at module scope or in render — it breaks the SSR build.

---

## 5. Examples

**Effect-layer mount (DOM order, no z-index)** — `src/layouts/AppLayout.tsx`:

```tsx
{backgroundVideo ? <video … /> : <div … />}

<AsciiRipple backgroundUrl={backgroundMap[currentBg]} />

<div className="relative z-10">
  <MacToolbar />
</div>
```

The ripple canvas sits between the wallpaper and the toolbar purely by source order; it carries `pointer-events: none` and no z-index, so every band above it (`z-10` … `z-50`) paints over it and every pointer event passes straight through to the owning UI.

**Self-suspending loop + reduced-motion gating** — `src/components/global/AsciiRipple.tsx`:

- A fixed-timestep rAF loop tracks a max-amplitude value each frame; after a run of quiet frames (`SLEEP_FRAMES` below `SLEEP_EPSILON`) it calls `cancelAnimationFrame`, clears the canvas, and zeroes its buffers. The single document `pointerdown` listener restarts it only when it is not already running.
- At mount it checks `matchMedia('(prefers-reduced-motion: reduce)')`; when reduced it attaches nothing. It subscribes to the query's `change` event so a live toggle to reduced tears the effect down (removes the pointer listener, clears the canvas) and a toggle back re-arms it.
- All simulation state lives in refs, and the pure core (`createField`, `injectImpulse`, `stepWaveField`) is exported for future unit tests. Tuning lives in named constants (`CELL_PX`, `DAMPING`, `SLEEP_EPSILON`, `GLYPH_RAMP`, …) — no inline magic numbers.

---

## 6. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 0.1.0 | 2026-07-19 | Initial draft (scaffolded by /substrate:add-doctrine) |
| 0.2.0 | 2026-07-20 | Filled from the ascii-ripple epic (`docs/tasks/completed/ascii-ripple/`). Ratified the desktop effects-layer contract the landed `AsciiRipple.tsx` + AppLayout mount demonstrate: pointer-events-none DOM-order overlays with no z band, self-suspending rAF loops, document-level passive input observation, `prefers-reduced-motion` gating incl. live changes, background URL via prop, named-constant tuning, SSR-safe browser-API-in-effect. Retitled H1 to `(DOCTRINE)` + added preload blockquote; Status Draft → Active. |
