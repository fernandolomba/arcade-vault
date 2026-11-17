# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Arcade Vault: a platform to play games online and compete for the highest score. Built with spec-driven development (`/spec` and `/spec-impl` workflow, skills from `Klerith/fernando-skills`, installed via `npx skills@latest add Klerith/fernando-skills`). Currently a fresh Create Next App scaffold; only `app/` (layout, page, globals.css) exists.

## Commands

- `npm run dev` — dev server (Turbopack) at http://localhost:3000
- `npm run build` / `npm run start` — production build / serve
- `npm run lint` — ESLint (flat config, `eslint.config.mjs`)
- No test runner is configured yet.

## Next.js version warning

Next 16.4.6 / React 19.3 has breaking changes versus common training data (see `AGENTS.md`). Before writing Next.js code, read the relevant guide in `node_modules/next/dist/docs/` (`01-app`, `02-pages`, `03-architecture`, `04-community`; start at `index.md`).

## Configuration notes

- `next.config.ts` enables `cacheComponents`, `partialPrefetching` and `experimental.agentFeedback`. `cacheComponents` changes caching/dynamic-rendering semantics, so check the docs before using data fetching or request APIs in the App Router.
- Tailwind v4 is wired through Turbopack: `next.config.ts` has a `turbopack.rules` entry running `@tailwindcss/turbopack` on `*.css`. Styles are configured in `app/globals.css` (`@import "tailwindcss"`, `@theme inline`), not a `tailwind.config` file.
- Path alias: `@/*` maps to the repo root (not `src/`).
- TypeScript is `strict`.
