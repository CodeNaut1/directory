# African Bitcoin Directory — Engineering Roadmap & Architecture Reference

> A comprehensive, implementation-accurate technical reference for onboarding developers and AI agents.
> This document complements [`README.md`](./README.md) with a deep, file-by-file breakdown, architectural analysis, technical-debt inventory, and a concrete improvement/scaling plan.

**Stack at a glance:** Vite + React 19 SPA (`client/`) ⇄ Next.js 15 App Router JSON API (`server/`) ⇄ Prisma 5 ⇄ PostgreSQL. Auth via `jose` JWT (access + refresh). Integrations: Nodemailer (Gmail), Google Sheets, GA4, Mapbox.

---

## Table of Contents

1. [Repository Layout (ASCII Tree)](#1-repository-layout-ascii-tree)
2. [What Each Major Folder/Module Does](#2-what-each-major-foldermodule-does)
3. [Frontend Architecture](#3-frontend-architecture)
4. [Backend Architecture](#4-backend-architecture)
5. [API Route Breakdown](#5-api-route-breakdown)
6. [Authentication & Authorization Flow](#6-authentication--authorization-flow)
7. [Database Schema & Prisma](#7-database-schema--prisma)
8. [Services Layer](#8-services-layer)
9. [Validators Layer](#9-validators-layer)
10. [Middleware](#10-middleware)
11. [Utility / Helper Breakdown](#11-utility--helper-breakdown)
12. [Deployment Infrastructure](#12-deployment-infrastructure)
13. [Current Technical Debt & Issues](#13-current-technical-debt--issues)
14. [Suggested Refactors](#14-suggested-refactors)
15. [Suggested Scalability Improvements](#15-suggested-scalability-improvements)
16. [Suggested Testing Strategy](#16-suggested-testing-strategy)
17. [Overall Architectural Assessment](#17-overall-architectural-assessment)

---

## 1. Repository Layout (ASCII Tree)

```
directory/
├── README.md                                  # Root project documentation
├── ROADMAP.md                                 # This file
│
├── client/                                    # ── FRONTEND (React 19 + Vite 7) ──
│   ├── .env.production                         # VITE_API_URL, VITE_GA_TRACKING_ID (committed)
│   ├── .gitignore
│   ├── dummy.txt                               # placeholder (debt)
│   ├── index.html                              # SPA entry; loads FontAwesome + /src/main.tsx
│   ├── package.json                            # react 19, react-router 7, mapbox-gl, jspdf
│   ├── package-lock.json
│   ├── tsconfig.json                           # strict, bundler resolution, react-jsx
│   ├── vite.config.ts                          # port 5173, proxy /api → :3000
│   ├── public/
│   │   └── favicon.png
│   └── src/
│       ├── App.tsx                             # Route table (public / protected / admin)
│       ├── main.tsx                            # Router + AuthProvider bootstrap
│       ├── assets/                             # logos, social icons, infographics (2023–2026)
│       ├── components/
│       │   ├── AdminLayout.tsx                 # Admin shell + <Outlet/>
│       │   ├── BitcoinLiveMap.tsx              # Mapbox GL map of projects
│       │   ├── ClaimProjectModal.tsx           # Ownership claim UI
│       │   ├── DuplicateCheck.tsx              # Submission de-dup helper
│       │   ├── InfographicMap.tsx              # Image-map infographic
│       │   ├── Navbar.tsx
│       │   └── ProtectedRoute.tsx              # Auth guard
│       ├── contexts/
│       │   └── AuthContext.tsx                 # JWT state, refresh, login/register/logout
│       ├── data/
│       │   ├── coordinates.json                # Map + infographic coordinates
│       │   ├── projects.json                   # Legacy/seed project dataset
│       │   └── projects.types.ts               # Rich TS types (Project, Coordinates, legacy)
│       ├── pages/
│       │   ├── Home.tsx, HowItWorks.tsx
│       │   ├── Login.tsx, Register.tsx
│       │   ├── Dashboard.tsx                    # User's projects + status
│       │   ├── CreateProject.tsx, EditProject.tsx, SubmitSuccess.tsx
│       │   ├── ViewProject.tsx
│       │   ├── CountryProjects.tsx, CategoryProjects.tsx
│       │   ├── SearchResults.tsx
│       │   ├── LiveMap.tsx
│       │   ├── Infographic.tsx, InfographicArchive.tsx
│       │   ├── NotFound.tsx
│       │   └── admin/
│       │       ├── AdminDashboard.tsx          # stats
│       │       ├── PendingProjects.tsx, AllProjects.tsx
│       │       ├── Claims.tsx
│       │       ├── Categories.tsx, Tags.tsx, Countries.tsx
│       │       ├── Users.tsx, Settings.tsx
│       ├── styles/ (global.css, livemap.css)
│       └── utils/ (api.ts, analytics.ts)
│
└── server/                                    # ── BACKEND (Next.js 15 App Router) ──
    ├── .eslintrc.json                          # extends next/core-web-vitals
    ├── .gitignore
    ├── README.md                               # Backend API docs (partly outdated)
    ├── middleware.ts                           # Global CORS + security headers
    ├── next.config.js                          # env passthrough (⚠ secrets), webpack @ alias
    ├── next-env.d.ts
    ├── postcss.config.js, tailwind.config.ts   # Tailwind (mostly unused in API)
    ├── jest.config.js, jest.setup.js           # Jest config (no tests committed)
    ├── package.json                            # next 15, prisma, jose, zod, nodemailer...
    ├── package-lock.json
    ├── tsconfig.json                           # paths @/*, @/lib/*, @/app/*
    ├── test-api.sh, test-api.http, test-api-ts.ts   # manual API smoke tests
    ├── app/
    │   ├── layout.tsx, page.tsx                 # minimal landing ("Backend API Server")
    │   ├── error.tsx, not-found.tsx, globals.css
    │   └── api/
    │       ├── auth/
    │       │   ├── login/route.ts
    │       │   ├── logout/route.ts
    │       │   ├── refresh/route.ts
    │       │   ├── register/route.ts
    │       │   ├── update-email/route.ts
    │       │   └── update-password/route.ts
    │       ├── users/me/route.ts
    │       ├── categories/route.ts
    │       ├── countries/route.ts
    │       ├── tags/route.ts
    │       ├── projects/
    │       │   ├── route.ts                     # GET list
    │       │   ├── submit/route.ts              # POST create (+ logo upload)
    │       │   ├── my-projects/route.ts
    │       │   └── [id]/
    │       │       ├── route.ts                 # GET/PATCH/DELETE
    │       │       ├── submit/route.ts          # POST submit-for-review
    │       │       └── claim/
    │       │           ├── route.ts             # POST claim
    │       │           └── status/route.ts      # GET claim status
    │       ├── search/route.ts
    │       ├── health/route.ts
    │       ├── test-email/route.ts
    │       └── admin/
    │           ├── stats/route.ts
    │           ├── projects/
    │           │   ├── pending/route.ts
    │           │   └── [id]/{approve,reject}/route.ts
    │           ├── categories/{route.ts,[id]/route.ts}
    │           ├── countries/{route.ts,[id]/route.ts}
    │           ├── tags/{route.ts,[id]/route.ts}
    │           ├── users/{route.ts,[id]/role/route.ts}
    │           └── claims/
    │               ├── route.ts
    │               └── [id]/{route.ts,approve/route.ts,reject/route.ts}
    ├── lib/
    │   ├── analytics.ts                         # GA4 helper (note: uses NEXT_PUBLIC_*)
    │   ├── auth/
    │   │   ├── index.ts                         # barrel
    │   │   ├── jwt.ts                           # sign/verify access & refresh (jose)
    │   │   ├── middleware.ts                    # getAuthenticatedUser, hasRole, CORS, verifyAuth
    │   │   └── password.ts                      # bcrypt hash/verify
    │   ├── db/
    │   │   ├── index.ts                         # barrel
    │   │   └── prisma.ts                        # PrismaClient singleton
    │   ├── jobs/.gitkeep                        # placeholder (sync/watch referenced in scripts)
    │   ├── services/
    │   │   ├── index.ts                         # barrel (partial)
    │   │   ├── auth.service.ts
    │   │   ├── project.service.ts
    │   │   ├── claim.service.ts
    │   │   ├── search.service.ts
    │   │   ├── user.service.ts
    │   │   ├── category.service.ts
    │   │   ├── country.service.ts
    │   │   ├── tag.service.ts
    │   │   ├── email.service.ts                 # Nodemailer templates
    │   │   └── googleSheets.ts                  # Sheets append
    │   ├── utils/
    │   │   ├── api-handler.ts                   # createApiHandler & helpers
    │   │   ├── api-response.ts                  # success/error envelopes
    │   │   ├── errors.ts                        # AppError hierarchy
    │   │   ├── logger.ts                        # pino loggers
    │   │   └── rate-limit.ts                    # in-memory limiter (unused)
    │   └── validators/
    │       ├── index.ts                         # barrel
    │       ├── auth.ts, user.ts, project.ts
    │       ├── query.ts, review.ts, admin.ts
    │       ├── analytics.ts, claim.ts
    └── prisma/
        ├── schema.prisma                        # source of truth
        ├── schema.backup.prisma                 # stale backup (debt)
        ├── seed.ts                              # 23 categories + African countries
        └── migrations/
            ├── 20251230075648_init/
            ├── 20260105132524_add_projects_json_fields/
            ├── 20260319045645_add_project_claims/
            └── migration_lock.toml
```

---

## 2. What Each Major Folder/Module Does

| Path | Responsibility |
| --- | --- |
| `client/src/pages/` | One component per route; data fetching via `fetch`/`authenticatedFetch` against `VITE_API_URL` |
| `client/src/components/` | Reusable UI: nav, route guard, admin shell, map widgets, modals |
| `client/src/contexts/` | Global auth state and token lifecycle |
| `client/src/data/` | Static/legacy datasets and authoritative TypeScript types |
| `client/src/utils/` | Thin helpers for fetch + analytics |
| `server/app/api/` | HTTP entrypoints (route handlers) — thin, delegate to services |
| `server/lib/services/` | **All business logic and the only layer that touches Prisma** (mostly) |
| `server/lib/validators/` | Zod schemas + inferred TS types shared by routes and services |
| `server/lib/auth/` | JWT signing/verification, password hashing, request auth + RBAC + CORS helpers |
| `server/lib/utils/` | Cross-cutting concerns: handler wrapper, responses, errors, logging, rate-limit |
| `server/lib/db/` | Prisma client singleton |
| `server/prisma/` | Schema, migrations, seed |

---

## 3. Frontend Architecture

### Bootstrapping

`main.tsx` → renders `<BrowserRouter><AuthProvider><App/></AuthProvider></BrowserRouter>`. `App.tsx` initializes GA4 (`initGA`) on mount and logs a page view on every route change.

### Routing model (`App.tsx`)

- **Public:** `/`, `/home`, `/how-it-works`, `/login`, `/register`, `/infographic-q1-2026`, `/infographic-q2-2026`, `/infographic-archive`, `/live-map`, `/search`, `/project/:id`, `/country/:countryCode`, `/category/:categorySlug`.
- **Protected (wrapped in `ProtectedRoute`):** `/dashboard`, `/create-project`, `/project-submitted`, `/edit-project/:id`.
- **Admin (nested under `AdminLayout` at `/admin`):** index dashboard, `projects/pending`, `projects`, `claims`, `categories`, `tags`, `countries`, `users`, `settings`.

> ⚠️ The wildcard `<Route path="*" element={<NotFound/>}>` is declared **before** the `/admin` route block. With React Router v7's ranked matching this is usually tolerated, but ordering a catch-all before sibling routes is fragile and should be moved to the end.

### State & auth (`AuthContext.tsx`)

- API base: `import.meta.env.VITE_API_URL || 'http://localhost:3000'`.
- Access token persisted in `localStorage` (`access_token`); refresh token is an **HTTP-only cookie** managed by the server.
- On mount, `checkAuth()` calls `GET /api/users/me`; on `401`, it calls `POST /api/auth/refresh` (cookie-based) and retries once.
- Exposes `{ user, isLoggedIn, isLoading, login, logout, register }`.
- `isLoggedIn` is derived from the presence of an access token (not from a verified session) — a deliberate UX simplification.

### Data fetching

- `utils/api.ts#authenticatedFetch` injects `Authorization: Bearer` and `credentials: 'include'`.
- ⚠️ `utils/api.ts#getCurrentUser` requests `/api/auth/me` (**non-existent**); the correct route is `/api/users/me`.

### Visualization

- **Mapbox GL** (`BitcoinLiveMap.tsx`, `LiveMap.tsx`) renders project locations from `coordinates.json`.
- **Infographics** (`Infographic.tsx`, `InfographicMap.tsx`, `InfographicArchive.tsx`) use bundled quarterly images + image-map coordinates.

---

## 4. Backend Architecture

### Request lifecycle

```
1. middleware.ts            → handles OPTIONS preflight; injects CORS + security headers on every response
2. app/api/**/route.ts      → exported GET/POST/PATCH/DELETE
3a. (preferred) createApiHandler(options)
        ├─ OPTIONS short-circuit + CORS
        ├─ requireAuth → getAuthenticatedUser(req) → attaches (req).user
        ├─ requireRoles → hasRole() check
        ├─ validateQuery / validateBody (Zod) → attaches (req).parsedBody
        ├─ handler(req, ctx)
        └─ catch → ZodError / AppError / unknown → standardized errorResponse + status
3b. (legacy) raw handler with manual try/catch + inline auth checks
4. lib/services/*           → business logic + Prisma
5. JSON envelope { success, data?, error?, meta? }
```

### Two coexisting handler styles

| Style | Where | Characteristics |
| --- | --- | --- |
| **Wrapped** (`createApiHandler` family) | `auth/*`, `projects/route.ts`, `projects/[id]`, `projects/[id]/submit`, `claim/*`, `search`, `health`, public metadata | Centralized auth, RBAC, validation, error mapping, CORS |
| **Raw** (`export async function`) | `projects/submit`, most of `admin/*` (`stats`, `users`, `projects/[id]/approve` …) | Inline `getAuthenticatedUser`/`verifyAuth`, manual role checks, ad-hoc error shapes |

This duplication is the single biggest source of inconsistency (error formats, param typing, Prisma instantiation). See [Refactors](#14-suggested-refactors).

### Module resolution

`tsconfig.json` maps `@/* → ./*`, plus `@/lib/*` and `@/app/*`. `next.config.js` adds a webpack `@` alias for server bundles. Services consistently import via `@/lib/...`.

---

## 5. API Route Breakdown

Legend — **Auth**: `Public` | `User` (any authenticated) | `Owner` | `Admin/Mod`.

### Auth (`app/api/auth/`)

| Method | Path | Handler style | Notes |
| --- | --- | --- | --- |
| POST | `/auth/register` | wrapped | Zod `registerSchema`; bcrypt; admin auto-promote; sets refresh cookie; welcome email via `setImmediate` |
| POST | `/auth/login` | wrapped | Verifies password; updates `lastLoginAt`; sets refresh cookie |
| POST | `/auth/refresh` | wrapped | Reads `refreshToken` cookie; mints new access token |
| POST | `/auth/logout` | wrapped | Deletes refresh cookie |
| POST/PATCH | `/auth/update-email` | — | Authenticated email change |
| POST/PATCH | `/auth/update-password` | — | Authenticated password change |

### Users / Metadata

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET/PATCH | `/users/me` | User | Profile read/update (`user.service`) |
| GET | `/categories`, `/countries`, `/tags` | Public | Taxonomy reads |

### Projects (`app/api/projects/`)

| Method | Path | Auth | Service | Notes |
| --- | --- | --- | --- | --- |
| GET | `/projects` | Public | `listProjects` | Only `published && status=approved`; filters: `category`, `country`, `tag`, `search`, `featured`, `sort`; paginated |
| GET | `/projects/[id]` | Public(+) | `getProjectById` | Owner/admin can view unpublished; else "under review" error |
| PATCH | `/projects/[id]` | Owner/Admin | `updateProject` | Re-slugs on rename; ownership enforced |
| DELETE | `/projects/[id]` | Owner/Admin | `deleteProject` | |
| POST | `/projects/submit` | User | `createProject` | **Raw handler**; supports multipart logo upload to disk; fires Sheets + emails via `setImmediate` |
| POST | `/projects/[id]/submit` | Owner | `submitProjectForReview` | Creates a `Submission` row |
| GET | `/projects/my-projects` | User | `getUserProjects` | Caller's projects |

### Claims (`app/api/projects/[id]/claim/`, `app/api/admin/claims/`)

| Method | Path | Auth | Service | Notes |
| --- | --- | --- | --- | --- |
| POST | `/projects/[id]/claim` | User | `submitClaim` | Only unowned, published+approved projects; one active claim per user |
| GET | `/projects/[id]/claim/status` | User | `getClaimStatus` | |
| GET | `/admin/claims` & `/admin/claims/[id]` | Admin/Mod | `listClaims`/`getClaimById` | |
| POST | `/admin/claims/[id]/approve` | Admin/Mod | `approveClaim` | **Transactional**: transfers ownership + auto-rejects competing claims |
| POST | `/admin/claims/[id]/reject` | Admin/Mod | `rejectClaim` | Requires reason ≥10 chars |

### Search / System

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/search?q=` | Public | `searchProjects`; name/description `contains` (insensitive) + filters |
| GET | `/health` | Public | status/timestamp/uptime |
| POST | `/test-email` | Public | Debug email trigger (should be gated/removed in prod) |

### Admin (`app/api/admin/`)

| Method | Path | Auth | Notes |
| --- | --- | --- | --- |
| GET | `/admin/stats` | Admin/Mod | Parallel counts (projects, published, pending, users, weekly, taxonomy). **Uses a per-file `new PrismaClient()`** |
| GET | `/admin/projects/pending` | Admin/Mod | Moderation queue |
| POST | `/admin/projects/[id]/approve` | Admin/Mod | Sets `published=true,status=approved,publishedAt`. **Raw handler** |
| POST | `/admin/projects/[id]/reject` | Admin/Mod | Sets rejected status |
| GET/POST + `[id]` | `/admin/categories`,`/countries`,`/tags` | Admin/Mod | Taxonomy CRUD |
| GET | `/admin/users` | Admin/Mod | Lists users. **Per-file Prisma client** |
| PATCH | `/admin/users/[id]/role` | Admin | Role changes |

---

## 6. Authentication & Authorization Flow

### Tokens

| | Access | Refresh |
| --- | --- | --- |
| Library | `jose` SignJWT / jwtVerify | same |
| Algorithm | HS256 | HS256 |
| Secret | `JWT_ACCESS_SECRET` | `JWT_REFRESH_SECRET` |
| TTL | `JWT_EXPIRES_IN` (default `1d`) | `JWT_REFRESH_EXPIRES_IN` (default `7d`) |
| Transport | `Authorization: Bearer` header | HTTP-only cookie `refreshToken` |
| Payload | `{ sub, email, role, name? }` | same |

### Verification (`lib/auth/middleware.ts`)

- `getAuthenticatedUser(req)` parses the `Bearer` header, verifies signature/claims, returns `{ id, email, role, name? }`, else throws `AuthenticationError` (401).
- `verifyAuth(req)` is a non-throwing variant returning `{ authenticated, user }` (used by raw admin handlers).

### RBAC

```ts
roleHierarchy = { user: 1, builder: 2, moderator: 3, admin: 4 }
hasRole(user, required[]) = required.some(r => roleHierarchy[r] <= roleHierarchy[user.role])
```

- Route-level: `requireRoles` option in the wrapper, or inline `role === 'admin' | 'moderator'` checks in raw handlers.
- Resource-level: services enforce ownership (e.g., `updateProject`/`deleteProject` reject non-owner non-admin with `AuthorizationError`).

### Admin bootstrap

On registration, if the email is listed in `ADMIN_EMAIL` (comma-separated), the user is created with `role: 'admin'`. There is no in-app "promote first admin" flow beyond this env-based mechanism + the `/admin/users/[id]/role` endpoint.

---

## 7. Database Schema & Prisma

**Provider:** PostgreSQL · **Client:** singleton in `lib/db/prisma.ts` (dev logs queries; prod logs errors only).

### Entity-relationship summary

```
User 1──* Project          (Project.userId, optional, onDelete: SetNull)
User 1──* Submission        (onDelete: Cascade)
User 1──* Review            (onDelete: Cascade)
User 1──* ProjectClaim      (onDelete: Cascade)
User 1──* AuditLog          (onDelete: Restrict)

Category 1──* Project       (optional, SetNull)
Country  1──* Project        (optional, SetNull)

Project *──* Tag via ProjectTag (join, both Cascade)
Project 1──* Submission | Review | ProjectClaim
```

### Model notes

- **`User`** — `passwordHash` is nullable (supports future OAuth-only accounts). `googleId`/`nostrPubkey` unique, reserved for OAuth (unimplemented). Indexed on `email`, `role`.
- **`Project`** — heavily **denormalized** for the legacy `projects.json` shape: `countryCode`, `countryName`, `categories String[]`, `socialLinks Json`, founder fields, acceptance booleans, `foundedYear`. Relations (`countryId`, `categoryId`, `userId`) are **all optional** to support bulk import and claiming. Dual-source fields (`countryCode` vs `country.code`, `categories[]` vs `category.name`) are reconciled at read time by `transformProjectToJsonFormat`. Composite index on `[published, featured, createdAt desc]` optimizes the public list.
- **`Submission`** — moderation record separate from the project's own `status` field (so a project carries `status` *and* may have Submission rows).
- **`Review`, `AuditLog`** — fully modeled but **no API/UI** yet.
- **`ProjectClaim`** — `@@unique([projectId, userId])`; approval is transactional.

### Output transformer

`transformProjectToJsonFormat(project)` (in `project.service.ts`, duplicated in `search.service.ts`) maps DB rows to the snake_case shape the frontend expects (`country_code`, `bitcoin_acceptance`, `social`, `founder`, etc.) — bridging the new schema with the legacy `projects.json` contract.

### Migrations

| Order | Migration | Adds |
| --- | --- | --- |
| 1 | `20251230075648_init` | Base models, enums, indexes |
| 2 | `20260105132524_add_projects_json_fields` | Denormalized JSON-compat fields |
| 3 | `20260319045645_add_project_claims` | `ProjectClaim` + relation |

`schema.backup.prisma` is a stale duplicate and should be removed.

---

## 8. Services Layer

All under `lib/services/`. Services own business rules; routes stay thin.

| Service | Key exports | Highlights / gotchas |
| --- | --- | --- |
| `auth.service.ts` | `registerUser`, `loginUser` | bcrypt(12); admin auto-promotion; `lastLoginAt` update is best-effort (`.catch` swallow) |
| `project.service.ts` | `listProjects`, `getProjectById`, `getUserProjects`, `createProject`, `updateProject`, `deleteProject`, `submitProjectForReview` | Slug uniqueness loop; visibility rules; **local `transformProjectToJsonFormat`** |
| `claim.service.ts` | `submitClaim`, `getClaimStatus`, `listClaims`, `approveClaim`, `rejectClaim`, `getClaimById` | `approveClaim` uses `prisma.$transaction` to transfer ownership and reject rival claims atomically |
| `search.service.ts` | `searchProjects` | Duplicate transformer; `contains` search (no FTS index) |
| `user.service.ts` | `getUserById`, `updateUser` | Profile reads/updates |
| `category/country/tag.service.ts` | CRUD reads/writes | Backing public metadata + admin CRUD |
| `email.service.ts` | `sendWelcomeEmail`, `sendProjectSubmissionConfirmation`, `sendAdminNotification`, `sendProjectApprovalEmail`, `sendProjectDeclinedEmail`, `sendChangesRequestedEmail`, `verifyEmailConnection` | Nodemailer/Gmail; inlined HTML templates; all wrapped in try/catch and **never throw** (non-blocking). Recipients from `ADMIN_EMAIL` + `TEAM_EMAIL` |
| `googleSheets.ts` | `appendToSheet` | Service-account auth from `GOOGLE_SHEETS_CREDENTIALS`; appends to `Live Directory Entries!A:T`; best-effort |

> **Barrel gap:** `services/index.ts` re-exports auth/user/category/country/tag/project/search but **omits** `claim.service`, `email.service`, and `googleSheets`. Routes import those directly, so it works, but the barrel is inconsistent.

---

## 9. Validators Layer

Zod schemas in `lib/validators/`, surfaced via `index.ts` barrel. Each schema also exports an inferred TS type used across routes/services.

| File | Schemas |
| --- | --- |
| `auth.ts` | `registerSchema` (email; password ≥8 with upper/lower/number; optional name), `loginSchema`, `googleAuthSchema`, `nostrAuthSchema` (OAuth — unused) |
| `user.ts` | `updateUserSchema` (`name`, `avatar`) |
| `project.ts` | `createProjectSchema` (required `name`, `description`, `countryId` [allows `"global"`], `categoryId`; rich optional `details` object: social links, contact, founder, bitcoin acceptance, metadata), `updateProjectSchema` (`.partial()`), `submitProjectSchema` |
| `query.ts` | `paginationSchema`, `projectListQuerySchema` (filters + `sort` enum), `searchQuerySchema` (`q` required), `reviewListQuerySchema`, `submissionListQuerySchema` |
| `claim.ts` | `submitClaimSchema`, `approveClaimSchema`, `rejectClaimSchema` (reason ≥10), `claimListQuerySchema` |
| `review.ts`, `admin.ts`, `analytics.ts` | Schemas for not-yet-exposed features |

> **Mismatch to note:** `createProjectSchema` nests most fields under `details` (e.g. `details.socialLinks`, `details.founderName`), but `createProject` in `project.service.ts` reads top-level fields (`input.website`, `input.city`, …) and does **not** persist most `details.*` fields to the DB. The `details` payload is, however, forwarded to Google Sheets in the submit route. This means a lot of submitted detail (initiatives/impact/challenges/social/founder) is **synced to Sheets but not stored in Postgres** via `createProject`.

---

## 10. Middleware

`server/middleware.ts` (Next.js Edge middleware) runs on every non-static path (`matcher` excludes `_next/static`, `_next/image`, `favicon.ico`):

- **OPTIONS preflight** → returns 200 with CORS headers from `getCorsHeaders(origin)`.
- **All responses** → injects CORS headers + security headers: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 1; mode=block`.

`getCorsHeaders` (in `lib/auth/middleware.ts`) builds the allow-list from `ALLOWED_ORIGIN` plus hard-coded production origins (`directory.bitcoiners.africa`, `directory-client-ozjk.onrender.com`).

> ⚠️ **CORS defect:** when the origin is not allow-listed, it still sets `Access-Control-Allow-Origin: origin || '*'` **together with** `Access-Control-Allow-Credentials: true`. The wildcard + credentials combination is rejected by browsers and effectively disables strict origin control. The handler-level `addCorsHeaders` (in `api-handler.ts`) duplicates this logic, so CORS is applied twice (middleware + wrapper).

---

## 11. Utility / Helper Breakdown

| File | Exports | Role |
| --- | --- | --- |
| `utils/api-handler.ts` | `createApiHandler`, `createGetHandler`, `createPostHandler`, `createPatchHandler`, `createDeleteHandler`, `getValidatedBody`, `getRequestUser` | The backbone wrapper: OPTIONS handling, auth, RBAC, Zod query/body validation, error→HTTP mapping, CORS |
| `utils/api-response.ts` | `successResponse`, `errorResponse`, `ApiResponse<T>` | Standard JSON envelope |
| `utils/errors.ts` | `AppError`, `ValidationError(400)`, `AuthenticationError(401)`, `AuthorizationError(403)`, `NotFoundError(404)`, `ConflictError(409)` | Typed errors with status + code |
| `utils/logger.ts` | `requestLogger`, `createLogger`, `systemLogger`, `errorLogger`, `logRequest`, `logError` | pino logging (pino-pretty transport removed to avoid Next worker crashes). Note: `logRequest` call is commented out in the wrapper |
| `utils/rate-limit.ts` | `checkRateLimit`, `createRateLimit`, `authRateLimit`, `submissionRateLimit` | In-memory limiter — **defined but never invoked anywhere** |
| `lib/analytics.ts` | `initGA`, `logPageView` | GA4 helper (server-side copy; uses `NEXT_PUBLIC_GA_TRACKING_ID`) |

---

## 12. Deployment Infrastructure

### Topology

Two independently deployed Render services:

| Service | Build | Start/Serve | Env |
| --- | --- | --- | --- |
| **Server** (`directory-server-bwfz.onrender.com`) | `npm install` (`postinstall: prisma generate`) → `npm run build` | `npm run start` | `DATABASE_URL`, JWT secrets, `ALLOWED_ORIGIN`, Gmail, Google Sheets, `ADMIN_EMAIL`/`TEAM_EMAIL` |
| **Client** (`directory-client-ozjk.onrender.com`, custom domain `directory.bitcoiners.africa`) | `npm run build` (`tsc -b && vite build`) | static `dist/` with SPA fallback | `VITE_API_URL`, `VITE_GA_TRACKING_ID` |

### Configuration facts & risks

- **No `render.yaml`** committed → deployment is dashboard-managed (not reproducible).
- **Migrations** must be applied out-of-band (`prisma migrate deploy`); the build script does not run them.
- **Ephemeral disk** — logo uploads in `public/uploads/logos/` do not survive restarts/redeploys on Render.
- **Background side effects** (`setImmediate` for emails/Sheets) can be terminated early on serverless/scale-to-zero plans.
- **CORS allow-list** is split between `ALLOWED_ORIGIN` and hard-coded origins; both must be kept in sync.
- **Startup logging** prints JWT TTL config to stdout (`jwt.ts`) — noisy; remove in prod.

---

## 13. Current Technical Debt & Issues

### High severity

1. **Undeclared `nanoid` dependency** — imported in `projects/submit/route.ts` but absent from `package.json` (only transitive). A clean install/build may fail or resolve a mismatched version. **Fix:** add `nanoid` to dependencies (or use `crypto.randomUUID()`).
2. **CORS wildcard + credentials** — invalid/insecure header combination in `getCorsHeaders`. **Fix:** never emit `*` with credentials; deny disallowed origins.
3. **Secrets exposed via `next.config.js#env`** — `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL` inlined at build. **Fix:** remove from `env`, read from `process.env` server-side only.
4. **Insecure default JWT secrets** — fallback strings if env missing. **Fix:** fail fast if secrets are unset in production.
5. **Ephemeral upload storage** — local-disk logos lost on redeploy. **Fix:** object storage.

### Medium severity

6. **Per-file `new PrismaClient()`** in `admin/stats` and `admin/users` (and `admin/projects/[id]/approve` uses the singleton, inconsistently) → risk of connection exhaustion. **Fix:** always import the singleton.
7. **Two handler paradigms** (wrapped vs raw) → inconsistent error shapes (`error` is sometimes a string, sometimes `{ message }`), inconsistent auth, duplicated CORS. **Fix:** standardize on `createApiHandler`.
8. **Next 15 params typing inconsistency** — some routes type `params: { id }` (sync) while others use `params: Promise<{ id }>` and `await`. Under Next 15 dynamic params are async; the sync ones may warn/break. **Fix:** make all dynamic routes await params.
9. **Validator/persistence mismatch** — `createProjectSchema.details.*` fields are largely not persisted by `createProject` (only forwarded to Sheets). **Fix:** persist `details` to the (already-existing) Project columns, or trim the schema.
10. **Client → non-existent endpoint** — `getCurrentUser` calls `/api/auth/me`. **Fix:** point to `/api/users/me`.

### Low severity / cleanup

11. **Dead code:** `rate-limit.ts` unused; `winston` installed but unused; Tailwind/`globals.css`/`page.tsx` largely vestigial in an API-only server.
12. **Duplicate transformer** `transformProjectToJsonFormat` in two services. **Fix:** extract to a shared mapper.
13. **Stale artifacts:** `schema.backup.prisma`, `client/dummy.txt`, server README references to non-existent docs (`IMPLEMENTATION_STATUS.md`, `PHASE1_STATUS.md`, `VERIFY_SETUP.md`), outdated "13/25 endpoints" claim.
14. **Debug endpoint** `/api/test-email` is public.
15. **Committed `client/.env.production`** (only public values today, but a risky pattern).
16. **No tests** despite Jest config and `test-api.*` smoke scripts.
17. **React version skew** — client React 19, server has React 18 types (harmless, but worth noting).
18. **Barrel inconsistency** in `services/index.ts` (missing claim/email/sheets exports).

---

## 14. Suggested Refactors

1. **Unify the HTTP layer.** Migrate every route to `createApiHandler`/`createPostHandler`. Delete inline auth/role/error code from raw handlers. This removes the dual error-shape problem and double CORS application.
2. **Single Prisma import everywhere.** Replace all `new PrismaClient()` with `import { prisma } from '@/lib/db'`.
3. **Extract a shared `projectMapper.ts`** for `transformProjectToJsonFormat` (used by project + search services).
4. **Centralize CORS** in middleware only; drop `addCorsHeaders` duplication in the wrapper (or vice versa) — apply once.
5. **Config module** (`lib/config.ts`) that reads + validates env with Zod at boot, throwing on missing secrets in production. Remove secret passthrough from `next.config.js`.
6. **Align validation with persistence.** Either persist `details.*` to the Project model in `createProject`, or restructure `createProjectSchema` to match what is stored.
7. **Promote `Submission` as the moderation source of truth** (currently project `status` and `Submission.status` can diverge). Define one canonical state machine.
8. **Storage adapter** for uploads (`lib/storage/`) with an S3/R2/Cloudinary driver; validate + resize via `sharp`.
9. **Type the `(req as any).user`/`parsedBody`** by extending the request type, removing `any` casts in `api-handler.ts`.
10. **Remove dead code** (rate-limit if not adopted, winston, backups, dummy files) and refresh both READMEs.

---

## 15. Suggested Scalability Improvements

- **Database**
  - Add **Postgres full-text search** (`tsvector` + GIN index) or Prisma full-text search instead of `contains` scans for `/search` and list `search`.
  - Use **cursor-based pagination** for large lists (current offset pagination degrades at high `page`).
  - Add **connection pooling** (PgBouncer / Neon pooled URL / Prisma Accelerate) for serverless concurrency.
- **Caching**
  - Cache public, slow-changing reads (`/categories`, `/countries`, `/tags`, featured lists) with HTTP cache headers / `revalidate` / Redis.
- **Background work**
  - Replace `setImmediate` side-effects with a **durable queue** (e.g., BullMQ/Redis, or Render Cron + a jobs table) so emails/Sheets survive process exits. The `lib/jobs/` folder and `sync`/`watch` scripts already anticipate this.
- **Rate limiting** — adopt a **distributed limiter** (Redis/Upstash) and wire `authRateLimit`/`submissionRateLimit` into the wrapper.
- **Media** — serve uploads from object storage + CDN; generate responsive/optimized variants with `sharp`.
- **Observability** — structured request logging (re-enable `logRequest`), error tracking (Sentry), and uptime/health monitoring.
- **IaC** — commit a `render.yaml` and run `prisma migrate deploy` as a release step.

---

## 16. Suggested Testing Strategy

Jest + ts-jest + Testing Library are configured (`jest.config.js`, `@/` mapping) but **no tests exist**. Recommended pyramid:

| Layer | Scope | Tooling |
| --- | --- | --- |
| **Unit** | Validators (Zod happy/sad paths), `hasRole`, password hash/verify, JWT sign/verify, `transformProjectToJsonFormat`, slug uniqueness | Jest (pure functions) |
| **Service** | `project.service`, `claim.service` (esp. `approveClaim` transaction + rival-claim rejection), `auth.service` | Jest + test DB (Docker Postgres) or `prisma` mock |
| **Route/integration** | Each `route.ts` via `next/server` Request mocks: auth gates, RBAC (403), validation (400), success envelopes | Jest + `node-mocks`/Request |
| **E2E** | Critical flows: register → submit → admin approve → public visibility; claim → approve → ownership transfer | Playwright against client+server |
| **Contract** | Snapshot the JSON envelope shapes the client depends on | Jest snapshots |

Priorities: (1) auth + RBAC, (2) claim approval transaction, (3) project visibility rules, (4) validator coverage. Add CI (GitHub Actions) running `npm run build`, `npm test`, and `prisma validate` on PRs.

---

## 17. Overall Architectural Assessment

**Strengths**

- **Clean layering** (routes → validators → services → Prisma) with a thoughtful `createApiHandler` wrapper that, where used, gives consistent auth, validation, and error handling.
- **Sensible auth model**: short-lived access token + HTTP-only refresh cookie, with automatic client-side refresh and a clear role hierarchy.
- **Pragmatic data model**: denormalized Project fields enable a smooth migration from a static `projects.json` to a real database while keeping the frontend contract stable.
- **Real product surface**: submission, moderation, claiming (with a correct atomic ownership transfer), admin console, search, map, and infographics are all present.
- **Best-effort integrations** (email, Sheets) are correctly non-blocking and never fail the primary request.

**Weaknesses / risks**

- **Consistency debt**: two handler styles, two Prisma instantiation patterns, two CORS applications, and Next 15 param-typing drift make behavior uneven and raise the maintenance cost.
- **Security sharp edges**: wildcard-with-credentials CORS, secrets in `next.config.js#env`, default JWT secrets, and a public debug email route.
- **Operational fragility**: ephemeral upload storage, `setImmediate` background work on potentially scale-to-zero hosting, no IaC, manual migrations.
- **Coverage gap**: zero automated tests for a system with non-trivial auth and transactional logic.
- **Spec drift**: validator `details` payload is mostly not persisted; outdated/missing docs.

**Verdict**

The platform is a **functional, well-structured MVP that is already in production**. The architecture is fundamentally sound and extensible; most issues are **consistency, security-hardening, and operational** rather than design flaws. Prioritized next steps: (1) fix the `nanoid` dependency and CORS/secret issues, (2) standardize handlers + Prisma usage, (3) move uploads + background jobs to durable infrastructure, and (4) establish a test suite and CI. Addressing these converts a solid MVP into a maintainable, scalable production service.

---

_Last generated from a full source inspection of `client/` and `server/`. When implementation changes, regenerate the affected sections (especially the API table in §5, the schema in §7, and the debt list in §13)._
