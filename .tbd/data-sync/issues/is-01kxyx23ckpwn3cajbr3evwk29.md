---
type: is
id: is-01kxyx23ckpwn3cajbr3evwk29
title: MacToolbar clock causes SSR/client hydration mismatch
kind: bug
status: open
priority: 3
version: 1
labels:
  - epic:ascii-ripple
dependencies: []
created_at: 2026-07-20T04:38:00.338Z
updated_at: 2026-07-20T04:38:00.338Z
---
## Why now (session signal)
During ascii-ripple Playwright verification, the browser console showed a React hydration mismatch: MacToolbar's clock rendered "Mon Jul 20 12:27 AM" server-side vs "12:28 AM" client-side (minute boundary). React regenerates the toolbar subtree on the client as a result. Pre-existing; unrelated to the ripple, but surfaced here.

## Acceptance criterion
No "Hydration failed because the server rendered text didn't match" error in the console on load, attributable to the toolbar clock. Fix by rendering the clock only after mount (e.g. render empty/placeholder on server + first client paint, then set time in useEffect) or suppressHydrationWarning on the time node.

## State-transfer prompt
> Working in this repo. Task: eliminate the SSR/client hydration mismatch on MacToolbar's clock.
> File: src/components/global/MacToolbar.tsx — the element rendering "Mon Jul 20 12:28 AM".
> Approach: the time string is computed at render on both server and client; across a minute boundary they differ. Gate the displayed time behind a mounted flag (useState(false) → true in useEffect), or apply suppressHydrationWarning to the time span.
> Verify: load http://localhost:4321/ (pnpm dev) with DevTools console open — no hydration-mismatch error.

## Notes
S. Low priority (cosmetic dev-console noise; toolbar still works). Out of scope for ascii-ripple by spec §1.2.
