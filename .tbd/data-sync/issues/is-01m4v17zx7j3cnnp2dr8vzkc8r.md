---
type: is
id: is-01m4v17zx7j3cnnp2dr8vzkc8r
title: Chat typing bubble + persistent terminal session and history command
kind: feature
status: closed
priority: 2
version: 2
labels: []
dependencies: []
created_at: 2026-10-13T16:24:02.721Z
updated_at: 2026-10-13T16:28:32.914Z
closed_at: 2026-10-13T16:28:32.906Z
close_reason: Shipped in 04b3b87; prod verified (terminal restore on reopen+reload, history cmd, typing bubble animates and clears)
---
Pixel typing-dots bubble in ChatWindow while awaiting a reply (CSS steps animation, motion-reduce off). Terminal screen + command history persisted in sessionStorage across close/reopen/reload; new history command (n, -c).
