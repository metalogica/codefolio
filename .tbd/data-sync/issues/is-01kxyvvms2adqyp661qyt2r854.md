---
type: is
id: is-01kxyvvms2adqyp661qyt2r854
title: Mount AsciiRipple in AppLayout between wallpaper and toolbar
kind: task
status: closed
priority: 2
version: 4
labels:
  - epic:ascii-ripple
  - group:window-2
dependencies:
  - type: blocks
    target: is-01kxyvvnx95g77yysv5zge72md
  - type: blocks
    target: is-01kxyvvpd1tttfttanyf6zqkax
parent_id: is-01kxyvvksg4m7vef1nyq78ppnm
created_at: 2026-07-20T04:17:00.193Z
updated_at: 2026-07-20T04:33:21.952Z
closed_at: 2026-07-20T04:33:21.951Z
close_reason: Landed in 1f4647f (ascii-ripple spec executed, gate green)
---
spec: docs/tasks/ongoing/ascii-ripple/ascii-ripple-spec.md#phase-2-desktop-integration (Step 2.1)

Goal: Edit src/layouts/AppLayout.tsx only — import AsciiRipple and render <AsciiRipple backgroundUrl={backgroundMap[currentBg]} /> immediately after the background block ({backgroundVideo ? <video/> : <div/>}) and before <div className='relative z-10'> (MacToolbar). No z-index on the effect layer; DOM order is the stacking mechanism. Change nothing else (background selection/localStorage untouched).

Files: src/layouts/AppLayout.tsx (edit)
Consumes: AsciiRipple default export from src/components/global/AsciiRipple.tsx
reconcile: none

Acceptance: mount line present at the specified DOM position; pnpm build green; pnpm lint green.

Gate:
- pnpm build
- echo 'no tests yet'
- pnpm lint
