---
type: is
id: is-01kxyx24nkj6bbjrrsv10z8b1n
title: Add vitest coverage for AsciiRipple pure sim (decay, boundary symmetry, superposition)
kind: feature
status: open
priority: 3
version: 1
labels:
  - epic:ascii-ripple
dependencies: []
created_at: 2026-07-20T04:38:01.650Z
updated_at: 2026-07-20T04:38:01.650Z
---
## Why now (session signal)
AsciiRipple.tsx exports its pure simulation core (createField, injectImpulse, stepWaveField) specifically so it can be unit-tested without restructuring (spec §3.1 Testability, §6 flagged opt-in). No test framework is installed yet; substrate.yaml's gate.test is a placeholder ("echo 'no tests yet'").

## Acceptance criterion
vitest installed; tests for the exported sim cover: (1) energy decays toward zero over N steps at DAMPING; (2) clamped-index boundaries reflect (no NaN/blowup at edges, symmetry for a centered impulse); (3) injectImpulse superposes additively. substrate.yaml gate.test updated to run vitest. pnpm test green.

## State-transfer prompt
> Working in this repo. Task: add vitest coverage for the pure wave sim in src/components/global/AsciiRipple.tsx.
> Exports under test: createField(cols,rows), injectImpulse(field,x,y,strength,radiusCells), stepWaveField(field,damping).
> Cases: energy decay (sum of |amp| strictly decreases across steps with DAMPING<1), boundary reflection symmetry (centered impulse stays symmetric, no NaN at clamped edges), impulse superposition (two injects == additive).
> Then set gate.test in substrate.yaml to the vitest command and drop the placeholder.
> Verify: pnpm test green; pnpm build + pnpm lint still green.

## Notes
S. Opt-in per spec §6. Pure fns already exported — no refactor needed.
