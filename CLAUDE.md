# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Frontend for **Garbage Garage**, a second-hand shop: a public storefront (catalog, item pages, purchase via WhatsApp) and an admin panel (upload/edit listings, internal inventory view, dictionaries for brands/types/buyers/locations). Talks to a separate backend at `api.garbage-garage.com` (`Constants.js` → `base_server_url`); no server code lives in this repo.

## Working rules

### Before changing code

- `src/CodeReview.md` tracks open, deliberately-deferred issues from past reviews (id validation gaps, notification/session-expiry edge cases, missing tests) — check it before assuming something is an oversight rather than a known tradeoff.

### Code conventions

- Imports across folders are absolute from `src/` (`jsconfig.json` sets `baseUrl: src`), e.g. `import * as Constants from "Constants.js"` or `import { CatalogPage } from "Components/MainPages/CatalogPage/CatalogPage.js"`. Don't use relative `../../` imports for cross-folder references — match the existing absolute style.
- New API modules in `Components/Api/` follow the shape described under **Data fetching** in Architecture: URL from a `Constants.js` builder, `credentials: "include"`, an `Error` with a `.status` field on non-ok responses. A request that lacks `.status` gets it (or moves into `Api/`) before it's wired into a `useQuery`, because `retryExceptClientError` decides by `.status`.
- Query keys are constants in `Constants.js` (e.g. `itemDetailsQueryKey`), not inlined at call sites.
- Query-wide policy (`staleTimes`, `retryExceptClientError`) is set once as a `QueryClient` default; a hook overrides it only where it genuinely differs. Read the comments on `staleTimes` before changing a threshold.
- Path builders in `Constants.js` only encode the id, and `segment()` can't stop `".."`: id validity is the caller's job, not the encoder's — check it with `isValidPostId` before building a path (see its usage in `UploadPage`).
- User-facing text (nav labels, buttons, confirmations, notifications, error messages) is in English, even though code comments and notes are in Russian.
- A new component's styles go in `Styles/` at the path that mirrors the component under `Components/` (e.g. `Components/MainPages/DatabasePage/Items/DatabaseItem.js` → `Styles/MainPages/DatabasePage/Items/DatabaseItem.scss`) and are imported absolutely: `import 'Styles/...'`. Existing code mirrors reliably only down to the page folder: `CatalogItemPage` and `AboutUsPage` keep their styles flat, and file names don't always match the component (`Item.js` → `CatalogItem.scss`) — find a component's styles by its import, not by its path. Utility classes shared across components (`CenteredText`, `ColoredText`, `TopAndLeftBorders`, …) live at the root of `Styles/`.
- CSS is global (every imported stylesheet ends up in one bundle), so class names must be unique across the app. Name classes after the component as a BEM block (`item-image-gallery`, `item-image-gallery__track`, `item-image-gallery__track--animating`); when two pages have a component with the same name, prefix the block with the page (`catalog-item-page-image-grid` / `database-item-page-image-grid`). Don't add generic root classes like `.labeled` or `.cross-icon`.

### Comments and notes

- Code comments and working notes (`src/CodeReview.md`, `TODOS.md`) are written in Russian by convention; don't switch them to English when editing nearby code.
- A code comment explains why the current code is the way it is, on its own terms. It must not reference the edit history — how the code used to be, what some change moved or fixed ("раньше было", "теперь", "обратно", "перенесено", "исправлено"); that belongs in the commit message. The test: the comment should read identically to someone opening the file for the first time. Naming an alternative is fine when it is a standing temptation rather than a past state — the block above `pendingRemoveIdRef` in `useItemActions.js` explains why cache cleanup belongs in the effect cleanup and not in `onSuccess`, and that warning stays useful forever. (Cite code by name, not by line number: line numbers rot.) Notes files (`src/CodeReview.md` and friends) are the exception: tracking history is their job.

## Commands

```bash
npm install
npm start          # dev server at http://localhost:3000
npm run build       # production build → build/
npm test            # CRA/Jest test runner, watch mode by default
npm test -- --watchAll=false --testPathPattern=<path>   # single file, non-watch
```

Production runs as a Docker/Nginx image (`.deploy/prod/Dockerfile`, `docker-compose.yaml`, port `3000→80`). On push to `main` (or a manual `workflow_dispatch` run), `.github/workflows/deploy.yaml` builds the image, pushes it to GHCR (`ghcr.io/<owner>/<repo>:latest`), then SSHes into the server and, in `$HOME/<repo>/`, runs `docker compose pull`, `docker compose up -d --force-recreate` and `docker image prune -af`. The workflow ships only the image, not `docker-compose.yaml`: the server runs its own copy of that file, so a change to it in this repo doesn't reach production until the server copy is updated separately.

There is no separate lint script; ESLint runs through `react-app`/`react-app/jest` (CRA's built-in config) during `npm start`/`npm run build`.

## Architecture

**Routing is data-driven.** `Components/Navigation/routes.js` is the single source of truth for pages: each entry is `{ path, label?, needAuth, page }`. `Components/Navigation/buildRouterRoutes.js` turns that array into React Router route objects, and admin-only pages (`needAuth: true`) are gated by `AdminRouteGuard`. Nav links only appear for entries with a `label`. To add a page: add one object here plus the import — nothing else needs to know about it.

**Auth is a single global boolean.** `Components/Auth/AuthContext.js` exposes `isAdmin`/`hasChecked`/`checkAuth` from one `user/me` check done on mount; there's no token stored client-side beyond the `credentials: "include"` cookie. `hasChecked` separates "the server hasn't been asked yet" from "re-checking a known session", and only `AdminRouteGuard` reads it: an admin route renders nothing until the first check resolves, instead of bouncing a logged-in admin to the login page while `isAdmin` is still its initial `false`. The rest of the app doesn't wait — public pages and the nav render immediately, and admin nav links (`AuthChecker`, which reads only `isAdmin`) appear once the check comes back.

**Session expiry is only caught reactively.** 401 handling lives inside individual `queryFn`s (e.g. `useItemDetailsPrivate`, `usePrivateCatalogItems`), not centrally — combined with non-zero `staleTime`, a stale mount can serve cached private data before any request fires. See open items in `src/CodeReview.md`.

**Data fetching is TanStack Query + hand-rolled `fetch` wrappers**, not a shared API client (a low-level request wrapper is a known TODO, see `TODOS.md`). A `Components/Api/*.js` module wraps one endpoint or a family of same-shaped ones (`fetchItems` takes the path and serves both `post/all` and `post/all/private`, `fetchItemDetails` takes a path builder for the public and private detail, `fetchInputData` serves every dictionary, `sendItemToSocial` covers Instagram and Telegram). Each builds its URL from `Constants.js`, always sends `credentials: "include"`, and throws an `Error` with a `.status` field on non-ok responses. Not every request lives there: `user/me` is in `AuthContext.js`, `user/login` in `LoginPage/useLogin.js`, dictionary add/update/delete in `SettingsPage/*SettingRequest.js`, item upload/update inline in `UploadPage/useItemFormSubmit.js`. These don't follow the `.status` convention: `checkSession` in `AuthContext.js` and item upload/update in `useItemFormSubmit.js` don't throw on a non-ok response, and the rest throw an `Error` with only a message. That's harmless while none of them runs through `useQuery`, but `retryExceptClientError` decides by `.status`, so a request without it would get every 4xx retried.

**Query-wide policy lives in `Constants.js` and is wired in as a `QueryClient` default in `index.js`.** Two policies use this shape:

- `staleTimes` (`lists`, `details`, `dictionaries`) — the default `staleTime` is `lists`, and the detail hooks set `details` themselves. The comments there explain each threshold — e.g. `details` is deliberately kept below the default 5-minute `gcTime` so inactive queries don't get evicted before they'd stale-out anyway.
- `retryExceptClientError` — the default `retry` for every query, with no per-hook overrides at present. A 4xx means the server already rejected the request on its contents, so retrying only delays the answer by the backoff; `408`/`425`/`429` are excluded because they ask to be retried (429 can come from the Cloudflare in front of the API rather than the backend). This does not affect mutations, which TanStack Query does not retry by default.

**Path/id building is centralized in `Constants.js`.** Endpoint path builders (`postDetail`, `postUpdate`, `postWhatsappLink`, etc.) all funnel ids through an internal `segment()` (`encodeURIComponent`) to keep a single path segment intact. This only guards against a malformed URL, not a malicious id: `encodeURIComponent` doesn't touch `.`, so `".."` can still collapse a path via URL normalization.

**`src` layout:**
```
src/
├── App.js              # AuthProvider, router built from routes.js, Layout (window shell + Outlet)
├── index.js            # QueryClient with the query-wide defaults from Constants.js
├── Constants.js        # API field names, API paths/builders, query keys, http methods, staleTimes, retryExceptClientError
├── Components/
│   ├── Api/            # fetch wrappers for backend endpoints (not all requests live here, see above)
│   ├── Auth/           # AuthContext, AdminRouteGuard, AuthChecker
│   ├── Filters/        # filter UI and URL-synced filter state shared by catalog and database pages
│   ├── hooks/          # hooks shared across pages (useItemDetailsPrivate, useInputParams, useConfirmedAction, …)
│   ├── utils/          # shared helpers (isValidPostId, itemCache, …)
│   ├── MainPages/      # one folder per page (UploadPage serves both create and edit routes), colocated hooks/layouts/utils
│   ├── Navigation/     # routes.js (route table), buildRouterRoutes, paths
│   ├── Window/         # app shell (OuterWindow/InnerWindow/WindowHeader/ButtonLayer)
│   └── *.js            # shared UI components (Button, DropDown, StatusNotificationWindow, …)
└── Styles/             # SCSS, mirrors the Components tree
```

## Notes worth knowing

- There are currently no tests in the repo (`npm test` runs CRA's Jest setup but no test files exist yet).
