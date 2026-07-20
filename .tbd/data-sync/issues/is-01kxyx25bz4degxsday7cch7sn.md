---
type: is
id: is-01kxyx25bz4degxsday7cch7sn
title: Add @astrojs/check type-gating to the verification gate
kind: task
status: open
priority: 3
version: 1
labels:
  - epic:ascii-ripple
dependencies: []
created_at: 2026-07-20T04:38:02.366Z
updated_at: 2026-07-20T04:38:02.366Z
---
## Why now (session signal)
The declared gate is pnpm build + pnpm lint. astro build transpiles .tsx but does NOT type-check it (spec §6), so type errors in components like AsciiRipple.tsx can pass the gate. Preview smoke was the only hydration guard this epic.

## Acceptance criterion
@astrojs/check (+ astro check script) installed and wired into the gate (substrate.yaml gate.compile or a new step). Running it on the current tree passes. A deliberately-introduced type error fails the check.

## State-transfer prompt
> Working in this repo. Task: add real TypeScript type-gating for .astro/.tsx.
> Install @astrojs/check + typescript; add an "astro check" script; wire it into substrate.yaml's gate (compile step or an added lint/typecheck step) and the pre-commit hook if appropriate.
> Verify: pnpm exec astro check passes clean on the current tree; introduce a temporary type error and confirm it fails; revert.

## Notes
S. Opt-in per spec §6. Hardens the gate for all future component work, not just ascii-ripple.
