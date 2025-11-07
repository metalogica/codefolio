# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a portfolio website for Rei Jarram built with Astro 5.3.1, React 19, and Tailwind CSS 4. The site features a macOS-inspired desktop interface with a draggable/resizable terminal window that includes an OpenAI-powered chatbot. The project is deployed on Vercel with SSR enabled.

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
- OpenAI GPT-3.5 chatbot integration via `/api/chat` endpoint
- System prompt defines personality: "You ARE Rei Jarram" (first-person responses)
- Placeholder animation cycling
- Mobile detection hides component on mobile devices

**API Routes** (src/pages/api/)
- `chat.ts` - OpenAI chat completions endpoint (POST)
- Requires `OPENAI_API_KEY` environment variable
- Uses gpt-3.5-turbo model with 500 token limit

**Background System**
- Three optimized backgrounds in `src/assets/images/`
- Random selection with localStorage to prevent consecutive repeats
- Astro's `getImage()` optimizes backgrounds at build time

### Environment Variables
- `OPENAI_API_KEY` - Required for chatbot functionality (see `.env.example`)

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
