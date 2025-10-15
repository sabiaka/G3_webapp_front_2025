# Copilot instructions for this repo

Short, repo-specific rules so AI agents can be productive immediately.

## Big picture
- App: Next.js 14 (App Router) under `javascript-version/` using MUI + Tailwind. Tailwind preflight is disabled and styles are scoped with `important: '#__next'` (`tailwind.config.cjs`).
- Dashboard composition: `Providers` → `AuthGuard` → `LayoutWrapper` → `VerticalLayout` (Navigation/Navbar/Footer) → page. See `src/app/(dashboard)/layout.jsx`, `src/components/AuthGuard.jsx`.
- Path aliases from `jsconfig.json`: `@/*`, `@core/*`, `@layouts/*`, `@menu/*`, `@assets/*`, `@components/*`, `@configs/*`, `@views/*`.

## Dev workflow
- Install: pnpm recommended. Postinstall builds Iconify CSS (`src/assets/iconify-icons/bundle-icons-css.cjs`).
- Run: `pnpm dev` (Windows fallback `npm run dev:win`), Build: `pnpm build`, Start: `pnpm start`, Lint/Format: `pnpm lint`, `pnpm lint:fix`, `pnpm format`.
- Dev suppresses Node deprecation warnings via `NODE_OPTIONS=--no-deprecation` in scripts.

## Routing, auth, and storage
- Public auth routes live in `src/app/(blank-layout-pages)/*` (login/register/forgot-password). Protected app is under `src/app/(dashboard)/*` and uses `AuthGuard`.
- Login: `POST /api/auth/login` then persist `access_token` and `user` to `localStorage` (remember me) or `sessionStorage`. Redirects to `next` query or `/` (`src/views/Login.jsx`).
- Guard: checks token, calls `GET /api/auth/me` with 5s timeout; on 401 it clears both storages and redirects to `/login?next=<pathname>`, on network/timeout it redirects to `/error?code=network|timeout`.

## Backend access and base paths
- Rewrites: `/api/:path*` → backend (default `http://localhost:3001/api/:path*`). Edit `javascript-version/next.config.mjs`.
- Subpath deploys: set `BASEPATH`; client builds absolute URLs with `process.env.NEXT_PUBLIC_BASE_PATH || ''` and still requests `/api/...`.
- Legacy parts inventory uses `process.env.NEXT_PUBLIC_API_BASE` for its own API base (see `src/app/(dashboard)/parts-inventory/page.jsx`).

## Legacy integration patterns
- Iframe wrapper: `src/app/(dashboard)/production-management/page.jsx` renders `public/production-management/生産数管理ページ.html` via `<iframe>`. To add more, drop HTML under `public/<dir>/file.html` and set `src="/<dir>/<file>.html"`.
- Bridging non-React UI: parts inventory boots a legacy app with `initPartsInventoryApp()`, sets `window.API_BASE`, waits for `pi:modal-ready`, and tears down via `window.__piAppTeardown`. MUI dialogs are bridged with `ModalBridge`.

## Theming and layout
- Providers: `src/components/Providers.jsx` wires `@core/contexts`, `@menu/contexts`, and `ThemeProvider`; includes `UpgradeToProButton`.
- Navigation: `@components/layout/vertical/*` with defaults in `@menu/defaultConfigs.js`. Tailwind plugin at `src/@core/tailwind/plugin`.

## Examples
- Protected page: add `src/app/(dashboard)/your-page/page.jsx` (inherits Providers/Layout/Guard automatically).
- Public page: add `src/app/(blank-layout-pages)/your-page/page.jsx`.
- Backend call pattern:
  `await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/your/endpoint`, { headers: { Authorization: \`Bearer ${token}\` } })`

## Gotchas
- Changing rewrites/basePath requires restarting the dev server.
- When `basePath` is set, prefix asset and iframe URLs (or compute with `NEXT_PUBLIC_BASE_PATH`).
- Ensure storage keys are exactly `access_token` and `user` to interoperate with `AuthGuard` and pages.

—
Open questions to confirm with the team:
- Standardize `NEXT_PUBLIC_BASE_PATH` vs `NEXT_PUBLIC_API_BASE` for legacy areas; both appear today.
- Confirm the shape of auth/user responses for `/api/auth/login` and `/api/auth/me` to keep storage in sync.