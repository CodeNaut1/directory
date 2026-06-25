# African Bitcoin Directory

A full-stack monorepo powering the **Bitcoin in Africa Live Directory** — a public platform for discovering, listing, and showcasing Bitcoin businesses, communities, builders, and initiatives across the African continent.

The repository contains two independently deployed applications:

| App | Path | Framework | Role |
| --- | --- | --- | --- |
| **Client** | `client/` | React 19 + Vite 7 | Public-facing SPA, dashboards, admin console |
| **Server** | `server/` | Next.js 15 (App Router) + Prisma 5 | JSON REST API, auth, persistence, integrations |

> The Next.js server is used **almost exclusively as a headless API** (`/api/*` route handlers). The user interface is delivered by the separate Vite/React SPA in `client/`.

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture Overview](#architecture-overview)
5. [Authentication Flow](#authentication-flow)
6. [API Structure](#api-structure)
7. [Database & Prisma](#database--prisma)
8. [Environment Variables](#environment-variables)
9. [Local Development Setup](#local-development-setup)
10. [Build & Deployment](#build--deployment)
11. [Render Deployment Notes](#render-deployment-notes)
12. [Folder Structure](#folder-structure)
13. [Important Services & Modules](#important-services--modules)
14. [Current Project Status](#current-project-status)
15. [Known Issues & Technical Debt](#known-issues--technical-debt)
16. [Future Improvements](#future-improvements)

---

## Project Overview

The African Bitcoin Directory connects the Bitcoin ecosystem in Africa. Anyone can browse a curated directory of projects filtered by **country**, **category**, and **tags**; view rich project profiles; explore an interactive **live map** (Mapbox GL) and **quarterly infographics**; and search across all listings.

Registered users can **submit their own projects**, track approval status from a personal dashboard, edit listings, and **claim ownership** of unowned projects already in the directory. A role-based **admin console** lets moderators and admins approve/reject submissions, manage taxonomy (categories, countries, tags), review ownership claims, and manage users.

### Main Purpose

- Provide a **single authoritative directory** of Bitcoin activity across Africa.
- Lower the barrier to **self-submission** while keeping quality high via **moderation**.
- Surface ecosystem data visually (map + infographics) for storytelling and research.

---

## Key Features

- **Public directory** with filtering by country, category, and tag, plus pagination.
- **Full-text search** across project name and description (`/api/search`).
- **Interactive live map** of projects (Mapbox GL JS).
- **Quarterly infographics** + archive (2023–2026 assets bundled).
- **User auth**: email/password registration & login with JWT access + refresh tokens.
- **Project submission** with optional logo upload (multipart form data).
- **Moderation workflow**: `pending → approved/rejected`, with email notifications.
- **Project claiming**: users can claim unowned listings; admins approve/transfer ownership atomically.
- **Admin console**: stats dashboard, pending queue, all-projects management, taxonomy CRUD, users & roles, claims.
- **Email notifications** (Nodemailer/Gmail SMTP) for welcome, submission, approval, rejection, changes-requested.
- **Google Sheets sync** of submissions (service account) as a fire-and-forget side effect.
- **Google Analytics 4** page-view tracking on the client.

---

## Technology Stack

### Backend (`server/`)

| Concern | Choice |
| --- | --- |
| Runtime/framework | **Next.js 15** (App Router, route handlers) |
| Language | TypeScript 5.5 (strict) |
| ORM | **Prisma 5.x** (`@prisma/client`) |
| Database | **PostgreSQL** (Neon recommended) |
| Auth/JWT | **`jose`** (HS256), **`bcryptjs`** (cost 12) |
| Validation | **Zod 3** |
| Email | **Nodemailer** (Gmail SMTP) |
| Integrations | **googleapis** (Sheets) |
| Logging | **pino** (Winston also installed but unused) |
| Misc | `slugify`, `cookie`, `cors`, `sharp`, `pdf-lib` |
| Testing | Jest + ts-jest + Testing Library (configured, no tests yet) |

### Frontend (`client/`)

| Concern | Choice |
| --- | --- |
| Framework | **React 19** |
| Build tool | **Vite 7** |
| Routing | **react-router-dom 7** |
| Maps | **mapbox-gl 3** |
| PDF / flags | `jspdf`, `flag-icons` |
| Analytics | `react-ga4` |
| Language | TypeScript 5.8 (strict) |

---

## Architecture Overview

```
┌──────────────────────────┐         HTTPS / JSON          ┌──────────────────────────────┐
│        CLIENT (SPA)       │  ───────────────────────────► │      SERVER (Next.js API)      │
│  React 19 + Vite + Router │                               │  app/api/**/route.ts handlers  │
│                           │  ◄─────────────────────────── │                                │
│  AuthContext (JWT in LS)  │     access token (Bearer)     │  createApiHandler wrapper      │
│  Mapbox / GA4 / pages     │     refresh token (cookie)    │   → validators (Zod)           │
└──────────────────────────┘                               │   → services (business logic)  │
                                                            │   → Prisma → PostgreSQL        │
                                                            │                                │
                                                            │  Side effects:                 │
                                                            │   • Nodemailer (Gmail)         │
                                                            │   • Google Sheets (googleapis) │
                                                            └──────────────────────────────┘
```

### Frontend Architecture

- **`client/src/main.tsx`** bootstraps React, wraps the app in `BrowserRouter` and `AuthProvider`.
- **`App.tsx`** declares all routes: public pages, `ProtectedRoute`-guarded user pages, and a nested `/admin/*` section under `AdminLayout`.
- **`contexts/AuthContext.tsx`** is the single source of auth truth: it stores the **access token in `localStorage`**, calls the API base URL from `VITE_API_URL`, performs login/register/logout, and auto-refreshes the access token via the HTTP-only refresh cookie when a `401` is encountered.
- **`utils/api.ts`** provides `authenticatedFetch` (injects the Bearer token + `credentials: 'include'`).
- **Pages** (`src/pages/`) map 1:1 to routes; **components** (`src/components/`) hold shared UI (`Navbar`, `ProtectedRoute`, `AdminLayout`, map widgets, modals).
- **Static data** (`src/data/projects.json`, `coordinates.json`) provides legacy/fallback content and map coordinates, with rich typings in `projects.types.ts`.

### Backend Architecture (layered)

```
HTTP Request
  → middleware.ts            (global CORS + security headers)
  → app/api/**/route.ts      (thin HTTP handlers, one file per resource)
      → createApiHandler     (auth gate, role check, Zod validation, error mapping, CORS)
      → lib/services/*       (business logic, the only place that talks to Prisma)
          → lib/db/prisma    (singleton Prisma client)
      → lib/utils/*          (api-response, errors, logger, rate-limit)
  ← standardized JSON { success, data?, error?, meta? }
```

Most routes use the **`createApiHandler`/`createPostHandler`/`createPatchHandler`** wrappers from `lib/utils/api-handler.ts`, which centralize authentication, role enforcement, body/query validation, error-to-HTTP mapping, and CORS. A subset of admin and submit routes are written as **raw `export async function GET/POST`** handlers instead (see [Technical Debt](#known-issues--technical-debt)).

---

## Authentication Flow

Authentication is **JWT-based** using `jose` (HS256). Two tokens are issued:

| Token | Storage | Default TTL | Secret |
| --- | --- | --- | --- |
| **Access token** | Client `localStorage` (`access_token`) + sent as `Authorization: Bearer` | `JWT_EXPIRES_IN` (default `1d`) | `JWT_ACCESS_SECRET` |
| **Refresh token** | **HTTP-only cookie** `refreshToken` (`sameSite=lax`, `secure` in prod) | `JWT_REFRESH_EXPIRES_IN` (default `7d`) | `JWT_REFRESH_SECRET` |

### Flow

1. **Register** (`POST /api/auth/register`) — validates with Zod, hashes password (bcrypt, 12 rounds), assigns `admin` role if the email is in `ADMIN_EMAIL`, otherwise `user`. Returns both tokens; sets refresh cookie; sends welcome email (non-blocking).
2. **Login** (`POST /api/auth/login`) — verifies credentials, updates `lastLoginAt`, returns tokens and sets the refresh cookie.
3. **Authenticated requests** — client attaches `Authorization: Bearer <accessToken>`. The server extracts and verifies the token via `getAuthenticatedUser()` in `lib/auth/middleware.ts`.
4. **Refresh** (`POST /api/auth/refresh`) — reads the `refreshToken` cookie, verifies it, and mints a new access token. The client triggers this automatically on a `401`.
5. **Logout** (`POST /api/auth/logout`) — clears the refresh cookie; client clears `localStorage`.

### Authorization (RBAC)

Roles form a hierarchy enforced by `hasRole()`:

```
user (1) < builder (2) < moderator (3) < admin (4)
```

`requireRole()` / `requireRoles` option grants access when the user's level ≥ any required role's level. Admin endpoints additionally check `role === 'admin' || role === 'moderator'` directly. Resource-level ownership checks (e.g., a user may only edit their own project unless moderator/admin) live in the **service layer**.

---

## API Structure

- **Base URL (dev):** `http://localhost:3000/api`
- **Base URL (prod):** `https://directory-server-bwfz.onrender.com/api`
- **Response envelope:**

```ts
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: { message: string; code?: string };
  meta?: { page?: number; limit?: number; total?: number };
}
```

### Endpoint Map

| Group | Method(s) | Path | Auth |
| --- | --- | --- | --- |
| Auth | POST | `/api/auth/register` | Public |
| Auth | POST | `/api/auth/login` | Public |
| Auth | POST | `/api/auth/refresh` | Cookie |
| Auth | POST | `/api/auth/logout` | Public |
| Auth | POST/PATCH | `/api/auth/update-email` | User |
| Auth | POST/PATCH | `/api/auth/update-password` | User |
| Users | GET/PATCH | `/api/users/me` | User |
| Metadata | GET | `/api/categories`, `/api/countries`, `/api/tags` | Public |
| Projects | GET | `/api/projects` | Public (lists published + approved) |
| Projects | GET/PATCH/DELETE | `/api/projects/[id]` | GET public; mutate owner/admin |
| Projects | POST | `/api/projects/submit` | User (create + optional logo upload) |
| Projects | POST | `/api/projects/[id]/submit` | Owner |
| Projects | GET | `/api/projects/my-projects` | User |
| Claims | POST | `/api/projects/[id]/claim` | User |
| Claims | GET | `/api/projects/[id]/claim/status` | User |
| Search | GET | `/api/search?q=` | Public |
| Admin | GET | `/api/admin/stats` | Admin/Mod |
| Admin | GET | `/api/admin/projects/pending` | Admin/Mod |
| Admin | POST | `/api/admin/projects/[id]/approve` \| `/reject` | Admin/Mod |
| Admin | GET/POST + `[id]` | `/api/admin/categories` | Admin/Mod |
| Admin | GET/POST + `[id]` | `/api/admin/countries` | Admin/Mod |
| Admin | GET/POST + `[id]` | `/api/admin/tags` | Admin/Mod |
| Admin | GET | `/api/admin/users` | Admin/Mod |
| Admin | PATCH | `/api/admin/users/[id]/role` | Admin |
| Admin | GET + `[id]` | `/api/admin/claims` | Admin/Mod |
| Admin | POST | `/api/admin/claims/[id]/approve` \| `/reject` | Admin/Mod |
| System | GET | `/api/health` | Public |
| System | POST | `/api/test-email` | Public (debug) |

> **Note:** `client/src/utils/api.ts#getCurrentUser` calls `/api/auth/me`, which does not exist — the real endpoint is `/api/users/me` (used elsewhere in `AuthContext`). See [Technical Debt](#known-issues--technical-debt).

---

## Database & Prisma

- **Provider:** PostgreSQL. Schema lives in `server/prisma/schema.prisma`; migrations in `server/prisma/migrations/`.
- **Client singleton:** `server/lib/db/prisma.ts` exports a globally-cached `PrismaClient` (prevents hot-reload connection storms). Services import `prisma` from `@/lib/db`.

### Core Models

| Model | Purpose | Notable fields |
| --- | --- | --- |
| `User` | Auth & ownership | `email` (unique), `passwordHash?`, `role` enum, `googleId?`, `nostrPubkey?`, `lastLoginAt` |
| `Project` | Directory listing | `slug` (unique), denormalized `countryCode/countryName`, `categories String[]`, `socialLinks Json`, acceptance flags, `published`, `status` enum, optional `userId`/`countryId`/`categoryId` |
| `Category` | Taxonomy | `name`/`slug` unique, `order` |
| `Country` | African countries | `code` (ISO-2, unique), `flag` |
| `Tag` + `ProjectTag` | Many-to-many tagging | join table with `@@unique([projectId, tagId])` |
| `Submission` | Moderation records | `status`, `moderatedBy`, `rejectionReason` |
| `Review` | Ratings (schema only) | `rating` 1–5, `@@unique([projectId, userId])` |
| `AuditLog` | Action traceability (schema only) | `action` enum, `resourceType/Id`, `details Json` |
| `ProjectClaim` | Ownership claims | `status` enum, `proofOfOwnership`, `@@unique([projectId, userId])` |

### Enums

`UserRole` = `user | builder | moderator | admin` · `SubmissionStatus` = `pending | approved | rejected | draft` · `ClaimStatus` = `pending | approved | rejected` · `AuditAction` = `create | update | delete | approve | reject | publish | unpublish`.

### Migrations

1. `20251230075648_init` — initial schema.
2. `20260105132524_add_projects_json_fields` — denormalized fields to mirror legacy `projects.json` (country code/name, categories array, social links, founder, acceptance flags).
3. `20260319045645_add_project_claims` — `ProjectClaim` model.

A `schema.backup.prisma` is also committed (stale backup — candidate for removal).

### Seeding

`prisma/seed.ts` upserts **23 categories** and the full list of **African countries** (plus a `Global/Africa Wide` entry). Run with `npm run db:seed`.

---

## Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
| --- | --- | --- |
| `DATABASE_URL` | ✅ | PostgreSQL connection string |
| `JWT_ACCESS_SECRET` | ✅ | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | ✅ | Secret for signing refresh tokens |
| `JWT_EXPIRES_IN` | – | Access token TTL (default `1d`) |
| `JWT_REFRESH_EXPIRES_IN` | – | Refresh token TTL (default `7d`) |
| `ALLOWED_ORIGIN` | ✅ | Comma-separated allowed CORS origins |
| `ADMIN_EMAIL` | – | Comma-separated emails auto-promoted to `admin` + email recipients |
| `TEAM_EMAIL` | – | Additional notification recipients |
| `GMAIL_USER` / `GMAIL_APP_PASSWORD` | – | Gmail SMTP credentials for Nodemailer |
| `FROM_EMAIL` | – | From address (defaults to `GMAIL_USER`) |
| `FRONTEND_URL` | – | Used in email links (default `http://localhost:5173`) |
| `GOOGLE_SHEETS_CREDENTIALS` | – | Service-account JSON (string) for Sheets sync |
| `GOOGLE_SHEET_ID` | – | Target spreadsheet ID |
| `RATE_LIMIT_WINDOW_MS` / `RATE_LIMIT_MAX_REQUESTS` | – | Rate-limit config (utility currently unused) |
| `NODE_ENV` | – | `development` / `production` |
| `LOG_LEVEL` | – | pino log level (default `info`) |

> ⚠️ **Security note:** `next.config.js` re-exports `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `DATABASE_URL` through the `env` block. Values placed in Next's `env` are inlined at build time and can leak into client bundles if ever imported on the client. These secrets should be removed from `env` and read directly from `process.env` server-side only.

### Client (`client/.env.production`, committed)

| Variable | Description |
| --- | --- |
| `VITE_API_URL` | Backend base URL (e.g. `https://directory-server-bwfz.onrender.com`) |
| `VITE_GA_TRACKING_ID` | Google Analytics 4 measurement ID |

> For local dev, Vite proxies `/api` → `http://localhost:3000` (see `vite.config.ts`). `AuthContext` reads `VITE_API_URL` (default `http://localhost:3000`).

---

## Local Development Setup

### Prerequisites

- Node.js ≥ 18 (server `engines`); Node 20+ recommended.
- A PostgreSQL database (local or Neon).

### 1. Backend

```bash
cd server
npm install              # postinstall runs `prisma generate`
cp .env.example .env     # if present; otherwise create .env (see table above)
npm run db:migrate       # apply migrations
npm run db:seed          # seed categories & countries
npm run dev              # → http://localhost:3000  (API under /api)
```

### 2. Frontend

```bash
cd client
npm install
npm run dev              # → http://localhost:5173  (proxies /api to :3000)
```

Open `http://localhost:5173`.

### Useful server scripts

| Script | Action |
| --- | --- |
| `npm run dev` | Next.js dev server |
| `npm run build` | `rm -rf .next && next build` |
| `npm run start` | Production server |
| `npm run db:generate` | Prisma client |
| `npm run db:migrate` / `db:push` | Migrate / push schema |
| `npm run db:studio` | Prisma Studio GUI |
| `npm run db:seed` | Seed data |
| `npm test` / `test:watch` / `test:coverage` | Jest (no tests committed yet) |

---

## Build & Deployment

Both apps are designed to deploy as **two separate Render services** (URLs referenced in code: `directory-server-bwfz.onrender.com` and `directory-client-ozjk.onrender.com`, with the custom domain `directory.bitcoiners.africa`).

### Server (Next.js)

- **Build:** `npm install` (triggers `prisma generate`) → `npm run build`.
- **Start:** `npm run start`.
- Requires all server env vars, especially `DATABASE_URL` and JWT secrets.
- Run `prisma migrate deploy` against the production DB during release.

### Client (Vite)

- **Build:** `npm run build` (`tsc -b && vite build`) → static assets in `dist/`.
- **Serve:** any static host / Render Static Site; SPA fallback to `index.html` required for client-side routing.
- Set `VITE_API_URL` and `VITE_GA_TRACKING_ID` at build time.

---

## Render Deployment Notes

- There is **no committed `render.yaml`** — services appear to be configured manually in the Render dashboard. Adding an Infrastructure-as-Code `render.yaml` is recommended for reproducibility.
- **CORS allow-list** is partially hard-coded in `lib/auth/middleware.ts` (`directory.bitcoiners.africa`, `directory-client-ozjk.onrender.com`) in addition to `ALLOWED_ORIGIN`. Update both when domains change.
- ⚠️ **Ephemeral filesystem:** `/api/projects/submit` writes uploaded logos to `public/uploads/logos/` on disk. Render's filesystem is **ephemeral** — uploaded files are lost on every redeploy/restart. Use object storage (S3/R2/Cloudinary) instead.
- ⚠️ **Cold starts:** background work uses `setImmediate` (emails, Sheets sync). On serverless/scaled-to-zero hosting these can be cut short. A health check ping or always-on instance mitigates this.
- Ensure the Gmail SMTP app password and Google service-account JSON are set as environment secrets, not committed.

---

## Folder Structure

```
directory/
├── client/                         # React 19 + Vite SPA (frontend)
│   ├── public/
│   ├── src/
│   │   ├── assets/                 # logos, icons, infographic images
│   │   ├── components/             # Navbar, ProtectedRoute, AdminLayout, maps, modals
│   │   ├── contexts/AuthContext.tsx
│   │   ├── data/                   # projects.json, coordinates.json, types
│   │   ├── pages/                  # route components (public + admin/)
│   │   ├── styles/                 # global.css, livemap.css
│   │   ├── utils/                  # api.ts, analytics.ts
│   │   ├── App.tsx                 # route definitions
│   │   └── main.tsx                # entry (Router + AuthProvider)
│   ├── index.html
│   ├── vite.config.ts              # dev proxy /api → :3000
│   └── tsconfig.json
│
└── server/                         # Next.js 15 API (backend)
    ├── app/
    │   ├── api/                     # route handlers (one folder per resource)
    │   │   ├── auth/                # register, login, logout, refresh, update-*
    │   │   ├── users/me/
    │   │   ├── projects/            # list, [id], submit, my-projects, claim
    │   │   ├── categories|countries|tags/
    │   │   ├── search/
    │   │   ├── admin/               # stats, projects, categories, countries, tags, users, claims
    │   │   ├── health/  └── test-email/
    │   ├── layout.tsx, page.tsx, error.tsx, not-found.tsx, globals.css
    │   └── ...
    ├── lib/
    │   ├── auth/                    # jwt.ts, middleware.ts, password.ts
    │   ├── db/                      # prisma.ts (singleton)
    │   ├── services/                # business logic (auth, project, claim, email, etc.)
    │   ├── validators/              # Zod schemas
    │   ├── utils/                   # api-handler, api-response, errors, logger, rate-limit
    │   └── jobs/                    # (placeholder for sync/watch jobs)
    ├── prisma/                      # schema.prisma, migrations/, seed.ts
    ├── middleware.ts                # global CORS + security headers
    ├── next.config.js
    └── tsconfig.json
```

---

## Important Services & Modules

### Server services (`lib/services/`)

| Module | Responsibility |
| --- | --- |
| `auth.service.ts` | Register/login, password hashing, token issuance, admin auto-promotion via `ADMIN_EMAIL` |
| `project.service.ts` | List/get/create/update/delete projects, slug generation, visibility rules, `transformProjectToJsonFormat` (DB → legacy JSON shape) |
| `claim.service.ts` | Submit/list/approve/reject ownership claims; **transactional** ownership transfer that rejects competing claims |
| `search.service.ts` | Case-insensitive name/description search with filters |
| `user.service.ts` | Get/update user profile |
| `category/country/tag.service.ts` | Taxonomy reads/writes |
| `email.service.ts` | Nodemailer/Gmail HTML emails (welcome, submission, approval, declined, changes-requested, admin notifications) |
| `googleSheets.ts` | Append submissions to a Google Sheet via service account (best-effort, never blocks) |

### Server utilities (`lib/utils/`)

| Module | Responsibility |
| --- | --- |
| `api-handler.ts` | Handler wrappers: auth gate, RBAC, Zod validation, error→HTTP mapping, CORS, `getRequestUser`/`getValidatedBody` helpers |
| `api-response.ts` | `successResponse` / `errorResponse` envelopes |
| `errors.ts` | `AppError` hierarchy (`Validation`, `Authentication`, `Authorization`, `NotFound`, `Conflict`) with status codes |
| `logger.ts` | pino loggers (`requestLogger`, child loggers, `logError`) |
| `rate-limit.ts` | In-memory rate limiter (**defined but not wired into any route**) |

### Frontend modules

| Module | Responsibility |
| --- | --- |
| `contexts/AuthContext.tsx` | Auth state, token storage/refresh, login/register/logout |
| `utils/api.ts` | `authenticatedFetch`, `getCurrentUser` |
| `utils/analytics.ts` | GA4 init + page-view logging |
| `components/ProtectedRoute.tsx` | Route guard for authenticated pages |
| `components/AdminLayout.tsx` | Admin shell + nested routing |
| `components/BitcoinLiveMap.tsx` / `InfographicMap.tsx` | Mapbox + infographic visualizations |

---

## Current Project Status

- **Core platform is functional and deployed** (auth, project submission, moderation, claiming, admin console, search, map, infographics).
- The backend `README` references "13/25 endpoints", but the codebase has since grown a substantial **admin** and **claims** surface — that figure is outdated.
- **OAuth (Google/Nostr)** is scaffolded in the schema and validators but **not implemented**.
- **Reviews** and **AuditLog** exist in the schema but have **no API/UI**.
- **No automated tests** are committed despite Jest being configured.
- Email + Google Sheets integrations are implemented as best-effort side effects.

---

## Known Issues & Technical Debt

> A deeper analysis lives in [`ROADMAP.md`](./ROADMAP.md). Highlights:

1. **Undeclared dependency `nanoid`** — `app/api/projects/submit/route.ts` imports `nanoid`, but it is **not in `package.json` dependencies** (only present transitively). This can break a clean production install/build.
2. **CORS wildcard with credentials** — `getCorsHeaders` falls back to `Access-Control-Allow-Origin: *` while also sending `Access-Control-Allow-Credentials: true`. This combination is invalid per spec and weakens origin control.
3. **Secrets in `next.config.js#env`** — JWT secrets and `DATABASE_URL` are exposed via the `env` block (build-time inlining risk).
4. **Insecure default secrets** — JWT secrets fall back to hard-coded development strings if env vars are missing.
5. **Inconsistent Prisma usage** — some admin routes (`admin/stats`, `admin/users`) instantiate `new PrismaClient()` per file instead of using the shared singleton, risking connection exhaustion.
6. **Inconsistent route handler style** — some routes use the `createApiHandler` wrapper (centralized auth/validation/CORS); others are raw handlers with duplicated auth/error logic. Param typing also varies (`params: { id }` vs `params: Promise<{ id }>`), which matters under Next 15.
7. **Ephemeral upload storage** — local disk uploads are lost on Render redeploys.
8. **Client/API mismatch** — `getCurrentUser` targets the non-existent `/api/auth/me`.
9. **Unused/leftover code** — `rate-limit.ts` is never applied; `winston` is installed but unused; Tailwind/`globals.css` exist in an API-only server; `schema.backup.prisma`, `dummy.txt`, and stale doc references remain.
10. **No `render.yaml`** — deployment config is not codified.

---

## Future Improvements

- Add a **`render.yaml`** (or equivalent IaC) for both services and run `prisma migrate deploy` on release.
- Move uploads to **object storage** (S3/R2/Cloudinary) and validate/resize via `sharp`.
- **Harden CORS** (strict allow-list, no wildcard-with-credentials) and remove secrets from `next.config.js#env`.
- **Standardize** all routes on `createApiHandler` and the Prisma singleton.
- **Wire up rate limiting** on auth and submission endpoints.
- Implement **Google/Nostr OAuth**, **Reviews**, and **AuditLog** features already modeled in Prisma.
- Add a **test suite** (unit tests for services/validators, integration tests for routes).
- Introduce **structured request logging** and error monitoring (e.g., Sentry).
- Add **API documentation** (OpenAPI/Swagger) generated from Zod schemas.

---

_For a comprehensive architectural deep-dive, file-by-file breakdown, and refactoring/scaling plan, see [`ROADMAP.md`](./ROADMAP.md)._
