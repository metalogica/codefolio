---
type: is
id: is-01kxyx22b2f3z3nw75hf7hf485
title: Fix stale background description in AGENTS.md/CLAUDE.md (video wallpaper + single poster, no rotation)
kind: task
status: open
priority: 3
version: 1
labels:
  - epic:ascii-ripple
  - kind:drift
dependencies: []
created_at: 2026-07-20T04:37:59.265Z
updated_at: 2026-07-20T04:37:59.265Z
---
## Why now (session signal)
The ascii-ripple spec (§1.1 "Code reality note") flagged that AGENTS.md/CLAUDE.md's background description is stale: it claims "three optimized backgrounds, random selection with localStorage to prevent consecutive repeats," but the live code renders a video wallpaper (/bg-ascii.mp4) with a single poster (backgroundMap = { 'bg-3': '/bg-3.avif' }) — no rotation.

## Acceptance criterion
The "Background System" bullet in the root agent doc (AGENTS.md; CLAUDE.md is a symlink) and the "Background System" section describe reality: one video wallpaper + single poster passed via backgroundMap, prerender=false for selection, no multi-background rotation. Grep for "Three optimized backgrounds" / "consecutive repeats" returns nothing.

## State-transfer prompt
> Working in this repo. Task: fix the stale background description in AGENTS.md (CLAUDE.md is a symlink to it).
> Reality to document: src/components/LandingPage.astro passes backgroundMap={ 'bg-3': '/bg-3.avif' } + backgroundVideo='/bg-ascii.mp4'; src/layouts/AppLayout.tsx prefers the video and passes the poster URL to consumers. There is no 3-way rotation anymore.
> Do NOT invent behavior — read LandingPage.astro + AppLayout.tsx first.
> Verify: grep -ri "three optimized backgrounds\|consecutive repeats" AGENTS.md returns nothing.

## Notes
XS. Documentation-only. AGENTS.md currently has an unrelated pending edit (tbd integration block) — coordinate so this lands cleanly.
