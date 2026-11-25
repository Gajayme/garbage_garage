# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Frontend for **Garbage Garage**, a second-hand shop: a public storefront (catalog, item pages, purchase via WhatsApp) and an admin panel (upload/edit listings, internal inventory view, dictionaries for brands/types/sizes/buyers/locations). Talks to a separate backend at `api.garbage-garage.com` (`Constants.js` → `base_server_url`); no server code lives in this repo.

## Working rules

### Before changing code

- `src/CodeReview.md` tracks open, deliberately-deferred issues from past reviews (no manual refresh, the catalog stuck while offline, missing tests) — check it before assuming something is an oversight rather than a known tradeoff.

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
- A JSDoc description of a function parameter or prop (`onChange`, `onSubmit`, `buildBody`, `compareItems`, …) must make clear it's a function even to someone who skips the type and the `on` prefix: start with when it's called («Вызывается при переключении чекбокса…») or with the action it performs («Удалить элемент», «Сохранить правку»), then say what it receives or returns. A description of only its argument or its event («Новый список отмеченных id», «Порядок элементов», «Ввод в поле названия») reads like a plain value.

### Explanations

- When explaining code, a bug or a change, don't invent terms. Use either established terminology (React, TanStack Query, HTTP, …) or the names the project already uses: identifiers from the code (`AdminRouteGuard`, `retryExceptClientError`, `staleTimes`) and terms from this file or `src/CodeReview.md`. If something has no name in either, describe it in plain words instead of coining a label for it.

## Commands

```bash
npm install
npm start          # dev server at http://localhost:3000
npm run build       # production build → build/
npm test            # CRA/Jest test runner, watch mode by default
npm test -- --watchAll=false --testPathPattern=<path>   # single file, non-watch
```

In development the app still talks to the production API, but through the dev server: `base_server_url` is `/api/` when `NODE_ENV` is `development`, and `src/setupProxy.js` (picked up by `npm start` only, not part of the build) forwards `/api/*` to `https://api.garbage-garage.com/*` and strips `Domain` from `Set-Cookie`. Calling the API directly from `localhost` doesn't work for admin pages: `localhost` and `api.garbage-garage.com` are different sites, so the browser rejects the session cookie from the login response and `user/me` answers 401. The production build uses the absolute URL; there `garbage-garage.com` and `api.garbage-garage.com` are same-site.

`.env.development` sets `HOST=localhost`, so the dev server listens on `127.0.0.1` only (CRA's default is every network address). Otherwise anyone on the same network could reach the app and the proxy to the production API, and a password typed in on another device would cross the network over plain `http`. To open the dev build from a phone, override it for one run: `HOST=0.0.0.0 npm start` (shell variables take precedence over `.env` files).

Production runs as a Docker/Nginx image (`.deploy/prod/Dockerfile`, `docker-compose.yaml`, port `3000→80`). On push to `main` (or a manual `workflow_dispatch` run), `.github/workflows/deploy.yaml` builds the image, pushes it to GHCR (`ghcr.io/<owner>/<repo>:latest`), then SSHes into the server and, in `$HOME/<repo>/`, runs `docker compose pull`, `docker compose up -d --force-recreate` and `docker image prune -af`. The workflow ships only the image, not `docker-compose.yaml`: the server runs its own copy of that file, so a change to it in this repo doesn't reach production until the server copy is updated separately.

There is no separate lint script; ESLint runs through `react-app`/`react-app/jest` (CRA's built-in config) during `npm start`/`npm run build`.

## Architecture

**Routing is data-driven.** `Components/Navigation/routes.js` is the single source of truth for pages: each entry is `{ path, label?, needAuth, page }`. `Components/Navigation/buildRouterRoutes.js` turns that array into React Router route objects, and admin-only pages (`needAuth: true`) are gated by `AdminRouteGuard`. Nav links only appear for entries with a `label`. To add a page: add one object here plus the import — nothing else needs to know about it.

**Auth is a query, not a context.** `Components/Auth/useAuth.js` exposes `isAdmin`/`hasChecked`/`checkAuth` on top of one `useQuery` for `user/me` (`Api/fetchSession.js`); there's no provider, and no token stored client-side beyond the `credentials: "include"` cookie. A 401 from `user/me` is an answer (`isAdmin: false`), any other failure is a query error, so a failed re-check keeps the last known answer instead of logging the admin out. `hasChecked` (`!isPending`) separates "the server hasn't answered yet" from "re-checking a known session", and only `AdminRouteGuard` reads it: an admin route renders nothing until the first check resolves, instead of bouncing a logged-in admin to the login page while `isAdmin` is still `false`. The rest of the app doesn't wait — public pages and the nav render immediately, and admin nav links (`AuthChecker`, which reads only `isAdmin`) appear once the check comes back. `checkAuth` invalidates the query; it's called by the 401 handlers and after login.

**Session expiry is caught on entering an admin page and on returning to the tab.** While the cached answer says admin, the session query refetches on mount, window focus and reconnect once it's older than `staleTimes.session`; every `useAuth` caller subscribes to it, and `AdminRouteGuard` mounts anew on each admin page (`buildRouterRoutes` keys it by route path — without the key React reuses one guard instance across admin-to-admin navigation), so entering one re-checks the session in the background. Guests are checked once on load. 401 handlers still live in individual `queryFn`s and actions (`useItemDetailsPrivate`, `usePrivateCatalogItems`, `useItemActions`, `useItemFormSubmit`), not centrally. An expiry during work on one page without navigation is noticed only by the next request.

**Data fetching is TanStack Query + hand-rolled `fetch` wrappers**, not a shared API client (a low-level request wrapper is a known TODO, see `TODOS.md`). A `Components/Api/*.js` module wraps one endpoint or a family of same-shaped ones (`fetchItems` takes the path and serves both `post/all` and `post/all/private`, `fetchItemDetails` takes a path builder for the public and private detail, `fetchInputData` serves every dictionary, `sendItemToSocial` covers Instagram and Telegram, `fetchSession` serves `user/me` and returns its 401 as `isAdmin: false` instead of throwing). Each builds its URL from `Constants.js`, always sends `credentials: "include"`, and throws an `Error` with a `.status` field on non-ok responses. Not every request lives there: `user/login` is in `LoginPage/useLogin.js`, dictionary add/update/delete in `SettingsPage/*SettingRequest.js`, item upload/update inline in `UploadPage/useItemFormSubmit.js`. These don't follow the `.status` convention: item upload/update in `useItemFormSubmit.js` doesn't throw on a non-ok response, and the rest throw an `Error` with only a message. That's harmless while none of them runs through `useQuery`, but `retryExceptClientError` decides by `.status`, so a request without it would get every 4xx retried.

**Query-wide policy lives in `Constants.js` and is wired in as a `QueryClient` default in `index.js`.** Two policies use this shape:

- `staleTimes` (`lists`, `details`, `dictionaries`, `session`) — the default `staleTime` is `lists`; the detail hooks set `details` themselves, and the session query in `useAuth` sets `session`. The comments there explain each threshold — e.g. `details` is deliberately kept below the default 5-minute `gcTime` so inactive queries don't get evicted before they'd stale-out anyway.
- `retryExceptClientError` — the default `retry` for every query, with no per-hook overrides at present. A 4xx means the server already rejected the request on its contents, so retrying only delays the answer by the backoff; `408`/`425`/`429` are excluded because they ask to be retried (429 can come from the Cloudflare in front of the API rather than the backend). This does not affect mutations, which TanStack Query does not retry by default.

**Path/id building is centralized in `Constants.js`.** Endpoint path builders (`postDetail`, `postUpdate`, `postWhatsappLink`, etc.) all funnel ids through an internal `segment()` (`encodeURIComponent`) to keep a single path segment intact. This only guards against a malformed URL, not a malicious id: `encodeURIComponent` doesn't touch `.`, so `".."` can still collapse a path via URL normalization.

**Sizes are a dictionary tied to types.** Like the other dictionaries, an item reads `size` as `{ id, title }` and writes `sizeId` (`name`/`apiField` in the `UploadPage` defs). `size/all` returns each size with the types it fits (`types: [{ id, title }]`), and `size/upload`/`size/update` take `{ "<title>": [typeId, …] }`, which replaces the whole type list. On `UploadPage` the size dropdown declares `dependsOn: Constants.type`: it stays disabled until a type with sizes is picked, offers only that type's sizes (`sizesForType` in `utils/sizes.js`), and resets when the type changes. On `SettingsPage` the same `SettingsDictionarySection` serves sizes. The section knows nothing about types: its `link` prop (a `DictionaryLink`, see `SettingsPage/dictionaryLink.js`) ties a dictionary's items to another dictionary — checkboxes when adding and editing, linked titles in the list — and `SettingsPage` passes the types there. Sizes sort by `compareSizes` (XS…XL, then numbers, then the rest), not alphabetically.

**`src` layout:**
```
src/
├── App.js              # router built from routes.js, Layout (window shell + Outlet)
├── index.js            # QueryClient with the query-wide defaults from Constants.js
├── setupProxy.js       # dev-server proxy /api/* → production API (npm start only)
├── Constants.js        # API base URL, API field names, API paths/builders, query keys, http methods, staleTimes, retryExceptClientError
├── Components/
│   ├── Api/            # fetch wrappers for backend endpoints (not all requests live here, see above)
│   ├── Auth/           # useAuth (session query), AdminRouteGuard, AuthChecker
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
