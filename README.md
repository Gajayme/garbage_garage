# Garbage Garage

Frontend for the **Garbage Garage** second-hand shop: a public storefront and an admin panel.

The public side is a product catalog with filters and item pages (purchase via WhatsApp). The private side covers uploading and editing listings, an internal inventory view, and dictionaries (brands, types, buyers, locations).

API: [api.garbage-garage.com](https://api.garbage-garage.com/)

## Stack

- React 18 (Create React App)
- React Router
- TanStack Query
- Sass
- `@dnd-kit` — image reordering on upload
- Docker + Nginx — production

## Pages

| Path | Access | Purpose |
|------|--------|---------|
| `/` | public | Catalog with filters (state synced to the URL) |
| `/catalog/:itemId` | public | Item page, gallery, BUY button → WhatsApp |
| `/about-us` | public | About the shop |
| `/login` | public | Admin login |
| `/upload` | admin | Create a listing |
| `/upload/edit/:itemId` | admin | Edit a listing |
| `/database` | admin | Private list of all items |
| `/database/:itemId` | admin | Item details (internal view) |
| `/settings` | admin | Dictionaries: brands, types, buyers, locations |

Admin routes are protected by `AdminRouteGuard` and only appear in the nav for authenticated users.

## Local development

```bash
npm install
npm start
```

The app runs at [http://localhost:3000](http://localhost:3000).

Other scripts:

```bash
npm run build   # production build → build/
npm test        # tests
```

## Production

Built and served with Nginx in Docker:

```bash
docker compose up -d
```

Image: `ghcr.io/gajayme/garbage_garage:latest` (host port `3000` → container `:80`).

On push to `main`, GitHub Actions builds the image, pushes it to GHCR, and deploys to the server over SSH.

## `src` layout

```
src/
├── Components/
│   ├── Api/           # backend requests
│   ├── Auth/          # login, context, route guard
│   ├── MainPages/     # app pages
│   ├── Navigation/    # routes and navbar
│   └── Window/        # UI shell (window / header / buttons)
├── Constants.js       # API URLs and query keys
└── Styles/            # SCSS
```
