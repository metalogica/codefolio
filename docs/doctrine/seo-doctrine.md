# SEO Doctrine (DOCTRINE)

> Load when touching indexable content, metadata (canonical/OG/Twitter/JSON-LD), the
> sitemap or robots.txt, analytics instrumentation — or before shipping any large
> content update.

**Authority**: Binding
**Status**: Active
**Last verified**: 2026-09-04

---

## 1. Scope

### In scope
- The SEO operational lifecycle: the monthly five-metric review (§5.1) and the
  verification/re-indexing procedure required after material content changes (§5.2).
- Metadata surfaces: `src/components/global/BaseHead.astro` (title, description,
  canonical, OG, Twitter card, JSON-LD Person schema), sitemap config in
  `astro.config.mjs`, `public/robots.txt`.
- The crawlable content layer: the sr-only `<main>` in
  `src/components/LandingPage.astro` and the content modules that feed it
  (`src/content/bio.ts`, `src/content/socials.ts`).
- Conversion analytics: the typed event vocabulary in `src/lib/analytics.ts` and its
  call sites (Taskbar, desktop CV icon, SocialsWindow, MacTerminal).

### Out of scope
- The visual desktop environment — windows, icons, effects (`desktop-doctrine.md`).
- Chatbot request behaviour (`src/pages/api/chat.ts`).
- Performance work (prerendering `/`, video/LCP optimization). The §5.1 LCP metric
  *triggers* that work; executing it is its own spec, not this doctrine.

---

## 2. Binding Rules (MUSTs)

- MUST: the canonical host is apex **`https://rei.gg`**. `www.rei.gg` 308-redirects to
  apex via the Vercel project's per-domain `redirect` field (production config, not in
  this repo — flipped apex-primary 2026-09-04). Canonical tags, OG URLs, JSON-LD,
  robots.txt, and sitemap contents all declare the apex; never re-point any of them at
  www.
- MUST: every indexable route appears in the sitemap. Astro pages are auto-discovered;
  **endpoint routes are not** (e.g. `src/pages/cv.ts`) — add those to `customPages` in
  `astro.config.mjs`.
- MUST: crawlable identity content renders from the single-source content modules —
  bio prose from `src/content/bio.ts`, profile URLs from `src/content/socials.ts`.
  Never fork the prose or hardcode a profile URL at a call site.
- MUST: the sr-only `<main>` carries only the **professional subset** of `bio.ts`
  (identity, SYN/ACK, interests, profile links). The personal sections — "My types",
  "My worldview", "Snapshots of my life" — MUST NOT appear in server-rendered HTML.
  This is an explicit owner decision (2026-09-04) to keep personal history out of
  search snippets; it is not an implementation accident.
- MUST: visually-hidden content stays identical to content a user can reach in the
  visible UI (the About window renders the same `bio.ts` module). Hidden text with no
  user-reachable equivalent is search-engine spam-policy risk — do not add it.
- MUST: every new conversion surface (a link or action expressing hire-me intent) gets
  a typed event added to `EventName` in `src/lib/analytics.ts` and a `trackEvent()`
  call — no ad-hoc `track()` calls, no untracked conversion links.
- MUST: run the §5.2 procedure whenever indexable content changes materially. The
  change is not done until that checklist is.

---

## 3. Recommended Practices (SHOULDs)

- SHOULD: keep exactly one `<h1>` on the page — in the sr-only `<main>`, sourced from
  `IDENTITY`.
- SHOULD: source JSON-LD fields (name, location, `sameAs`) from the content modules so
  schema and UI cannot drift.
- SHOULD: for a new page, pass per-page `title`/`description`/`canonical` through the
  existing `BaseHead` props plumbing rather than minting new meta components.
- SHOULD: verify against the **served HTML** (`curl` + `grep`), never the source —
  client-gated React content is invisible to crawlers even when it ships in the
  bundle. That was this site's original failure mode.
- SHOULD: diagnose crawler-facing errors (GSC "Couldn't fetch", redirect anomalies)
  with `curl -I` against the exact production URL *before* changing code — the
  2026-09-04 incident was Vercel domain config, not repo content.

---

## 4. Anti-patterns

- **Client-gating new indexable content** behind closed windows with no SSR
  equivalent — Google then sees only icon labels (the pre-2026-09-04 state of this
  site).
- **Hardcoding a social/profile URL** at a call site — it silently drifts from the
  JSON-LD `sameAs` claims and the crawlable link list.
- **Flipping the Vercel primary domain to www** — reintroduces the canonical
  mismatch; the symptom is GSC sitemap "Couldn't fetch" while the site "works fine"
  in a browser.
- **Adding GA4 or cookie-based analytics** — consent overhead with no portfolio-scale
  benefit; Vercel Analytics + Search Console answer every question this site asks.
- **Treating GSC "Couldn't fetch" as transient** without curling the sitemap URL
  first — it was a real 308 once already.
- **Doing perf work without the §5.1 LCP trigger** — the deferred perf pass
  (prerender `/`, tame `bg-ascii.mp4`) waits for red field data, not vibes.

---

## 5. Runbooks

### 5.1 Monthly review (~15 min, calendar-driven)

Five numbers. Each has an action it triggers; record anomalies as tbd beads rather
than fixing inline during the review.

| # | Metric | Where | Trigger |
|---|--------|-------|---------|
| 1 | Impressions + clicks; position of brand queries "rei nova", "soulbound labs" | GSC → Performance | Brand query not #1 → investigate what outranks; refresh content/backlinks |
| 2 | Index coverage of `https://rei.gg` and `https://rei.gg/cv` | GSC → Pages | Either dropped → URL Inspection, fix root cause, request re-indexing |
| 3 | Visitors + top referrers | Vercel → Analytics | A profile link (GitHub/LinkedIn/X bio) sending nothing → check the link still points at rei.gg |
| 4 | `cv_open` + `calendly_click` counts vs visitors | Vercel → Analytics → Events | Visitors up, conversions flat → revisit content/CTAs; this is the only funnel that matters |
| 5 | Mobile LCP | Vercel → Speed Insights | Red → open the deferred perf bead (prerender `/`, video poster/preload). This is the *only* sanctioned trigger for that work |

### 5.2 Large content update procedure

Run whenever indexable content changes materially: bio rewrite, new page or route,
CV replacement, title/description/OG image changes, URL changes.

**Pre-merge**
1. Identity/bio prose changes go in `src/content/bio.ts`; new profile URLs in
   `src/content/socials.ts` — never in components.
2. New route? Its content must be server-rendered; meta via `BaseHead` props; if it
   is an endpoint route, add it to sitemap `customPages`.
3. Gate: `pnpm lint && pnpm build`, then confirm the sitemap:
   `grep -o '<loc>[^<]*</loc>' dist/client/sitemap-0.xml` — every indexable URL
   present, nothing unexpected.
4. Verify the served HTML locally (`pnpm dev`):
   ```bash
   curl -s localhost:4321/ | grep -c '<a distinctive new phrase>'   # ≥ 1
   curl -s localhost:4321/ | grep -ci 'brain injury\|My worldview\|Enneagram'  # MUST be 0
   ```
   Confirm the `<h1>` and JSON-LD block are still present.

**Post-deploy**
5. `curl -sI` the changed production URLs: 200, no redirect, correct content-type.
6. Validate structured data: Google Rich Results Test + validator.schema.org on
   `https://rei.gg`.
7. If title/description/`og.png` changed: check the share card (opengraph.xyz or an
   X draft post).
8. GSC → URL Inspection → **Request indexing** for every new or changed URL. Without
   this, re-crawl can take weeks.
9. Click each conversion link on production; confirm events arrive in
   Vercel → Analytics → Events (events do not emit in dev).
10. Removed or renamed a URL? Serve a 308 from the old path, drop it from the
    sitemap, and use GSC Removals if the old content is sensitive.
