---
type: is
id: is-01kxyvvnx95g77yysv5zge72md
title: Manual acceptance verification of ripple behavior (7-item checklist)
kind: task
status: closed
priority: 2
version: 3
labels:
  - epic:ascii-ripple
  - group:window-2
dependencies:
  - type: blocks
    target: is-01kxyvvpd1tttfttanyf6zqkax
parent_id: is-01kxyvvksg4m7vef1nyq78ppnm
created_at: 2026-07-20T04:17:01.352Z
updated_at: 2026-07-20T04:33:22.581Z
closed_at: 2026-07-20T04:33:22.580Z
close_reason: Landed in 1f4647f (ascii-ripple spec executed, gate green)
---
spec: docs/tasks/ongoing/ascii-ripple/ascii-ripple-spec.md#phase-2-desktop-integration (Step 2.2)

Goal: Manual acceptance walk against pnpm preview (or dev): (1) click empty desktop -> ripple expands/reflects/decays; two rapid clicks interfere; (2) ripple under terminal edge emerges from beneath; toolbar/dock/icons above glyphs; (3) terminal drag+resize, dock, About/Socials/Spotify windows, chatbot typing all unchanged; (4) touch emulation tap ripples; ~60fps at 4x CPU throttle; (5) zero rAF after decay, restart on click; (6) emulated prefers-reduced-motion -> no canvas work, live re-arm on toggle; (7) resize mid-ripple -> no crash, field resets, cover-fit alignment holds. Record pass/fail per item. Fix in-place and re-walk on any failure.

Files: none (verification; fixes land in AsciiRipple.tsx/AppLayout.tsx if needed)
reconcile: none

Acceptance: all 7 checklist items recorded pass; pnpm build + lint green.

Gate:
- pnpm build
- echo 'no tests yet'
- pnpm lint
