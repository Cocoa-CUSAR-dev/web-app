# Cocoa Researcher Web App (Next.js)

Web portal for **researchers and admins** in the Cocoa Supply Chain Databank (Is Thai Cacao): dashboards, analytics, maps, form/task management, and user administration.

---

## Role in the 2026–2027 plan

Part of a system being modernized over a 10-month thesis (Jul 2026 – Apr 2027):

- **Phase I (mandatory, by Dec 2026)** — LINE OA AI chatbot channel, farmer-app modernization, SSO (LINE ↔ web), reminders, and **web submission history**. Existing form system unchanged (no data migration).
- **Phase II (gated, Dec 2026 – Apr 2027)** — Knowledge Base + Computer Vision.

**Where this app fits:** it is the **researcher web portal**. New Phase I work here: a **submission-history view** reachable from LINE OA via SSO (deep links open here with no second login), and a **reminder-cadence settings** UI. In Phase II it gains a **Knowledge Base authoring** tool. Note the registration flow is currently broken end-to-end (`FE-1`) and is an early Phase I fix.

---

## Tech stack

Next.js 16 · React 19 · MUI 7 · MapLibre GL + OpenLayers · Chart.js · TypeScript · **pnpm** · Playwright.

### Key design decision — server-proxied requests (BFF)

The browser **never** calls the backend directly. Every request goes to the Next.js server (API routes under `/api/v1/*`), which relays the JWT cookie to the Kotlin backend. This keeps the backend URL and credentials out of the client bundle and lets one Docker image be configured at container-start. **Don't introduce `NEXT_PUBLIC_*` variables** — that would defeat it.

## Run locally

```bash
corepack enable        # Node.js LTS 20.9+
pnpm install
pnpm dev -p 3000
```

Quality gate before committing: `pnpm qc` — runs, in order, **TypeScript** (`tsc --noEmit`), **ESLint**, then **Prettier**. Tests: `npx playwright test tests/<file>` (suites: login, landing, form, map, dashboard).

## Configuration

Copy `.env.sample` to `.env.development` (local) / `.env.production` (build) — both are gitignored. The key that matters:

```
BACKEND_URL=            # URL of the Kotlin web backend, e.g. http://localhost:3001
TOKEN_NAME=             # JWT cookie name (must match the backend's JWT_NAME)
```

> `BACKEND_URL` currently falls back to `http://localhost:3001` if unset (`FE-9`) — set it explicitly for any real deployment.

## Source layout (`src/`)

| Dir | Purpose |
|---|---|
| `app/` | App Router routes, incl. `app/api/v1/**` BFF proxy handlers |
| `components/` | global components |
| `core/` | core types, constants, classes |
| `hooks/` · `libs/` | global hooks / functions |
| `modules/` | loosely-coupled feature modules |
| `providers/` | context providers |
| `themes/` | MUI theme (`mainTheme`) |
| `proxy.ts` | middleware (renamed from `middleware.ts` in Next.js 16) |

## Deploy

Docker is recommended:
```bash
docker build -t <image>:<tag> .
docker run -d -p 8080:8080 -e NODE_ENV=production \
  -e BACKEND_URL=<url> -e TOKEN_NAME=<cookie-name> --name <name> <image>:<tag>
```
Also supports AWS Elastic Beanstalk (container preferred; source-bundle deploy needs pnpm→npm) and manual VM (`pm2` + standalone build). No websockets are used.

## Known issues tracked for Phase I

- `FE-1` — registration flow broken end-to-end (BFF route no-ops, submit button not wired).
- `FE-2` — every 5xx response mis-classified (`in` operator on an array in `fetchResponse.ts`).
- `FE-3` — BFF proxy boilerplate duplicated across ~11 routes.

Full list and fix order: the project docs site.
