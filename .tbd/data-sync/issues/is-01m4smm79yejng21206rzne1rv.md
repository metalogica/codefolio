---
type: is
id: is-01m4smm79yejng21206rzne1rv
title: Split chat into CHAT.EXE window; make terminal a virtual-FS emulator
kind: feature
status: closed
priority: 2
version: 2
labels: []
dependencies: []
created_at: 2026-10-13T03:24:17.593Z
updated_at: 2026-10-13T03:34:14.901Z
closed_at: 2026-10-13T03:34:14.896Z
close_reason: Shipped in bb60d5f; prod smoke-tested (terminal ls/pwd/cat/tab/denied, chat /api/chat 200)
---
New Chat window + pixel icon holding the OpenRouter chatbot. Terminal becomes an emulator: ls/pwd/cat/open/help/clear over a virtual /home/guest FS generated from content modules, Tab completion, history; all other commands -> permission denied. Plan: ~/.claude/plans/glimmering-crunching-frost.md
