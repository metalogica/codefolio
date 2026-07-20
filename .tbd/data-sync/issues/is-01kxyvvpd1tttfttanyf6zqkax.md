---
type: is
id: is-01kxyvvpd1tttfttanyf6zqkax
title: "Doctrine reconciliation: fill desktop doctrine from landed code + manifest triggers"
kind: task
status: closed
priority: 2
version: 2
labels:
  - epic:ascii-ripple
  - group:window-3
  - kind:doctrine-reconciliation
dependencies: []
parent_id: is-01kxyvvksg4m7vef1nyq78ppnm
created_at: 2026-07-20T04:17:01.856Z
updated_at: 2026-07-20T04:33:23.435Z
closed_at: 2026-07-20T04:33:23.434Z
close_reason: Landed in 1f4647f (ascii-ripple spec executed, gate green)
---
spec: docs/tasks/ongoing/ascii-ripple/ascii-ripple-spec.md#phase-3-doctrine-reconciliation (Steps 3.1-3.2)

kind: doctrine-reconciliation (terminal node — ratify-only, sees the fully integrated feature)

Goal: Fill docs/doctrine/desktop-doctrine.md from the landed code (not the spec's hopes): retitle H1 to '# Desktop Doctrine (DOCTRINE)' + add preload blockquote; fill Scope out-of-scope (chatbot/API, background-rotation internals); ratify Binding Rules the code demonstrates (pointer-events:none decorative overlays placed by DOM order, reserved z bands icons z-0/toolbar z-10/terminal z-20/windows z-25/docks z-30+z-50, self-suspending animation loops with zero idle rAF, document-level passive listeners never preventDefault, reduced-motion gating incl. live changes); SHOULDs (background URL via prop from AppLayout, named module-level tuning constants); Anti-patterns + Examples citing real paths/symbols; Version 0.1.0 -> 0.2.0, Status Draft -> Active, changelog row. Zero '<fill in' placeholders may remain. Then edit docs/doctrine/doctrine-manifest.yaml: append ripple, canvas, effect, animation to desktop triggers (strict inline [a, b] format, 2-space indent). Stricter rules invalidating shipped code are OUT OF SCOPE — defer to /substrate:synthesize-session. Brief open questions resolved by implementation become ratified facts; still-open ones become beads, never doctrine text.

Files: docs/doctrine/** (desktop-doctrine.md, doctrine-manifest.yaml)
reconcile: none

Acceptance: doctrine-lint green; no '<fill in' remains; '(DOCTRINE)' H1 present; cited paths exist; full union gate green on integrated tip.

Gate:
- pnpm build
- echo 'no tests yet'
- pnpm lint
- bash docs/scripts/doctrine-lint.sh
- ! grep -n '<fill in' docs/doctrine/desktop-doctrine.md
- grep -q '(DOCTRINE)' docs/doctrine/desktop-doctrine.md
