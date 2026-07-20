---
type: is
id: is-01kxyx26q8wmvefz21zj2hqvm1
title: Should the ripple sample the live video wallpaper per frame instead of the static poster?
kind: task
status: open
priority: 4
version: 1
labels:
  - epic:ascii-ripple
  - kind:open-question
  - parked
dependencies: []
created_at: 2026-07-20T04:38:03.752Z
updated_at: 2026-07-20T04:38:03.752Z
---
## The question
Should the ripple sample the LIVE video wallpaper (/bg-ascii.mp4) per frame instead of the static poster (/bg-3.avif) it currently samples once? This would make glyph tint track the animating wallpaper exactly, eliminating the poster/video color mismatch at ripple edges (FMEA #7, accepted trade-off).

## Why parked
No caller is confused and the current behavior is a deliberate, spec-sanctioned trade-off (§1.1, §2 out-of-scope). It hinges on an unmeasured cost: per-frame drawImage(video)+getImageData is far more expensive than the current one-shot sample and may blow the mobile 60fps budget. There is no acceptance criterion yet — it depends on a perf signal that doesn't exist.

## When to revisit
If/when someone reports visible tint mismatch at ripple edges over the video wallpaper, OR the next time the desktop effects layer gets a perf pass. Measure per-frame video-sample cost on mid-range mobile before committing.
