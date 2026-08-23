# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Frontend for **Garbage Garage**, a second-hand shop: a public storefront (catalog, item pages, purchase via WhatsApp) and an admin panel (upload/edit listings, internal inventory view, dictionaries for brands/types/buyers/locations). Talks to a separate backend at `api.garbage-garage.com` (`Constants.js` → `base_server_url`); no server code lives in this repo.

## Commands

```bash
npm install
npm start          # dev server at http://localhost:3000
npm run build       # production build → build/
npm test            # CRA/Jest test runner, watch mode by default
npm test -- --watchAll=false --testPathPattern=<path>   # single file, non-watch
```

Production runs as a Docker/Nginx image (`.deploy/prod/Dockerfile`, `docker-compose.yaml`, port `3000→80`). On push to `main`, `.github/workflows/deploy.yaml` builds the image, pushes to GHCR (`ghcr.io/<owner>/<repo>:latest`), and deploys to the server over SSH via `docker compose pull && up -d`.

There is no separate lint script; ESLint runs through `react-app`/`react-app/jest` (CRA's built-in config) during `npm start`/`npm run build`.

## Import convention

`jsconfig.json` sets `baseUrl: src`, so imports are absolute from `src/`, e.g. `import * as Constants from "Constants.js"` or `import { CatalogPage } from "Components/MainPages/CatalogPage/CatalogPage.js"`. Don't use relative `../../` imports for cross-folder references — match the existing absolute style.

## Architecture

**Routing is data-driven.** `Components/Navigation/routes.js` is the single source of truth for pages: each entry is `{ path, label?, needAuth, page }`. `Components/Navigation/buildRouterRoutes.js` turns that array into React Router route objects, and admin-only pages (`needAuth: true`) are gated by `AdminRouteGuard`. Nav links only appear for entries with a `label`. To add a page: add one object here plus the import — nothing else needs to know about it.

**Auth is a single global boolean.** `Components/Auth/AuthContext.js` exposes `isAdmin`/`hasChecked`/`checkAuth` from one `user/me` check done on mount; there's no token stored client-side beyond the `credentials: "include"` cookie. `hasChecked` exists specifically so the app can hold rendering until the first auth check resolves, rather than flashing the wrong UI.

**Session expiry is only caught reactively.** 401 handling lives inside individual `queryFn`s (e.g. `useItemDetailsPrivate`, `usePrivateCatalogItems`), not centrally — combined with non-zero `staleTime`, a stale mount can serve cached private data before any request fires. See open items in `src/CodeReview.md`.

**Data fetching is TanStack Query + hand-rolled `fetch` wrappers**, not a shared API client (`Components/utils/` low-level wrapper is a known TODO, see `src/TODOS.md`). Each `Components/Api/*.js` module wraps one endpoint using builders from `Constants.js`, always with `credentials: "include"`, and throws an `Error` with a `.status` field on non-ok responses — match this shape in new API modules. Query keys are centralized as constants in `Constants.js` (e.g. `itemDetailsQueryKey`), not inlined at call sites.

**Freshness policy is centralized in `Constants.js`'s `staleTimes`** (`lists`, `details`, `dictionaries`), set as the default `staleTime` in `index.js`'s `QueryClient` and overridden per-hook where needed. Read the comments there before changing a threshold — e.g. `details` is deliberately kept below the default 5-minute `gcTime` so inactive queries don't get evicted before they'd stale-out anyway.

**Path/id building is centralized in `Constants.js`.** Endpoint path builders (`postDetail`, `postUpdate`, `postWhatsappLink`, etc.) all funnel ids through an internal `segment()` (`encodeURIComponent`) to keep a single path segment intact. This only guards against a malformed URL, not a malicious id (`encodeURIComponent` doesn't touch `.`, so `".."` can still collapse a path via URL normalization) — id validity itself is the caller's job (see `isValidPostId` usage in `UploadPage`), not the encoder's.

**`src` layout:**
```
src/
├── Components/
│   ├── Api/           # one fetch wrapper per backend endpoint
│   ├── Auth/          # AuthContext, AdminRouteGuard, AuthChecker
│   ├── MainPages/      # one folder per route, colocated hooks/layouts/utils
│   ├── Navigation/     # routes.js (route table), buildRouterRoutes, paths
│   └── Window/         # app shell (OuterWindow/InnerWindow/Header/ButtonLayer)
├── Constants.js        # API paths, query keys, http methods, staleTimes
└── Styles/              # SCSS, mirrors the Components tree
```

## Notes worth knowing

- Code comments and working notes (`src/CodeReview.md`, `src/TODOS.md`, `src/QUESTIONS.md`) are written in Russian by convention; don't switch them to English when editing nearby code.
- `src/CodeReview.md` tracks open, deliberately-deferred issues from past reviews (id validation gaps, notification/session-expiry edge cases, missing tests) — check it before assuming something is an oversight rather than a known tradeoff.
- There are currently no tests in the repo (`npm test` runs CRA's Jest setup but no test files exist yet).
