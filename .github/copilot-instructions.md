# Copilot instructions for this repo

Short, concrete rules so AI agents can be productive in this codebase.

## Big picture
- App: Next.js 14 (App Router) in `javascript-version/` using MUI + Tailwind. Tailwind preflight is disabled and styles are scoped with `important: '#__next'` (see `tailwind.config.cjs`).
- Layout composition (dashboard): `Providers` → `LayoutWrapper` → `VerticalLayout` (Navigation/Navbar/Footer) → `AuthGuard` → page. See `src/app/(dashboard)/layout.jsx` and `src/components/AuthGuard.jsx`.
- Aliases are defined in `jsconfig.json` (`@/*`, `@core/*`, `@layouts/*`, `@menu/*`, `@assets/*`, `@components/*`, `@configs/*`, `@views/*`). Use them instead of long relative paths.

## Dev workflow
- Install: `pnpm install` (recommended). Postinstall builds Iconify CSS (`src/assets/iconify-icons/bundle-icons-css.cjs` → `@assets/iconify-icons/generated-icons.css`).
- Run: `pnpm dev` (or `npm run dev`, Windows fallback `npm run dev:win`). Build: `pnpm build`, Start: `pnpm start`. Lint/format: `pnpm lint`, `pnpm lint:fix`, `pnpm format`.
- Node warnings are suppressed in dev via `NODE_OPTIONS=--no-deprecation` (already scripted).

## Routing, layout, auth
- Public auth pages live under `src/app/(blank-layout-pages)/*` (e.g. `login`, `register`, `forgot-password`). Protected app under `src/app/(dashboard)/*` uses `AuthGuard`.
- Auth pattern: client stores token in `localStorage` (remember me) or `sessionStorage`. `AuthGuard` validates via `GET /api/auth/me` and redirects to `/login?next=<pathname>` if missing/401. It clears both storages on 401.
- Login flow: `POST /api/auth/login` then save `access_token` and `user`, finally redirect to `next` or `/`. See `src/views/Login.jsx`.

## Backend access and base paths
- Next.js rewrite proxies `/api/:path*` to the backend (default `http://localhost:3001/api/:path*`). Edit `javascript-version/next.config.mjs` to change.
- Subpath deploys: `basePath` is read from `process.env.BASEPATH`. Client code often prefixes fetches with `process.env.NEXT_PUBLIC_BASE_PATH` so `/api/...` resolves correctly behind a base path. Keep using `/api/...` in client calls and prepend `NEXT_PUBLIC_BASE_PATH` when building absolute paths.
- Legacy page `parts-inventory` uses `process.env.NEXT_PUBLIC_API_BASE` for its own API base; confirm/update this when wiring that feature.

## Legacy integration patterns
- Iframe wrapper pages: e.g. `src/app/(dashboard)/production-management/page.jsx` displays static HTML from `public/production-management/生産数管理ページ.html`. To add similar pages, place HTML under `public/<dir>/file.html` and set `iframe src="/<dir>/<file>.html"`.
- Bridging non-React UI: `src/app/(dashboard)/parts-inventory/page.jsx` boots a legacy app via `initPartsInventoryApp()`, sets `window.API_BASE`, waits for a custom `pi:modal-ready` event, and cleans up with `window.__piAppTeardown` on unmount. MUI dialogs are bridged with `ModalBridge`.

## Theming and providers
- Theme/context providers are in `src/components/Providers.jsx` using `@core/contexts` and `@menu/contexts`. Color mode and settings come from cookies via `@core/utils/serverHelpers.js`.
- Navigation is provided by `@menu/vertical-menu` with custom styles from `@core/styles` and breakpoints in `@menu/defaultConfigs.js`.

## Where to start (examples)
- Add a protected dashboard page: create under `src/app/(dashboard)/your-page/page.jsx`; it will inherit Providers, VerticalLayout, and AuthGuard.
- Add a public page: create under `src/app/(blank-layout-pages)/your-page/page.jsx` (no AuthGuard).
- Call backend: `await fetch(
  `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/your/endpoint`,
  { method: 'GET', headers: { Authorization: `Bearer ${token}` } }
)`; rely on Next.js rewrites.

## Gotchas
- Changing `next.config.mjs` (rewrites/basePath) requires a dev server restart.
- If you enable `basePath`, ensure assets/iframes use the prefixed path or compute with `NEXT_PUBLIC_BASE_PATH`.
- `AuthGuard` is optimistic on network failures (allows access). Tighten this behavior only if required.

---
Open questions to confirm:
- Do we standardize on `NEXT_PUBLIC_BASE_PATH` vs `NEXT_PUBLIC_API_BASE` for legacy pages? Current code uses both; prefer a single source if possible.
- Backend auth endpoints are assumed at `/api/auth/login` and `/api/auth/me`. Confirm other endpoints and error shapes for consistent handling.
