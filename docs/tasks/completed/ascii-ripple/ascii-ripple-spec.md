# ASCII Ripple: Technical Specification

**Version**: 1.0.0
**Status**: Draft
**Author**: Architect Agent (desktop + agents doctrine-architects)
**Date**: 2026-07-20
**Brief**: `docs/tasks/ongoing/ascii-ripple/ascii-ripple-brief.md`

---

## 1. Overview

### 1.1 Objective

Every click (desktop) or tap (mobile) spawns a light, dithered ASCII ripple that propagates
outward from the pointer with water-like physics (interference, edge reflection, damping) and
dissolves into the wallpaper. Rendered on a full-viewport canvas quantized to a coarse glyph
grid, tinted with the wallpaper's own pixel colors, sitting below all interactive UI.

**Code reality note (supersedes stale CLAUDE.md/brief wording):** the live desktop renders a
*video* wallpaper (`/bg-ascii.mp4`, poster `/bg-3.avif`) — `src/components/LandingPage.astro`
passes `backgroundMap = { 'bg-3': '/bg-3.avif' }` + `backgroundVideo`, and `AppLayout.tsx`
prefers the video. Backgrounds are plain `public/` paths (same-origin, no canvas taint), not
`getImage()` assets. The ripple samples the **static poster URL** received as a prop
(`backgroundMap[currentBg]`); per-frame video sampling is out of scope.

### 1.2 Constraints

- MUST: disable entirely under `prefers-reduced-motion: reduce` (no listeners, no canvas
  work), including **live** media-query changes.
- MUST: never intercept, delay, or swallow pointer events — canvas is `pointer-events: none`;
  impulses come from one document-level **passive** `pointerdown` listener.
- MUST: stop the rAF loop when ripple energy decays below threshold (zero idle cost);
  restart only on new input.
- MUST: work for mouse click and touch tap (pointer events unify both).
- MUST: render below all interactive UI (icons, toolbar, terminal, windows, docks).
- MUST NOT: touch chatbot/API code or background-selection logic beyond the URL prop.
- SHOULD: hold ~60fps on mid-range mobile; SHOULD handle resize + devicePixelRatio.

### 1.3 Success Criteria

Binary; each maps to a verification step in §8:

1. Click/tap anywhere spawns a ripple that expands, interferes with other ripples, reflects
   off screen edges, and fully decays.
2. Glyph tint derives from the `backgroundUrl` prop's pixels (cover-fit aligned with the
   visible wallpaper); verified against `/bg-3.avif`; holds by construction if rotation
   returns. *(Reworded from the brief's "3 backgrounds" criterion — see Change Log.)*
3. Terminal, toolbar, dock, icons render above the ripple; a ripple born under the terminal
   emerges from beneath its edges.
4. All existing interactions (terminal drag/resize, dock, icons, chatbot input) unchanged.
5. Under reduced-motion: zero canvas work, zero listeners.
6. After decay: zero rAF activity (Performance panel).
7. `pnpm build` and `pnpm lint` pass.

---

## 2. Scope

| In Scope | Out of Scope |
|----------|--------------|
| `AsciiRipple.tsx` component (sim + render + lifecycle) | Drag/swipe ripple trails |
| One-line mount in `AppLayout.tsx` with `backgroundUrl` prop | Rendering over UI chrome |
| Reduced-motion gating, idle teardown, resize handling | Per-frame video wallpaper sampling |
| Doctrine reconciliation (fill desktop-doctrine stub) | Ambient/idle ripples, sound |
| Manifest trigger additions for desktop doctrine | Test-framework installation (flagged opt-in only) |

---

## 3. Architecture / Data Model

### 3.1 Desktop layer (doctrine: desktop, layer-hint: frontend)

**Component placement.** `src/components/global/AsciiRipple.tsx`, props
`{ backgroundUrl: string }`. Mounted in `src/layouts/AppLayout.tsx` immediately **after** the
background block (`{backgroundVideo ? <video/> : <div/>}`) and **before**
`<div className="relative z-10"><MacToolbar/></div>`. Canvas class:
`absolute inset-0 pointer-events-none`, **no z-index** — DOM order is the stacking mechanism.
Existing z bands stay reserved: icons `z-0`, toolbar `z-10`, terminal `z-20`, modal windows
`z-25`, dock wrappers `z-30`/`z-50`. AppLayout keeps sole ownership of background selection;
the component never reads `lastBackground` localStorage.

**Hydration.** `LandingPage.astro` mounts `<AppLayout client:load>`; AsciiRipple hydrates as
an ordinary child. `client:load` still SSRs — **all** browser APIs (`window`, `document`,
`matchMedia`) live inside `useEffect`; render is a bare `<canvas ref>`.

**Wave simulation.** Two-buffer height field, `prev`/`curr` as `Float32Array(cols × rows)`:
`next = (left + right + up + down) / 2 − prev[i]`, then `× DAMPING`. Clamped-index (Neumann)
boundaries give edge reflection for free. Fixed-timestep accumulator (`SIM_DT = 1/60`, max 3
steps/frame) so 120Hz displays don't double wave speed. Impulse: cosine falloff over
`IMPULSE_RADIUS_CELLS` injected into `prev` at the tapped cell.

**Named constants** (module-level, SCREAMING_SNAKE — no inline magic numbers):

| Constant | Default | Notes |
|----------|---------|-------|
| `CELL_PX` | `12` | grid cell size; ~160×90 cells at 1080p, ~33×71 on a phone |
| `DAMPING` | `0.985` | usable range 0.97–0.995 |
| `IMPULSE_STRENGTH` | `3.0` | |
| `IMPULSE_RADIUS_CELLS` | `2` | cosine falloff |
| `SIM_DT` | `1/60` | fixed timestep |
| `SLEEP_EPSILON` | `0.004` | max-amplitude threshold for teardown |
| `SLEEP_FRAMES` | `30` | consecutive quiet frames before stop |
| `RENDER_EPSILON` | `0.01` | cells below this skip drawing |
| `DITHER_STRENGTH` | `1.5` | Bayer modulation |
| `MAX_DPR` | `2` | caps 3× phones' canvas pixels |
| `GLYPH_RAMP` | `" .:-=+*#%@"` | index 0 never drawn |

**Rendering.** `fillText` per active cell (no glyph atlas — typical frames draw < 2k glyphs
after the `RENDER_EPSILON` skip; atlas is the documented fallback if profiling shows > 8ms
render frames). Font: `${CELL_PX}px ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas,
monospace` (matches the terminal's `font-mono` identity), `textAlign: center`,
`textBaseline: middle`. Glyph index:
`clamp(floor(a × 9 + (BAYER4[y&3][x&3]/16 − 0.5) × DITHER_STRENGTH), 0, 9)` with
`a = clamp(|amp|, 0, 1)`; standard 4×4 Bayer matrix constant. Fill color = sampled wallpaper
RGB scaled by `0.6 + 0.8a` (clamped) so glyphs brighten with amplitude and dissolve at rest.

**Background sampling — draw once, sample buffer.** On mount and debounced resize:
`new Image()`, `crossOrigin = "anonymous"` (defensive), `await img.decode()`, draw into a
`document.createElement('canvas')` sized `cols × rows` using **cover-fit math replicating CSS
`object-cover`/`bg-cover bg-center`** (`scale = max(cols/imgW, rows/imgH)`, center-crop), one
`getImageData` → stored `Uint8ClampedArray`; per-frame lookup is `data[(y·cols + x) · 4]`.
`getImageData` in try/catch → graceful degrade to neutral light-gray tint. `disposed` flag
guards the await; decode rejection disables the effect silently.

**Events & lifecycle.** One `document.addEventListener('pointerdown', h, { passive: true })`;
use `e.clientX/clientY`; ignore non-primary mouse buttons; never `preventDefault`/
`stopPropagation` (MacTerminal's custom document-level drag/resize listeners — it does NOT
use react-draggable — are untouchable by a passive observer). Reduced-motion: `matchMedia`
checked in the mount effect; when matching, attach nothing; subscribe to `change` for live
toggling (on → full teardown + clear; off → re-arm). Resize (~150ms debounce): **reset, don't
rescale** — rebuild buffers, re-rasterize sample buffer, refresh dpr, clear amplitudes, stop
loop. Unmount: remove all listeners, `cancelAnimationFrame`, set `disposed`.

**Idle teardown.** Track `maxAmp` during render; after `SLEEP_FRAMES` consecutive frames
below `SLEEP_EPSILON`: cancel rAF, `clearRect`, zero buffers, `running = false`. The
pointerdown handler restarts only if `!running`.

**Mobile.** Uniform grid — viewport scaling already makes mobile the cheap case (~2.3k cells
vs ~14k desktop); `MAX_DPR = 2` is the only mobile-specific measure. No UA sniffing.

**Testability.** Export the pure sim functions (`stepWaveField`, `injectImpulse`,
`createField`) so unit tests can be added later without restructuring.

### 3.2 Doctrine governance (doctrine: agents, cross-cutting)

The terminal reconciliation phase (Phase 3) fills the desktop-doctrine stub from the landed
code — binding text: agents-doctrine §2.6/§7.4 ("doctrine changes ship with the code change
that made them true/false; drift is a bug"). Ratify-only boundary: codify only what the
merged code demonstrates; unresolved design questions become beads, never doctrine text.
Details in Phase 3 steps.

---

## 4. Implementation Details

### 4.1 Files

| Path | Change |
|------|--------|
| `src/components/global/AsciiRipple.tsx` | **New** — everything in §3.1 |
| `src/layouts/AppLayout.tsx` | **Modify** — import + one mount line with `backgroundUrl={backgroundMap[currentBg]}` |
| `docs/doctrine/desktop-doctrine.md` | **Modify (Phase 3)** — fill stub, fix H1 convention, bump 0.1.0 → 0.2.0, Draft → Active |
| `docs/doctrine/doctrine-manifest.yaml` | **Modify (Phase 3)** — add `ripple, canvas, effect, animation` triggers |

### 4.2 ESLint/repo idioms

Unused vars `_`-prefixed (existing `_isResizing` idiom in `MacTerminal.tsx`); no
`console.log` (no-console warns; pre-commit runs lint); single quotes, 2-space indent,
semicolons.

---

## 5. Error Handling

| Error | Cause | Handling |
|-------|-------|----------|
| `img.decode()` rejects | AVIF unsupported / 404 | Catch; disable effect silently (render nothing) |
| `getImageData` throws | Canvas tainted (future CDN move) | Try/catch; degrade to neutral light-gray glyph tint |
| `window is not defined` at build | Browser API outside `useEffect` | All browser APIs inside effects; verified by `pnpm build` + preview smoke |
| Amplitude blowout | Rapid click spam | Physics is self-limiting (damping + amplitude clamp at render); impulses superpose |

---

## 6. Testing Strategy

No test framework exists; the declared gate is `pnpm build` + `pnpm lint`
(`substrate.yaml`). `astro build` transpiles but does not type-check `.tsx` — preview smoke
covers hydration.

| Layer | Focus | Command |
|-------|-------|---------|
| Build | Import/syntax/SSR breakage | `pnpm build` |
| Lint | Repo ESLint rules | `pnpm lint` |
| Hydration | SSR renders + hydrates without window errors | `pnpm preview` + load page (manual) |
| Behavior | Acceptance criteria 1–6 | Manual checklist (Step 2.2) |

**Flagged opt-ins (NOT in this epic's scope):** `@astrojs/check` for real type gating;
vitest targeting exported `stepWaveField` (energy decay, boundary symmetry, impulse
superposition).

---

## 7. Failure Modes (FMEA)

| # | Failure Mode | Severity | Mitigation |
|---|--------------|----------|------------|
| 1 | Ripple listener breaks terminal drag/resize | High | Passive `pointerdown` observer only; no preventDefault/stopPropagation; canvas `pointer-events: none`; manual check 2.2-3 |
| 2 | Idle CPU/battery drain | High | Energy-decay teardown (`SLEEP_EPSILON`/`SLEEP_FRAMES`); verified via Performance panel (zero rAF) |
| 3 | Frame drops during large ripples | Medium | `RENDER_EPSILON` skip, `MAX_DPR=2`, fixed-dt accumulator; documented glyph-atlas fallback |
| 4 | 120Hz displays double wave speed | Medium | `SIM_DT` accumulator, max 3 steps/frame |
| 5 | Canvas taint crashes desktop | Medium | try/catch + gray-tint degrade; `crossOrigin="anonymous"` |
| 6 | SSR build breakage | Medium | Browser APIs only in `useEffect`; `pnpm build` in every Verify |
| 7 | Poster/video color mismatch at ripple edges | Low | Accepted trade-off; poster is an ASCII render of the same scene |
| 8 | Resize mid-ripple artifacts | Low | Reset-don't-rescale policy; debounced |

---

## 8. Prompt Execution Strategy

<!-- PROTOCOL: docs/protocol/sdd/execution-format.md · COMPLETENESS: _SPEC-STANDARD.md -->

### Phase 1: AsciiRipple Component

#### Step 1.1: Simulation core + component shell

Create `src/components/global/AsciiRipple.tsx`.

Top of file: all named constants from spec §3.1's constants table (exact names/defaults),
the `BAYER4` 4×4 matrix, and `GLYPH_RAMP`. Then the **pure, exported** sim functions:

- `createField(cols, rows)` → `{ prev: Float32Array, curr: Float32Array, cols, rows }`
- `injectImpulse(field, cellX, cellY, strength, radiusCells)` — cosine falloff, additive
  (superposition), written into `prev`
- `stepWaveField(field, damping)` — neighbor-average rule with clamped-index boundaries,
  swaps buffers

Then the component: `export default function AsciiRipple({ backgroundUrl }: { backgroundUrl:
string })` rendering `<canvas ref={...} className='absolute inset-0 pointer-events-none'
aria-hidden='true' />` with an empty `useEffect` placeholder (`// wired in later steps`).
No browser API outside the effect. Follow repo ESLint: single quotes, 2-space indent,
semicolons, `_`-prefix unused params, no console.

Tools to use: Write
Tools to NOT use: Edit (file doesn't exist)

##### Verify

- `pnpm build`
- `pnpm lint`

##### Timeout

180000

#### Step 1.2: Background sampling + canvas sizing

Edit `src/components/global/AsciiRipple.tsx`. Add:

- Grid sizing: `cols = ceil(innerWidth / CELL_PX)`, `rows = ceil(innerHeight / CELL_PX)`;
  canvas backing store `innerWidth × dpr` with `dpr = min(devicePixelRatio, MAX_DPR)`,
  `ctx.scale(dpr, dpr)`, drawing in CSS-pixel units.
- `rasterizeBackground(url, cols, rows)`: `new Image()`, `crossOrigin = 'anonymous'`,
  `await img.decode()`, draw into `document.createElement('canvas')` (cols × rows) with
  cover-fit center-crop math per spec §3.1, one `getImageData` → return
  `Uint8ClampedArray | null`. try/catch both decode (→ null, effect disabled) and
  getImageData (→ null sample buffer sentinel = neutral gray tint `rgb(200,200,200)`).
- Wire into the mount effect with a `disposed` flag guarding the await. Store buffers in
  refs, not state (no re-renders from the sim).

If `pnpm build` fails with a window/document reference error, the API call has leaked
outside the effect — move it in, don't guard with typeof checks.

Tools to use: Edit

##### Verify

- `pnpm build`
- `pnpm lint`

##### Timeout

180000

#### Step 1.3: Render loop, input, lifecycle

Edit `src/components/global/AsciiRipple.tsx`. Complete the component:

- rAF loop with fixed-timestep accumulator (`SIM_DT`, max 3 sim steps/frame); render pass
  per spec §3.1: clearRect → skip cells below `RENDER_EPSILON` → Bayer-dithered glyph index
  → wallpaper-sampled fill color scaled by `0.6 + 0.8a` → `fillText` at cell centers with
  the monospace stack from §3.1.
- Idle teardown: track `maxAmp`; after `SLEEP_FRAMES` frames below `SLEEP_EPSILON` cancel
  rAF, clearRect, zero buffers, `running = false`.
- `document` `pointerdown` (passive) → ignore `pointerType === 'mouse' && button !== 0` →
  cell from `clientX/clientY` → `injectImpulse` → start loop if `!running`.
- Reduced-motion: `matchMedia('(prefers-reduced-motion: reduce)')` — if matching at mount,
  attach nothing; subscribe to `change` (reduce on → full teardown + remove pointer
  listener + clear canvas; off → re-arm).
- Debounced resize (~150ms): rebuild field at new dims, refresh dpr, re-rasterize sample
  buffer, clear amplitudes, stop loop (reset-don't-rescale).
- Unmount cleanup: pointer listener, MQ listener, resize listener, cancelAnimationFrame,
  `disposed = true`.

Tools to use: Edit

##### Verify

- `pnpm build`
- `pnpm lint`

##### Timeout

300000

#### Gate

- `pnpm build`
- `pnpm lint`

### Phase 2: Desktop Integration

#### Step 2.1: Mount in AppLayout

Edit `src/layouts/AppLayout.tsx`: import AsciiRipple and render
`<AsciiRipple backgroundUrl={backgroundMap[currentBg]} />` immediately after the background
block (`{backgroundVideo ? <video/> : <div/>}`) and before
`<div className='relative z-10'>` (MacToolbar). No z-index on the effect layer — DOM order
is the mechanism. Change nothing else in AppLayout; background selection/localStorage stays
as is.

Tools to use: Edit

##### Verify

- `pnpm build`
- `pnpm lint`

##### Timeout

120000

#### Step 2.2: Manual acceptance verification

Run `pnpm preview` (after the gate's build) or `pnpm dev` and walk the checklist; record
pass/fail per item in the step output:

1. Click empty desktop → ripple expands, reflects off edges, decays fully. Two rapid
   clicks → visible interference.
2. Open the terminal from the dock; click near/under its edge → ripple emerges from beneath;
   toolbar/dock/icons render above glyphs.
3. Drag + resize the terminal, use dock buttons, open About/Socials/Spotify windows, type in
   the chatbot — all behave identically to pre-change.
4. DevTools device emulation → tap spawns ripple; Performance panel at 4× CPU throttle ≈
   60fps.
5. After decay, Performance panel shows zero rAF activity; next click restarts the loop.
6. Rendering → "Emulate prefers-reduced-motion: reduce" → no canvas work, inert listeners;
   toggle back live → effect re-arms.
7. Resize mid-ripple → no crash; field resets; colors stay cover-fit aligned.

If any item fails, fix within this step and re-run the checklist before passing the gate.

Tools to use: Bash (pnpm preview), browser/manual observation

##### Verify

- `pnpm build`
- `pnpm lint`

##### Timeout

600000

#### Gate

- `pnpm build`
- `pnpm lint`

### Phase 3: Doctrine Reconciliation

<!-- MANDATORY, TERMINAL. Applies ratify-only doctrine changes directly to docs/doctrine/**
     — co-revertable with the feature. No amendment queue. -->

#### Step 3.1: Reconcile desktop doctrine against the integrated feature (ratify-only)

The desktop doctrine (`docs/doctrine/desktop-doctrine.md`) is a placeholder stub; the landed
code makes its placeholders false. Fill it from the **integrated diff** (what the code
actually does, not what this spec hoped):

1. **H1 + preload blockquote (agents-doctrine §1 convention):** retitle to
   `# Desktop Doctrine (DOCTRINE)`; add a preload blockquote ("Load when touching the
   desktop environment: windows, toolbar, dock, icons, backgrounds, or desktop-layer
   effects").
2. **§1 Scope:** fill in-scope additions (desktop effects layer) and out-of-scope (chatbot/
   API code, background rotation internals).
3. **§2 Binding Rules** — ratify only what the merged code demonstrates, candidate set:
   - Decorative overlays are `pointer-events: none`, placed in AppLayout DOM order between
     wallpaper and first UI layer; reserved z bands: icons `z-0`, toolbar `z-10`, terminal
     `z-20`, modal windows `z-25`, docks `z-30`/`z-50`; decorative layers claim no z band.
   - Desktop animation loops are self-suspending: zero idle rAF, restart only on input.
   - Desktop-wide input observation uses document-level passive listeners; never
     preventDefault/stopPropagation; interaction ownership stays with owning components.
   - Motion features gate on `prefers-reduced-motion: reduce` including live changes — no
     listeners and no draw work, not merely paused.
4. **§3 SHOULDs:** background consumers receive the resolved URL as a prop from AppLayout
   (never re-derive selection/localStorage); tuning parameters are named module-level
   constants.
5. **§4 Anti-patterns / §5 Examples:** fill from implementation (cite real paths/symbols —
   `src/components/global/AsciiRipple.tsx`, actual constant names; reference contracts and
   why, don't inline constant values).
6. **Header/changelog:** Version 0.1.0 → 0.2.0, Date = today, Status Draft → Active,
   changelog row citing this epic.

Zero `<fill in` placeholders may remain. Any rule that would impose obligations on code this
feature didn't touch is out-of-band — defer to `/substrate:synthesize-session`, don't apply.
Brief Open Questions resolved by implementation (glyph ramp/cell size/damping defaults; font
choice; uniform mobile grid; reset-on-resize) are now ratifiable facts; any still open become
beads, never doctrine text.

Tools to use: Edit

##### Verify

- `bash docs/scripts/doctrine-lint.sh`
- `! grep -n '<fill in' docs/doctrine/desktop-doctrine.md`
- `grep -q '(DOCTRINE)' docs/doctrine/desktop-doctrine.md`
- `test -f src/components/global/AsciiRipple.tsx`

##### Timeout

300000

#### Step 3.2: Manifest triggers + final gate

Edit `docs/doctrine/doctrine-manifest.yaml`: append `ripple`, `canvas`, `effect`,
`animation` to the desktop entry's inline `triggers:` list; optionally extend `summary` with
"and the desktop effects layer". **Strict format** (zero-dep parser): 2-space indent, one
`- id:` per entry, inline `[a, b]` lists only — no block-style YAML lists.

##### Verify

- `bash docs/scripts/doctrine-lint.sh`
- `pnpm build`
- `pnpm lint`

##### Timeout

120000

#### Gate

- `pnpm build`
- `pnpm lint`
- `bash docs/scripts/doctrine-lint.sh`

---

## 9. Operational Queries

No database in this feature. Runtime audits are DevTools procedures:

- **Idle invariant:** Performance panel recording after ripple decay → expected: zero
  `requestAnimationFrame` callbacks.
- **Interaction invariant:** Event Listeners panel on `document` → exactly one `pointerdown`
  from AsciiRipple, `passive: true`.
- **Reduced-motion invariant:** with emulation on → no canvas element work, no listeners
  registered by AsciiRipple.

---

## 10. Spec Completeness Checklist

### Semantic Completeness
- [x] All data structures fully defined (Float32Array field, sample buffer, constants table)
- [x] All terms defined or linked (height field, Bayer dither, cover-fit in §3.1)
- [x] State machine exhaustive (idle → running → idle; reduced-motion on/off; disposed)
- [x] Nullability explicit (sample buffer `Uint8ClampedArray | null` with gray-tint sentinel)

### Verification Completeness
- [x] Each phase has executable verification (build/lint/doctrine-lint)
- [x] Invariants have audit procedures (§9 — DevTools, since no DB/test framework)
- [x] Success criteria are binary (§1.3)

### Recovery Completeness
- [x] FMEA table present (§7)
- [x] Idempotency: impulses superpose; steps are file-scoped writes/edits, re-runnable
- [x] Rollback: single component + one-line mount; revert = remove both; doctrine edit
      co-revertable in-epic

### Context Completeness
- [x] Brief linked (header)
- [x] Decision rationale captured (§3.1 notes, Change Log)
- [x] Change log present (§11)

### Boundary Completeness
- [x] Scope table present (§2)
- [x] Auth requirements explicit (none — public page, no new surface; API untouched)
- [x] External dependencies listed (none added; uses existing browser APIs only)

---

## 11. Change Log

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-07-20 | Initial specification from ascii-ripple brief + desktop/agents architect analyses. Notable resolutions: (a) acceptance criterion "visibly different across the 3 backgrounds" reworded to prop-driven sampling — live code wires only `bg-3.avif` poster + `/bg-ascii.mp4` video wallpaper, brief/CLAUDE.md rotation description is stale; (b) defaults chosen per architect recommendation: `CELL_PX=12`, `DAMPING=0.985`, fillText over glyph atlas, terminal-matching monospace stack, uniform mobile grid, reset-don't-rescale on resize; (c) doctrine Status flips Draft → Active on merge (Active-on-merge default; template convention, not a cited rule); (d) test framework additions flagged opt-in, excluded from epic scope. |
