# codefolio — orientation for agents

> Canonical **root** agent-context. `CLAUDE.md` is a symlink to this file so Claude Code
> and cross-tool agents read one source. Read this first, then open the doctrine for the
> area you're working in.

Portfolio website for Rei Jarram — a macOS-inspired desktop interface built with Astro 5.3.1, React 19, and Tailwind CSS 4, featuring a draggable terminal window with an OpenRouter-powered chatbot. SSR on Vercel at https://rei.gg.

## Verification gates — declared, never assumed

This repo declares its build/test/lint gate in `substrate.yaml` (`gate: {compile, test, lint}`).
`/substrate:execute` reads and runs those; it does not guess a toolchain. If `substrate.yaml`
or its `gate` block is missing, execution aborts with an explanation — fix the file, don't probe.

## Spec & task lifecycle — ALL planning docs live under `docs/tasks/`

One home for every planning artifact — feature specs, plan docs, research briefs, spike records:
**`docs/tasks/ongoing/<slug>/` while the work is active → `git mv` the whole folder to
`docs/tasks/completed/<slug>/` when its tracking bead/epic closes.** No other location. tbd does
**not** move these files — it tracks beads in `.tbd/`, never your spec files; the move is a
deliberate manual step.

## Doctrine — the binding architecture

Every change is bound to the doctrines registered in `docs/doctrine/doctrine-manifest.yaml`
(enforced by `docs/scripts/doctrine-lint.sh`). Read before touching the matching area:

- `docs/doctrine/agents-doctrine.md` — **the doctrine on doctrines** (the meta-doctrine): authoring
  rules, the manifest as single source of truth, the two enforcement gates, and the drift-evaluation
  protocol. Read before adding/renaming any doctrine.
- `docs/doctrine/agents-parallel-execution-doctrine.md` — parallel-bead orchestration (single-writer
  tracker, integration branch + merge-on-green, file-disjoint waves, gate-before-close, two-stage
  gate, worktree hygiene). Read before running a bead DAG with subagents.
- `docs/doctrine/desktop-doctrine.md` — the macOS-inspired desktop environment: window management
  (draggable/resizable terminal), MacToolbar, Dock, desktop icons, and background rotation. Read
  before touching the desktop UI.

Add your own stack/domain doctrines with `/substrate:add-doctrine`; each self-registers in the manifest.

<!-- BEGIN TBD INTEGRATION format=f06 surface=agents-md -->
## tbd

This repository uses **tbd** for git-native issue tracking (beads), spec-driven
planning, and on-demand engineering guidelines.
As the agent, you operate tbd on the user’s behalf: translate their requests into tbd
actions rather than telling them to run commands.

- Run `tbd prime` to load current project state and the full tbd workflow.
- Run `tbd skill` for the complete reusable tbd skill instructions.
- Run `tbd shortcut --list` and `tbd guidelines --list` for on-demand resources.
- Track all work as beads: `tbd create`, `tbd ready`, `tbd close`, and `tbd sync`.

<!-- END TBD INTEGRATION -->

## (existing context)

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website for Rei Jarram built with Astro 5.3.1, React 19, and Tailwind CSS 4. The site features a macOS-inspired desktop interface with a draggable/resizable terminal window that includes an OpenRouter-powered chatbot. The project is deployed on Vercel with SSR enabled.

## Development Commands

### Core Commands
- `pnpm dev` - Start development server
- `pnpm build` - Build for production
- `pnpm preview` - Preview production build locally
- `pnpm lint` - Run ESLint on all files

### Package Manager
This project uses **pnpm**. Always use pnpm instead of npm or yarn.

## Architecture Overview

### Framework Configuration
- **Output mode**: Server-side rendering (SSR) via Vercel adapter
- **Routing**: Astro file-based routing in `src/pages/`
- **Styling**: Tailwind CSS 4 with Vite plugin integration
- **SEO**: Sitemap generation with trailing slash removal

### Component Architecture

**Astro Components** (`src/components/*.astro`, `src/layouts/*.astro`)
- Server-rendered by default
- `LandingPage.astro` has `export const prerender = false` for dynamic background selection
- Used for layout shells and static content

**React Components** (`src/components/**/*.tsx`, `src/layouts/*.tsx`)
- Interactive UI components requiring client-side state
- `AppLayout.tsx` uses `client:load` directive in `LandingPage.astro`
- All global UI components (MacTerminal, MacToolbar, Docks) are React

### Key Components

**AppLayout.tsx** (src/layouts/AppLayout.tsx)
- Main desktop environment orchestrator
- Manages background rotation using localStorage
- Coordinates MacToolbar, MacTerminal, and Dock components
- Desktop icons configuration (currently includes cv.pdf)

**MacTerminal.tsx** (src/components/global/MacTerminal.tsx)
- Draggable/resizable terminal window (desktop only, hidden on mobile)
- OpenRouter chatbot integration via `/api/chat` endpoint
- System prompt defines personality: "You ARE Rei Jarram" (first-person responses)
- Placeholder animation cycling
- Mobile detection hides component on mobile devices

**API Routes** (src/pages/api/)
- `chat.ts` - OpenRouter chat completions endpoint (POST), via the OpenAI SDK pointed at
  `https://openrouter.ai/api/v1` (OpenRouter is OpenAI wire-compatible)
- Requires `OPENROUTER_API_KEY` environment variable
- Uses the `xiaomi/mimo-v2.5-pro` model with 500 token limit

**Background System**
- Three optimized backgrounds in `src/assets/images/`
- Random selection with localStorage to prevent consecutive repeats
- Astro's `getImage()` optimizes backgrounds at build time

### Environment Variables
- `OPENROUTER_API_KEY` - Required for chatbot functionality (see `.env.example`)

### Code Style

**ESLint Configuration** (eslint.config.js)
- TypeScript ESLint + Astro plugin
- Unused vars must be prefixed with `_`
- `no-console: warn`
- Astro files: single quotes, 2-space indent, semicolons required

**Pre-commit Hook**
- Runs `pnpm run lint` via Husky before commits
- Located in `.husky/pre-commit`

## Project Structure Notes

- `src/assets/images/` - Static image assets (mac backgrounds)
- `src/components/global/` - Reusable UI components (MacToolbar, Docks, Terminal)
- `src/pages/` - File-based routes (index.astro, api/*)
- `src/layouts/` - Layout components (Layout.astro for HTML shell, AppLayout.tsx for desktop)
- `public/` - Static files served at root (CV PDF, robots.txt)

## Deployment

- Deployed to Vercel via `@astrojs/vercel` adapter
- Analytics integrated via `@vercel/analytics`
- Site URL: https://rei.gg
