# PC-98 Redesign — rei.gg (codefolio)

## Context

The site's concept (a desktop you walk around, terminal chatbot, city-pop/anemoia background art) is strong, but the chrome is 2024 Apple/Google — frosted glass, rounded-2xl, gradient dock tiles, iOS/Material icons from three design languages — fighting a 1987 background. Design critique verdict: rebuild the chrome as an NEC PC-98–era desktop so background and UI rhyme, and fix visible scaffolding (literal `YOUR_COLOR_HEX` meta colors, empty og:image, "John Doe" OG copy).

**User decisions (confirmed):** Full commitment — PC-98 chrome everywhere, taskbar replaces docks + toolbar, pixel icons, skippable boot sequence, launcher windows for external products, terminal as front door. Positioning: **"Rei Jarram — Founder, Metalogica"** (site sells Rei; products are icons).

**Design anchor:** PC-9821s ran Japanese Windows 95 → historically coherent target: beveled gray windows, navy title bars, bottom taskbar, bitmap type, white-on-black terminal. Sharp corners everywhere; no blur/gradients/soft shadows/rounded corners.

**Binding:** `docs/doctrine/desktop-doctrine.md` — z bands stable (icons z-0, terminal z-20, modals z-25, taskbar wrapper z-30), effect layers = pointer-events-none + DOM order + no z-index, passive document listeners, reduced-motion = register/draw nothing, browser APIs only in useEffect (SSR), SCREAMING_SNAKE tuning constants. Gates: `pnpm build` + `pnpm lint` green per phase. Planning artifacts → `docs/tasks/ongoing/pc98-redesign/`.

Each phase leaves the site shippable; commit per phase.

## Phase 1 — Design system + craft fixes

**Fonts** (no local fonts exist today; licensing resolved):
- UI chrome: **DotGothic16** (SIL OFL, Google Fonts) — Japanese bitmap-style, closest legally-clean PC-98 ROM feel. **Latin subset only** (`public/fonts/dotgothic16-latin.woff2`, ~15–50KB); full JP build is multi-MB — do not ship/preload it.
- Terminal + boot: **Web437 IBM VGA 8x16** (int10h Oldschool PC Font Pack, CC BY-SA 4.0 — attribution comment in global.css + README line).
- Fallbacks: `'MS Gothic', 'Osaka-Mono', monospace`. Rejected: Chicago/MS Sans Serif (proprietary), W95FA (murky license), real ROM dumps (NEC copyright).

**`src/styles/global.css`** — Tailwind 4 `@theme` tokens: `--color-pc98-bg #0a0a14`, `-face #c8c8c8`, `-face-lt #dfdfdf`, `-shadow #808080`, `-title #000082`, `-title-inactive #6e6e6e`, `-green #00d000`, `-cyan`, `-magenta`, `-red`; `--font-bitmap`, `--font-terminal`. Utilities (zero-JS, zero idle cost): `.bevel-out` / `.bevel-in` (inset box-shadow Win95 recipe), `.pixelated` (image-rendering), `.dither-25` (tiny inline-SVG checker bg), `.scanlines` (static repeating-linear-gradient). `-webkit-font-smoothing: none` for bitmap text; body font → bitmap; mono → terminal font.

**AppLayout.tsx**: add static scanline overlay div (`absolute inset-0 pointer-events-none scanlines`, aria-hidden) by DOM order right after `<AsciiRipple />` — no z-index (doctrine).

**BaseHead.astro craft fixes**: title/og:title → `Rei Jarram — Founder, Metalogica`; site_name → `rei.gg`; description updated to founder positioning — **keep product claims factual, source wording from existing site/CV copy, don't invent taglines**; og:image → `https://rei.gg/og.png` (real capture in Phase 6); `YOUR_COLOR_HEX` (×2) → `#0a0a14`; **delete stale macBackground1/2/3 getImage imports + preload loop** (unused — only bg-3.avif + bg-ascii.mp4 load; `grep -r mac-background src/` then delete the three jpgs); add font preloads (`as="font" crossorigin`).

**Layout.astro**: body `bg-gray-900` → `bg-[#0a0a14]`; selection → navy. **MacTerminal.tsx** welcome copy: "Role: Founder, Metalogica".

## Phase 2 — Shared window chrome: RetroWindow

- **New** `src/components/global/useWindowControls.ts`: extract the ~120-line drag/resize/mobile logic duplicated across MacTerminal/About/Socials/Spotify (lift verbatim from MacTerminal.tsx:213–294 — the proven implementation). Constants: `MIN_WINDOW_WIDTH=300`, `MIN_WINDOW_HEIGHT=200`, `MOBILE_BREAKPOINT=768`.
- **New** `src/components/global/RetroWindow.tsx`: props `{title, icon?, onClose, initialPosition, initialSize, variant: 'chrome'|'terminal', resizable?, children}`. Anatomy: outer `bevel-out bg-pc98-face p-[3px]`; navy title bar h-7, font-bitmap, drag handle, `[×]` bevel close button (keep existing onTouchEnd close behavior); body face-gray `bevel-in` well (chrome) or black (terminal); pixel-style resize grip. Mobile: near-fullscreen fixed, no drag/resize (existing behavior, centralized).
- **Remove `react-draggable`** (`pnpm remove`): unused, and depends on findDOMNode (removed in React 19).
- Migrate all four windows onto RetroWindow, one commit each, keeping chat/API/placeholder logic and AppLayout z-bands/click-outside wrappers untouched. Terminal title `A:\REI\TERMINAL.EXE`, **white-on-black** (period-correct N88 text mode; green reserved for the `>` prompt sigil only). About = `ABOUT.TXT` document-viewer look (black on face-gray, pixelated profile photo). Spotify iframe keeps its own rounded internals (cross-origin — accepted).

## Phase 3 — Taskbar, toolbar removal, pixel icons

- **AppLayout state refactor**: four booleans → `openWindows: Record<WindowId, boolean>` with `WindowId = 'terminal'|'about'|'socials'|'spotify'|'ideosphere'|'dreamtable'`, `toggleWindow`/`closeWindow` helpers.
- **New `Taskbar.tsx`** replaces DesktopDock + MobileDock + MacToolbar (delete all three). Top menu bar removed entirely (PC-9821+Win95 precedent; z-10 band simply goes unoccupied — doctrine keeps bands stable, doesn't require occupancy). Anatomy: `fixed bottom-0 inset-x-0 h-10` (mobile h-12) `bg-pc98-face bevel-out font-bitmap` in the existing z-30 wrapper: left `[レイ ▸ REI]` start button → toggles terminal; middle running-window buttons (bevel-in = pressed when open, icons-only on mobile); right tray: mail, GitHub, calendar (reuse existing dock URLs), **CV button mobile-only**, clock (reuse MacToolbar 60s interval, no blink).
- **New `icons/PixelIcon.tsx`**: inline 16×16-grid SVGs, `shape-rendering="crispEdges"`, palette-limited (info, document/PDF, socials, terminal, mail, github, calendar, spotify, globe, close-x, computer). Product logos: 32×32 ordered-dither versions via ImageMagick (`-ordered-dither o4x4`) → `public/icons/*-32.png`; fallback if no magick: CSS `grayscale(1) contrast(1.6)` + `pixelated`. All desktop icons sit in uniform 48×48 `bevel-out bg-pc98-face` tiles; labels font-bitmap with hard 1px shadow; hover = navy fill (no blur/rounded).
- Icon grid height: `h-[calc(100vh-6rem)]` → `h-[calc(100vh-2.5rem)]`.

## Phase 4 — Boot sequence + terminal front door

- **New `BootSequence.tsx`**, mounted last in AppLayout root: `fixed inset-0 z-50 bg-black font-terminal` (interactive overlay — top band is legal). All gating in useEffect: reduced-motion → finish silently (registers nothing); `sessionStorage['pc98-boot-done']` set → finish; else run ~3s chained-timeout script (no rAF), skippable via passive document pointerdown/keydown. `finish()` sets the key, removes listeners, calls onComplete — zero idle cost after.
- Script (fictional — never print "NEC", trademark risk): `METALOGICA REI-9801 PERSONAL COMPUTER / BIOS ROM v5.0 (c) 2026 METALOGICA / MEMORY CHECK: 640KB+15360KB OK / ... / LOAD: TERMINAL.EXE / Press any key to skip`.
- **Hydration-flash fix**: 3-line inline script in Layout.astro head sets `html[data-boot="1"]` when key absent + motion ok; static black cover shown via that attribute until BootSequence hydrates.
- **Front door**: on every desktop (≥768px) load — boot or skipped — terminal opens automatically. Mobile: never auto-open (keeps icons + CV path visible). Terminal welcome copy fits the fiction.

## Phase 5 — External-product launcher windows

X-Frame-Options assumed to block iframing ideosphere.io/dreamtable.io — use **launcher-card** pattern: **new `AppLauncherWindow.tsx`** (data-driven: name, exeName, screenshotUrl, blurb, url) inside RetroWindow at z-25: dithered/pixelated product screenshot (captured via Playwright MCP → `public/screenshots/*.png`, ≤120KB), two factual lines of copy, `[ ▶ RUN IDEOSPHERE.EXE ]` bevel button → `window.open(url, '_blank', 'noopener')`. Desktop icons switch from `window.open` to `toggleWindow('ideosphere'|'dreamtable')`.

## Phase 6 — og:image, favicon, polish

1. og:image: dev server + Playwright MCP — resize 1200×630, skip boot, terminal visible, screenshot → `public/og.png` (<300KB).
2. Favicon: replace rounded Lucide SVG with 16×16 pixel-grid terminal glyph (`#00d000` on black); regenerate favicon.ico.
3. Optional: nudge AsciiRipple palette/glyph **constants only** toward theme (no structural change — doctrine).
4. Sweep: `grep -rn 'backdrop-blur\|rounded-\|shadow-lg\|gradient' src/` → only deliberate exceptions remain.

## File manifest

| Phase | Created | Modified | Deleted |
|---|---|---|---|
| 1 | public/fonts/×2 | global.css, Layout.astro, BaseHead.astro, AppLayout.tsx, MacTerminal.tsx (copy), README.md | src/assets/images/mac-background{1,2,3}.jpg |
| 2 | RetroWindow.tsx, useWindowControls.ts | MacTerminal, AboutWindow, SocialsWindow, SpotifyWindow, package.json (−react-draggable) | — |
| 3 | Taskbar.tsx, icons/PixelIcon.tsx, public/icons/×2 | AppLayout.tsx | DesktopDock.tsx, MobileDock.tsx, MacToolbar.tsx |
| 4 | BootSequence.tsx | AppLayout.tsx, Layout.astro, MacTerminal.tsx | — |
| 5 | AppLauncherWindow.tsx, public/screenshots/×2 | AppLayout.tsx | — |
| 6 | public/og.png | favicon.svg/.ico, BaseHead.astro, (AsciiRipple constants) | — |

## Verification

Per phase: `pnpm build` + `pnpm lint` green before commit (husky enforces lint). Playwright MCP visual checks at 1440×900 and 390×844 + `browser_console_messages` for hydration errors:
- P1: bitmap-crisp text, subtle scanlines, no `YOUR_COLOR_HEX`/stale preloads in source, fonts <100KB total.
- P2: all windows open/drag/resize/close both viewports; terminal chat round-trips `/api/chat`; no console errors after react-draggable removal.
- P3: taskbar toggles sync pressed state; clock ticks; keyboard focus works; no top-bar remnants.
- P4: fresh session → boot → terminal open (desktop); click skips; same-tab reload skips; reduced-motion → no boot (verify via DevTools rendering emulation); zero timers/rAF after boot.
- P5: launcher shows screenshot; RUN opens correct URL with noopener.
- P6: og.png 1200×630; validate unfurl post-deploy.
- Doctrine audit each phase: no z-index on effect layers, z bands unchanged, no browser APIs outside useEffect.

## Risks

- Font licensing: CC BY-SA attribution required (CSS comment + README). Never ship W95FA/Chicago/MS Sans Serif.
- DotGothic16 must be latin-subset; full JP is multi-MB.
- SSR: sessionStorage/matchMedia/innerWidth only in useEffect; boot cover uses inline-script data-attr gate against FOUC.
- NEC trademarks: fictional "METALOGICA REI-9801" only.
- Copy accuracy: product blurbs/descriptions sourced from real site/CV copy — no invented claims.
- Out of scope: bg asset optimization (3.4MB avif, large mp4), chat API internals, AsciiRipple structure, Spotify iframe internals.
