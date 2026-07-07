# African Bitcoin Directory - Comprehensive Development Roadmap

> **Last Updated:** July 2026  
> **Target Audience:** Coding agents (Cursor, Claude Code, Codex), developers integrating new features, and maintainers  
> **Purpose:** Single source of truth for project architecture, current state, known issues, and development workflow

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture & Tech Stack](#2-architecture--tech-stack)
3. [Data Model & Database](#3-data-model--database)
4. [API Design & Endpoints](#4-api-design--endpoints)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Authentication & Authorization](#7-authentication--authorization)
8. [Project Workflow (User → Admin → Live)](#8-project-workflow-user--admin--live)
9. [Known Issues & Technical Debt](#9-known-issues--technical-debt)
10. [Testing & QA](#10-testing--qa)
11. [Deployment Pipeline](#11-deployment-pipeline)
12. [Development Workflow for Agents](#12-development-workflow-for-agents)
13. [Future Features & Roadmap](#13-future-features--roadmap)
14. [Quick Reference: File Structure](#14-quick-reference-file-structure)
15. [Common Tasks for Agents](#15-common-tasks-for-agents)

---

# 1. Project Overview

## 1.1 What is the African Bitcoin Directory?

The **African Bitcoin Directory** is a **public, curated platform** that maps and showcases the Bitcoin ecosystem across Africa. It serves three audiences:

- **Builders & Projects** → Submit their Bitcoin business/initiative for discovery
- **Explorers & Researchers** → Find Bitcoin projects by location, category, or search
- **Admins & Moderators** → Manage submissions, approve listings, and maintain quality

## 1.2 Key Features

| Feature | Status | Description |
|---------|--------|-------------|
| **Public Directory** | ✅ Live | Browse, filter (country/category/tag), and search projects |
| **User Submission** | ✅ Live | Register, submit project, track approval status |
| **Admin Moderation** | ✅ Live | Approve/reject/request-changes on pending submissions |
| **Project Claiming** | ✅ Live | Users claim ownership of unowned listings in directory |
| **Interactive Map** | ✅ Live | Mapbox GL visualization with 300+ projects |
| **Infographics** | ✅ Live | Quarterly snapshots (2023–2026) showing ecosystem growth |
| **Email Notifications** | ✅ Live | Submit/approve/reject/changes-requested alerts |
| **Google Sheets Sync** | ✅ Live | Fire-and-forget append to tracking sheet |
| **OAuth (Google/Nostr)** | 🟡 Schema only | Ready to implement; validators in place |
| **Reviews & Ratings** | 🟡 Schema only | Model exists; no API/UI yet |
| **Audit Logging** | 🟡 Schema only | Traceability for admin actions |
| **API Documentation** | ❌ Not started | OpenAPI/Swagger needed |

## 1.3 Deployment URLs

| Environment | Service | URL |
|------------|---------|-----|
| **Production** | Client (SPA) | https://directory.bitcoiners.africa |
| **Production** | Server (API) | https://directory-server-bwfz.onrender.com |
| **Local Dev** | Client | http://localhost:5173 |
| **Local Dev** | Server | http://localhost:3000 |

---

# 2. Architecture & Tech Stack

## 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                       PUBLIC INTERNET                            │
└──────────────┬────────────────────────────────────────┬──────────┘
               │                                        │
        HTTPS (HTTP + TLS)                     HTTPS (HTTP + TLS)
               │                                        │
               ▼                                        ▼
    ┌──────────────────────┐           ┌────────────────────────────┐
    │   CLIENT (Vite SPA)   │           │   SERVER (Next.js 15 API)  │
    │  React 19 + Router    │◄────────►│  Prisma 5 + PostgreSQL     │
    │                       │  JSON     │                            │
    │  AuthContext (JWT)    │  REST     │  Handlers:                 │
    │  Mapbox GL + GA4      │           │  • Auth (register/login)   │
    │                       │           │  • Projects (CRUD)         │
    │  Pages fetch via API  │           │  • Taxonomy (categories)   │
    │  (no static JSON)     │           │  • Claims (ownership)      │
    │                       │           │  • Admin (moderation)      │
    │  coordinates.json     │           │  • Search                  │
    │  (map positions only) │           │  • Health checks           │
    │                       │           │                            │
    │  Pages:               │           │  Side Effects:             │
    │  • Home               │           │  • Gmail API (email)       │
    │  • Directory          │           │  • Google Sheets           │
    │  • Search             │           │  • projects.json sync      │
    │  • Project Details    │           │    (local dev export only) │
    │  • Dashboard (user)   │           │                            │
    │  • Admin Console      │           │                            │
    │  • Claim Ownership    │           │                            │
    └──────────────────────┘           └────────────────────────────┘
                                               │
                                               ▼
                                        ┌────────────────┐
                                        │  PostgreSQL    │
                                        │  (Neon hosted) │
                                        │  SOURCE OF     │
                                        │  TRUTH         │
                                        └────────────────┘
```

## 2.2 Tech Stack Summary

| Layer | Technology | Version | Notes |
|-------|-----------|---------|-------|
| **Frontend Framework** | React | 19 | React Router 7 for SPA routing |
| **Frontend Build** | Vite | 7 | Fast dev server + optimized builds |
| **Backend Framework** | Next.js | 15 | Used **only as a headless API** (no SSR/SSG) |
| **Language** | TypeScript | 5.5–5.8 | Strict mode on both client & server |
| **ORM** | Prisma | 5.x | Type-safe, auto-generated client |
| **Database** | PostgreSQL | 14+ | Hosted on Neon (recommended) |
| **Auth (JWT)** | jose | ^5 | HS256 signing; no external OAuth yet |
| **Password Hashing** | bcryptjs | ^2.4 | Cost factor 12 |
| **Input Validation** | Zod | ^3 | All routes validated server-side |
| **Email** | Nodemailer | ^6.9 | Gmail SMTP; best-effort (non-blocking) |
| **Google Integration** | googleapis | ^132 | Sheets API for submission tracking |
| **Mapping** | Mapbox GL JS | 3 | Interactive vector tiles |
| **Analytics** | react-ga4 | ^2 | GA4 page-view tracking |
| **HTTP Client** | Fetch API | Native | No axios/superagent; built-in fetch |

---

# 3. Data Model & Database

## 3.1 PostgreSQL Schema Overview

The Prisma schema (`server/prisma/schema.prisma`) defines the data model. Key relationships:

```
┌──────────────┐
│    User      │  (email, passwordHash, role, lastLoginAt, ...)
└───────┬──────┘
        │ owns
        │
        ▼
┌──────────────────────────────────────────────────────────┐
│           Project                                         │
│  (slug, name, description, logo, website, ...)          │
│  (published, status, verified, userId, ...)             │
│  (countryId?, categoryId?, socialLinks JSON, ...)       │
└────┬──────────────┬──────────────┬──────────────────────┘
     │              │              │
 refs City     many-to-many   refs Country
     │            ProjectTag     │
     ▼              │            ▼
  Country          Tag        Category
  (code, name)               (name, slug)
```

## 3.2 Core Models

### User
```prisma
model User {
  id              String   @id @default(cuid())
  email           String   @unique
  name            String?
  passwordHash    String?
  role            UserRole @default(USER)
  googleId        String?
  nostrPubkey     String?
  lastLoginAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  projects       Project[]
  projectClaims  ProjectClaim[]
}

enum UserRole {
  USER         // Can submit projects, claim ownership
  BUILDER      // (reserved for future use)
  MODERATOR    // Can approve/reject/manage taxonomy
  ADMIN        // Full control
}
```

**Key points:**
- `role` hierarchy: `USER(1) < BUILDER(2) < MODERATOR(3) < ADMIN(4)` (enforced by `hasRole()`)
- `googleId` / `nostrPubkey` are placeholders for OAuth (not yet implemented)
- Users auto-promoted to `ADMIN` if email in `ADMIN_EMAIL` env var during registration

### Project
```prisma
model Project {
  id              String   @id @default(cuid())
  slug            String   @unique
  name            String
  description     String?
  website         String?
  logo            String?           // URL to logo (e.g., from uploads/)
  coverImage      String?
  
  // Visibility & lifecycle
  published       Boolean  @default(false)
  status          ProjectStatus @default(PENDING)
  verified        Boolean  @default(false)
  featured        Boolean  @default(false)
  publishedAt     DateTime?
  
  // Taxonomy
  countryId       String?
  country         Country? @relation(fields: [countryId], references: [id])
  categoryId      String?
  category        Category? @relation(fields: [categoryId], references: [id])
  
  // Denormalized fields (from legacy projects.json)
  countryCode     String?
  countryName     String?
  categories      String[]      // Array of category names
  city            String?
  address         String?
  
  // Social & acceptance flags
  socialLinks     Json?         // { twitter, github, nostr, ... }
  acceptsLightning Boolean @default(false)
  acceptsOnchain  Boolean @default(false)
  acceptsGiftCards Boolean @default(false)
  
  // Founder/contact info
  founderName     String?
  founderEmail    String?
  founderTwitter  String?
  
  // Metadata
  foundedYear     Int?
  impact          String?
  active          Boolean  @default(true)
  
  // Ownership
  userId          String?
  user            User?    @relation(fields: [userId], references: [id])
  
  // Relationships
  tags            ProjectTag[]
  claims          ProjectClaim[]
  
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@index([published, status])
  @@index([userId])
  @@index([countryId])
}

enum ProjectStatus {
  PENDING    // Awaiting admin approval
  APPROVED   // Admin approved; if published=true, visible to public
  REJECTED   // Admin rejected; user can revise & resubmit
}
```

**Key points:**
- A project is visible to public **only if** `published=true` AND `status='approved'`
- Owners can view their own submissions (any status) via `getProjectById(..., currentUser)` visibility logic
- Admins can view all projects (any status)
- `slug` is unique and used in URLs (not the `id` CUID)
- Denormalized fields (`countryCode`, `countryName`, `categories`) speed up queries and allow fallback when relations are missing

### ProjectTag (Many-to-Many)
```prisma
model ProjectTag {
  id        String @id @default(cuid())
  projectId String
  project   Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  tagId     String
  tag       Tag    @relation(fields: [tagId], references: [id])
  
  createdAt DateTime @default(now())
  
  @@unique([projectId, tagId])
}

model Tag {
  id   String @id @default(cuid())
  name String @unique
  slug String @unique
  
  projects ProjectTag[]
  
  createdAt DateTime @default(now())
}
```

### ProjectClaim
```prisma
model ProjectClaim {
  id              String   @id @default(cuid())
  projectId       String
  project         Project  @relation(fields: [projectId], references: [id], onDelete: Cascade)
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  status          ClaimStatus @default(PENDING)
  proofOfOwnership String?     // URL or text
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  @@unique([projectId, userId])
}

enum ClaimStatus {
  PENDING    // Awaiting admin review
  APPROVED   // Ownership transferred to user
  REJECTED   // Admin rejected claim
}
```

**Key points:**
- Only one active claim per (project, user) pair
- When admin approves a claim:
  1. The claiming user becomes the project owner (`project.userId = claimingUser.id`)
  2. All other pending/active claims on that project are rejected
  3. Transactional to prevent race conditions

### Category, Country
```prisma
model Category {
  id   String @id @default(cuid())
  name String @unique
  slug String @unique
  order Int    @default(0)     // For sorting in UI
  
  projects Project[]
  createdAt DateTime @default(now())
}

model Country {
  id    String @id @default(cuid())
  code  String @unique         // ISO-2 (e.g., "NG")
  name  String
  flag  String?                // Emoji or URL
  
  projects Project[]
  createdAt DateTime @default(now())
}
```

**Seed Data:**
- 23 categories (Bitcoin Mining, Exchanges, DeFi, Education, etc.)
- 54 African countries + 1 "Global/Africa Wide" entry

### Submission, Review, AuditLog (Schema-only)

These models exist in Prisma but have **no API or UI yet**:

```prisma
model Submission {
  id               String @id @default(cuid())
  status           SubmissionStatus
  projectId        String
  moderatedBy      String?
  rejectionReason  String?
  createdAt        DateTime @default(now())
}

model Review {
  id        String @id @default(cuid())
  projectId String
  userId    String
  rating    Int              // 1-5 stars
  comment   String?
  
  @@unique([projectId, userId])
}

model AuditLog {
  id           String @id @default(cuid())
  action       AuditAction
  resourceType String
  resourceId   String
  actorId      String?
  details      Json?
  createdAt    DateTime @default(now())
}

enum SubmissionStatus {
  PENDING
  APPROVED
  REJECTED
  DRAFT
}

enum AuditAction {
  CREATE
  UPDATE
  DELETE
  APPROVE
  REJECT
  PUBLISH
  UNPUBLISH
}
```

## 3.3 Migrations & History

| Migration | Date | Changes |
|-----------|------|---------|
| `20251230075648_init` | Dec 2025 | Initial schema: users, projects, categories, countries, tags, claims |
| `20260105132524_add_projects_json_fields` | Jan 2026 | Added denormalized fields to match legacy `projects.json` structure |
| `20260319045645_add_project_claims` | Mar 2026 | ProjectClaim model for ownership transfer workflow |

---

# 4. API Design & Endpoints

## 4.1 Response Envelope

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;  // e.g., "VALIDATION_ERROR", "NOT_FOUND"
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

**Examples:**
```json
// Success
{ "success": true, "data": { "id": "...", "name": "..." }, "meta": { "page": 1, "total": 50 } }

// Error
{ "success": false, "error": { "message": "Unauthorized", "code": "AUTHENTICATION_ERROR" } }
```

## 4.2 Authentication Tokens

### Access Token (Short-lived)
- **Issuer:** `POST /api/auth/register` or `POST /api/auth/login`
- **Storage:** Client `localStorage` as `access_token`
- **Sent as:** `Authorization: Bearer <access_token>` header
- **TTL:** `JWT_EXPIRES_IN` env (default `1d`)
- **Payload:** `{ iat, exp, sub (userId), role }`

### Refresh Token (Long-lived)
- **Issuer:** Same endpoints
- **Storage:** HTTP-only, Secure, SameSite=Lax cookie named `refreshToken`
- **TTL:** `JWT_REFRESH_EXPIRES_IN` env (default `7d`)
- **Used by:** `POST /api/auth/refresh` to mint new access token
- **Auto-refresh:** Client calls `/api/auth/refresh` on `401` response

## 4.3 Complete Endpoint Reference

### Authentication (`/api/auth/*`)

| Method | Path | Auth | Validation | Notes |
|--------|------|------|-----------|-------|
| POST | `/auth/register` | Public | email, password (Zod) | Auto-promote to ADMIN if email in `ADMIN_EMAIL` |
| POST | `/auth/login` | Public | email, password | Updates `lastLoginAt` |
| POST | `/auth/refresh` | Cookie | none | Mint new access token from refresh cookie |
| POST | `/auth/logout` | Public | none | Clear refresh cookie |
| PATCH | `/auth/update-email` | User | newEmail (Zod) | Send verification email (TODO) |
| PATCH | `/auth/update-password` | User | oldPassword, newPassword | Hash with bcrypt (cost 12) |

### Users (`/api/users/*`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/users/me` | User | Return current user profile + role |
| PATCH | `/users/me` | User | Update name, email, etc. |

### Projects (`/api/projects/*`)

| Method | Path | Auth | Filtering | Notes |
|--------|------|------|-----------|-------|
| GET | `/projects` | Public | `published=true` + `status='approved'` | Pagination (page, limit) |
| GET | `/projects/[id]` | Public*  | Owner can view own pending; admin views all | By slug or CUID |
| POST | `/projects/submit` | User | multipart form (logo optional) | Create new project (status=pending, published=false) |
| PATCH | `/projects/[id]` | Owner | Updates `updatedAt` | Edit existing project (owner or admin) |
| DELETE | `/projects/[id]` | Admin | Soft/hard delete | Remove project (admin only) |
| GET | `/projects/my-projects` | User | No filters | Return all of current user's projects (all statuses) |
| POST | `/projects/[id]/claim` | User | Ownership claim | Initiate claim process |
| GET | `/projects/[id]/claim/status` | User | Check claim status | Retrieve latest claim for user on project |

### Search (`/api/search`)

| Method | Path | Auth | Query Params | Notes |
|--------|------|------|--------------|-------|
| GET | `/search` | Public | `q` (query), `category`, `country`, `tag`, `page`, `limit` | Returns published + approved projects only |

### Taxonomy (`/api/categories`, `/api/countries`, `/api/tags`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/categories` | Public | List all categories |
| GET | `/countries` | Public | List all countries (54 African + Global) |
| GET | `/tags` | Public | List all tags |

### Admin (`/api/admin/*`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/admin/stats` | Admin/Mod | Dashboard stats (total projects, pending, users, etc.) |
| GET | `/admin/projects/pending` | Admin/Mod | All pending submissions ordered by `createdAt` DESC |
| POST | `/admin/projects/[id]/approve` | Admin/Mod | Set `published=true, status='approved', publishedAt=now()` |
| POST | `/admin/projects/[id]/reject` | Admin/Mod | Set `status='rejected', published=false` |
| POST | `/admin/projects/[id]/feedback` | Admin/Mod | Request changes (set `status='rejected'`); optional email |
| GET/POST | `/admin/categories` | Admin/Mod | Create/read taxonomy |
| GET/POST | `/admin/countries` | Admin/Mod | Create/read taxonomy |
| GET/POST | `/admin/tags` | Admin/Mod | Create/read taxonomy |
| GET/PATCH | `/admin/users` | Admin | List/update users, change roles |
| GET | `/admin/claims` | Admin/Mod | List pending ownership claims |
| POST | `/admin/claims/[id]/approve` | Admin/Mod | Transfer ownership + reject other claims (transactional) |
| POST | `/admin/claims/[id]/reject` | Admin/Mod | Deny ownership claim |

### System (`/api/*`)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| GET | `/health` | Public | Returns `{ status: "ok" }` |
| POST | `/test-email` | Public | Debug: send test email to config recipients |

## 4.4 Known Endpoint Issues

1. ⚠️ **`GET /api/auth/me` does not exist** — Client code references it but the real endpoint is `GET /api/users/me`. Fix in `client/src/utils/api.ts`.

2. ⚠️ **Project update endpoint unclear** — Is it `POST /projects/[id]/submit` (resubmit after rejection) or `PATCH /projects/[id]`? Both may exist; need clarification.

3. ⚠️ **Claim endpoints location** — Are they under `/api/projects/[id]/claim` (user flow) or `/api/admin/claims/[id]` (admin flow)? Both exist; consolidate documentation.

---

# 5. Frontend Architecture

## 5.1 SPA Structure (Vite + React)

**Entry Point:** `client/src/main.tsx`

```typescript
<BrowserRouter>
  <AuthProvider>           {/* JWT in localStorage, auto-refresh */}
    <App />                {/* Route definitions */}
  </AuthProvider>
</BrowserRouter>
```

## 5.2 Page Map

| Route | Component | Auth | Purpose |
|-------|-----------|------|---------|
| `/` | `Home.tsx` | Public | Hero, featured projects, search box |
| `/directory` | `Directory.tsx` | Public | Filtered & paginated project listings |
| `/search` | `SearchResults.tsx` | Public | Full-text search results |
| `/project/:slug` | `ViewProject.tsx` | Public* | Project detail page (owner can view own pending) |
| `/create-project` | `CreateProject.tsx` | User | Submit new project form (multipart logo upload) |
| `/edit-project/:id` | `EditProject.tsx` | Owner/Admin | Edit existing project |
| `/claim/:projectId` | `ClaimOwnership.tsx` | User | Claim unowned project in directory |
| `/dashboard` | `Dashboard.tsx` | User | My projects (all statuses) + quick stats |
| `/admin` | `AdminLayout` (nested) | Admin/Mod | Admin dashboard & nested routes |
| `/admin/stats` | `AdminDashboard.tsx` | Admin/Mod | High-level metrics |
| `/admin/projects/pending` | `PendingProjects.tsx` | Admin/Mod | Pending submissions + approve/reject/feedback |
| `/admin/projects` | `AllProjects.tsx` | Admin/Mod | All projects + bulk actions |
| `/admin/taxonomy` | `TaxonomyManager.tsx` | Admin | CRUD categories, countries, tags |
| `/admin/users` | `UserManager.tsx` | Admin | List/update users, assign roles |
| `/admin/claims` | `ClaimsManager.tsx` | Admin | Review ownership claims |
| `/map` | `MapPage.tsx` | Public | Full-screen Mapbox visualization |
| `/infographics` | `Infographics.tsx` | Public | Quarterly snapshots archive |
| `/auth/login` | `Login.tsx` | Public | Email/password login |
| `/auth/register` | `Register.tsx` | Public | Email/password registration |

## 5.3 Key Components & State Management

### AuthContext (`client/src/contexts/AuthContext.tsx`)
- **Single source of truth** for auth state (current user, tokens, role)
- Stores **access token in `localStorage`** as `access_token`
- **Refresh token** in HTTP-only cookie (set by server)
- **Auto-refresh:** On `401` response, calls `POST /api/auth/refresh` and retries
- Exports: `useAuth()` hook + `login()`, `register()`, `logout()` functions

### authenticatedFetch (`client/src/utils/api.ts`)
```typescript
async function authenticatedFetch(url, options = {}) {
  const token = localStorage.getItem('access_token');
  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  return fetch(url, { ...options, headers, credentials: 'include' });
}
```
- Automatically injects Bearer token + `credentials: 'include'` (for cookies)
- Client code uses this instead of bare `fetch()`

### ProtectedRoute Component
```typescript
<ProtectedRoute requiredRole="user">
  <Dashboard />
</ProtectedRoute>
```
- Guards pages behind auth; redirects to login if necessary
- Optional role check: `requiredRole="admin"` only allows admin+ users

### AdminLayout Component
- Nested router for `/admin/*` pages
- Sidebar navigation + role-based menu items
- Checks `user.role` before rendering

## 5.4 Static Data Files

### `client/src/data/projects.json` (local dev export — NOT deployed)
- **Purpose:** Optional local snapshot for browsing/filtering project data offline during development
- **Source:** Auto-generated from database via `npm run sync` (run from `server/`)
- **Git:** Listed in `client/.gitignore` — never committed or deployed to Render
- **Frontend:** **Not imported by the SPA.** All pages read from `GET /api/projects` and related API endpoints
- **Regenerate:** `cd server && npm run sync`
- **Format:** Includes `_notice` header + `projects[]` array mirroring API shape

### `client/src/data/coordinates.json`
- **Purpose:** Map marker positions ONLY (infographic + live map overlays)
- **Content:** `{ project_coordinates[], country_regions[] }` keyed by `proj_id` (slug)
- **Status:** Committed to git; used by `BitcoinLiveMap.tsx` and `InfographicMap.tsx` for coordinates
- **Project data:** Fetched from API at runtime; matched to coordinates by slug
- **Update:** Admin scripts when adding map positions for new projects

## 5.5 Frontend Data Flow

```
User Action (form submit, click)
  ↓
API call (fetch / authenticatedFetch)
  ↓
Response { success, data, error }
  ↓
State update (React state / Context)
  ↓
Re-render
```

**Public project listing:** All directory pages fetch approved projects from `GET /api/projects` (paginated). Shared helper: `client/src/lib/projectsApi.ts` (`fetchAllApprovedProjects` with session cache).

**Map components:** `BitcoinLiveMap` and `InfographicMap` fetch project data from API once on mount, match to `coordinates.json` entries by slug. Only approved projects render as clickable markers.

**Error handling:** No fallback to static JSON. API failures show "Unable to load projects" with a Retry button.

**Example: Submit Project**
1. User fills form in `CreateProject.tsx`, clicks "Submit"
2. `POST /api/projects/submit` (multipart form data with logo)
3. Server returns `{ success: true, data: { project } }`
4. Frontend redirects to success page or dashboard
5. User sees project in `Dashboard.tsx` with status "Under Review"

---

# 6. Backend Architecture

## 6.1 Layered Architecture

```
HTTP Request → Route Handler (app/api/**/route.ts)
              ↓
            createApiHandler wrapper
              ├─ Extract user from JWT
              ├─ Check role authorization
              ├─ Validate body/query with Zod
              ├─ Call service layer
              └─ Map errors to HTTP status + JSON
              ↓
            Service Layer (lib/services/**)
              ├─ Business logic (no HTTP concerns)
              ├─ Prisma queries
              └─ Side effects (email, Sheets)
              ↓
            Database (PostgreSQL via Prisma)
```

## 6.2 Route Handlers

All under `server/app/api/**/route.ts`. Two patterns:

### Pattern A: Using `createApiHandler` (preferred)
```typescript
import { createGetHandler } from '@/lib/utils/api-handler';

export const GET = createGetHandler(
  async (req, { params }) => {
    const result = await someService(params.id);
    return NextResponse.json(successResponse(result));
  },
  { requireAuth: true, requireRoles: ['admin'] }
);
```
- Centralized auth, validation, error handling, CORS
- Less boilerplate

### Pattern B: Raw handler (being phased out)
```typescript
export async function GET(req: NextRequest) {
  try {
    const user = getRequestUser(req);  // throws if not authenticated
    if (user.role !== 'admin') throw new ForbiddenError('...');
    
    const body = await getValidatedBody(req, someSchema);
    const result = await someService(body);
    
    return NextResponse.json(successResponse(result));
  } catch (error) {
    return handleError(error);
  }
}
```
- More explicit; higher risk of copy-paste bugs
- Used in older admin routes; should be refactored

## 6.3 Service Layer

Located in `server/lib/services/*`, each file handles one domain:

| Service | Responsibility |
|---------|-----------------|
| `auth.service.ts` | Register, login, password hashing, token issuance, admin auto-promotion |
| `project.service.ts` | CRUD projects, visibility logic, slug generation, `transformProjectToJsonFormat` |
| `claim.service.ts` | Submit/list/approve/reject claims; transactional ownership transfer |
| `search.service.ts` | Full-text search with filters (name, description, category, country, tag) |
| `user.service.ts` | Get/update user profile, role management |
| `category/country/tag.service.ts` | Taxonomy CRUD |
| `email.service.ts` | Nodemailer wrapper; HTML templates for welcome, submission, approval, rejection, etc. |
| `googleSheets.ts` | Append submissions to Google Sheet (best-effort, non-blocking) |

### Example: Project Submission

**Route Handler** (`server/app/api/projects/submit/route.ts`)
```typescript
export const POST = createPostHandler(
  async (req: NextRequest) => {
    const user = getRequestUser(req);
    const formData = await req.formData();
    
    const project = await submitProject(formData, user);
    
    // Side effects (non-blocking)
    setImmediate(() => {
      sendProjectSubmissionConfirmation(user.email, project);
      sendAdminNotification(project);
      appendToGoogleSheets(project);
    });
    
    return NextResponse.json(successResponse(project));
  },
  { requireAuth: true }
);
```

**Service Layer** (`server/lib/services/project.service.ts`)
```typescript
export async function submitProject(formData: FormData, user: AuthenticatedUser) {
  // Extract fields
  const name = formData.get('name') as string;
  const description = formData.get('description') as string;
  const logo = formData.get('logo') as File | null;
  
  // Validate
  const validated = projectSubmitSchema.parse({ name, description, /* ... */ });
  
  // Generate slug
  const slug = slugify(name, { lower: true });
  
  // Upload logo (if present) → public/uploads/logos/
  let logoUrl = null;
  if (logo) {
    logoUrl = await uploadLogo(logo, slug);
  }
  
  // Create in DB
  const project = await prisma.project.create({
    data: {
      slug,
      name: validated.name,
      description: validated.description,
      logo: logoUrl,
      published: false,
      status: 'pending',
      userId: user.id,
      // ... other fields
    },
  });
  
  return project;
}
```

## 6.4 Prisma & Database Access

**Singleton Client** (`server/lib/db/prisma.ts`)
```typescript
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'warn'] : ['warn'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
```

**Why singleton?**
- Prevents connection pool exhaustion during hot-reload (dev)
- All services import from this module

**Usage in services:**
```typescript
import { prisma } from '@/lib/db';

const projects = await prisma.project.findMany({
  where: { published: true, status: 'approved' },
  include: { country: true, tags: { include: { tag: true } } },
});
```

## 6.5 Error Handling

**AppError Hierarchy** (`server/lib/utils/errors.ts`)
```typescript
class AppError extends Error {
  constructor(public message: string, public statusCode: number, public code?: string) {
    super(message);
  }
}

class ValidationError extends AppError { /* 400 */ }
class AuthenticationError extends AppError { /* 401 */ }
class AuthorizationError extends AppError { /* 403 */ }
class NotFoundError extends AppError { /* 404 */ }
class ConflictError extends AppError { /* 409 */ }
```

**Middleware maps errors → HTTP:**
```typescript
try {
  // handler logic
} catch (error) {
  if (error instanceof ValidationError) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
  // ... other types
  return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
}
```

---

# 7. Authentication & Authorization

## 7.1 JWT Flow

```
POST /api/auth/register { email, password }
  ↓
Server: hash password (bcrypt, cost 12)
Server: create User in DB
Server: issue both tokens
  ↓
Response:
  {
    "success": true,
    "data": {
      "user": { "id": "...", "email": "...", "role": "user" },
      "accessToken": "eyJhbGc..."
    }
  }
  Headers: Set-Cookie: refreshToken=...; HttpOnly; Secure; SameSite=Lax
```

**Client:**
```typescript
localStorage.setItem('access_token', accessToken);
// refreshToken is set automatically in the cookie by browser
```

**On subsequent requests:**
```
GET /api/projects
Headers: Authorization: Bearer eyJhbGc...
         Cookie: refreshToken=...
```

**Server decodes & verifies:**
```typescript
const token = request.headers.get('authorization')?.split(' ')[1];
const payload = await jwtVerify(token, new TextEncoder().encode(JWT_ACCESS_SECRET));
// payload.sub = userId
```

## 7.2 Role-Based Access Control (RBAC)

**Hierarchy:**
```
user (level 1)
  ↓
builder (level 2)  [reserved for future use]
  ↓
moderator (level 3) [can approve/reject/manage projects]
  ↓
admin (level 4)    [full control, can manage users]
```

**Enforcement:**
```typescript
function hasRole(userRole: UserRole, requiredRole: UserRole | UserRole[]): boolean {
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  const userLevel = roleLevel[userRole];
  return roles.some(r => userLevel >= roleLevel[r]);
}

// Usage in route handler
if (!hasRole(user.role, 'moderator')) {
  throw new AuthorizationError('Access denied', 403);
}
```

**Auto-promotion:**
If a user's email matches one in the `ADMIN_EMAIL` env var (comma-separated) during registration, they are assigned `role: 'admin'` instead of `user`.

## 7.3 Resource-Level Ownership

Beyond role checks, some resources have ownership rules:

- **A user can edit/delete their own project**, but not others' (unless admin/moderator)
- **A user can view their own pending submission**, but others cannot
- **A user can approve/reject their own claim**, but not others' (unless admin)

These are checked in the **service layer**:

```typescript
export async function updateProject(id: string, data: Partial<Project>, requestingUser: AuthenticatedUser) {
  const project = await prisma.project.findUnique({ where: { id } });
  
  if (!project) throw new NotFoundError('Project not found');
  
  // Owner or admin can edit
  const isOwner = project.userId === requestingUser.id;
  const isAdmin = requestingUser.role === 'admin' || requestingUser.role === 'moderator';
  
  if (!isOwner && !isAdmin) {
    throw new AuthorizationError('Only owner or admin can edit', 403);
  }
  
  return prisma.project.update({ where: { id }, data });
}
```

---

# 8. Project Workflow (User → Admin → Live)

This is the **core lifecycle** that any coding agent must understand.

## 8.1 The Complete Workflow

```
┌──────────────────────────────────────────────────────────────────────────┐
│                         PROJECT LIFECYCLE                                 │
└──────────────────────────────────────────────────────────────────────────┘

[STEP 1: USER SUBMITS PROJECT]
  ├─ Route: POST /api/projects/submit
  ├─ Auth: User (any authenticated user)
  ├─ Input: { name, description, website, logo?, ..., categories?, country?, tags? }
  │
  ├─ Database Changes:
  │   ├─ INSERT Project { id: CUID, slug, name, description, ..., published=false, status='pending', userId, ... }
  │   └─ INSERT ProjectTag entries (if tags provided)
  │
  ├─ Side Effects (setImmediate, non-blocking):
  │   ├─ Send user confirmation email (template: "project_submitted.html")
  │   ├─ Send admin team notification (template: "admin_new_submission.html")
  │   └─ Append to Google Sheets submission log
  │
  └─ Response: { success: true, data: { project } }
     (project.published=false, project.status='pending')


[STEP 2: USER VIEWS OWN SUBMISSION]
  ├─ Route: GET /api/projects/[id]  (where id = slug or CUID)
  ├─ Auth: User (authenticated)
  ├─ Visibility Logic (in service layer):
  │   ├─ IF (published=true AND status='approved') → Public can view
  │   ├─ ELSE IF (userId === requestingUser.id) → Owner can view
  │   ├─ ELSE IF (requestingUser.role IN [admin, moderator]) → Admin can view
  │   ├─ ELSE → Throw 403 Forbidden or 404 Not Found
  │
  └─ Frontend: Dashboard shows project with "Under Review" badge + "View Submission" button


[STEP 3: ADMIN REVIEWS PENDING PROJECTS]
  ├─ Route: GET /api/admin/projects/pending
  ├─ Auth: Admin/Moderator (role check)
  ├─ Response: List of all projects WHERE status='pending' (ordered by createdAt DESC)
  │
  └─ Admin UI displays:
     ├─ Project name, category, country, submitted by (user), submission date
     └─ Action buttons: [View Details] [Approve] [Request Changes] [Reject]


[STEP 4a: ADMIN APPROVES PROJECT]
  ├─ Route: POST /api/admin/projects/[id]/approve
  ├─ Auth: Admin/Moderator
  │
  ├─ Database Changes:
  │   └─ UPDATE Project SET published=true, status='approved', publishedAt=NOW()
  │
  ├─ Side Effects:
  │   ├─ Send user approval email (template: "project_approved.html")
  │   └─ Send admin team notification
  │
  ├─ Result: project.published=true, project.status='approved'
  │
  └─ Frontend Consequence:
     ├─ Project becomes visible on /directory, /search results, homepage
     ├─ User dashboard shows project with "Verified" badge + "View" + "Edit" buttons
     └─ Project appears in public /api/projects?published=true&status=approved


[STEP 4b: ADMIN REQUESTS CHANGES]
  ├─ Route: POST /api/admin/projects/[id]/feedback
  ├─ Auth: Admin/Moderator
  ├─ Input: { notes: "Please add website URL and social links" }
  │
  ├─ Database Changes:
  │   └─ UPDATE Project SET status='rejected', published=false
  │
  ├─ Side Effects:
  │   └─ Send user feedback email (template: "project_needs_changes.html", includes notes)
  │
  └─ Frontend Consequence:
     ├─ User dashboard shows project with "Rejected" badge (red)
     └─ Action button: "Revise & Resubmit"


[STEP 4c: ADMIN REJECTS PROJECT]
  ├─ Route: POST /api/admin/projects/[id]/reject
  ├─ Auth: Admin/Moderator
  │
  ├─ Database Changes:
  │   └─ UPDATE Project SET status='rejected', published=false
  │
  ├─ Side Effects:
  │   └─ Send user rejection email (template: "project_rejected.html")
  │
  └─ Frontend Consequence:
     ├─ User dashboard shows project with "Rejected" badge
     └─ Action button: "Revise & Resubmit"


[STEP 5: AFTER APPROVAL — ADD TO MAP (Manual)]
  ├─ Admin manually edits coordinates.json
  ├─ Adds entry: { "proj_id": "project-slug", "name": "Project Name", "livemap": { "coords": [lng, lat] } }
  ├─ Commits to Git
  │
  └─ Frontend: BitcoinLiveMap.tsx
     ├─ Reads coordinates.json
     ├─ For each coordinate, fetches project details from /api/projects/[slug]
     └─ Displays map marker with project info popup


[STEP 6: USER EDITS APPROVED PROJECT]
  ├─ Route: PATCH /api/projects/[id]
  ├─ Auth: Owner or Admin
  ├─ Input: { name?, description?, website?, ..., categories?, tags?, ... }
  │
  ├─ Database Changes:
  │   └─ UPDATE Project SET name, description, website, ..., updatedAt=NOW()
  │
  └─ Result: Project updated instantly; if published=true, changes visible to public immediately


[STEP 7: USER REVISES & RESUBMITS REJECTED PROJECT]
  ├─ Frontend: Click "Revise & Resubmit" on rejected project
  ├─ Route: PATCH /api/projects/[id] (same as edit)
  ├─ Input: { revised fields }
  │
  ├─ Database Changes:
  │   └─ UPDATE Project SET name, description, ..., status='pending', published=false, updatedAt=NOW()
  │       (admin must re-approve)
  │
  └─ Result: Project back in pending queue; admin reviews again
```

## 8.2 Database State Transitions

| Step | `published` | `status` | `publishedAt` | Visible? |
|------|-------------|----------|---------------|----------|
| User submits | `false` | `pending` | null | ❌ (owner only) |
| Admin approves | `true` | `approved` | timestamp | ✅ (public) |
| Admin requests changes | `false` | `rejected` | unchanged | ❌ (owner only) |
| Admin rejects | `false` | `rejected` | unchanged | ❌ (owner only) |
| User revises & resubmits | `false` | `pending` | unchanged | ❌ (owner only) |

## 8.3 API Filters for Visibility

**Public directory listing:**
```typescript
const where = {
  published: true,
  status: 'approved',
};
```

**User's own projects (dashboard):**
```typescript
const where = {
  userId: currentUser.id,
  // No filters — shows all statuses
};
```

**Admin all-projects view:**
```typescript
const where = {};  // No filters — shows everything
```

**Search results:**
```typescript
const where = {
  published: true,
  status: 'approved',
  OR: [
    { name: { contains: query, mode: 'insensitive' } },
    { description: { contains: query, mode: 'insensitive' } },
  ],
};
```

---

# 9. Known Issues & Technical Debt

## 9.1 Critical Issues (Fix Immediately)

### 1. **Non-existent Endpoint: `GET /api/auth/me`**
- **Location:** `client/src/utils/api.ts` → `getCurrentUser()`
- **Problem:** Function calls `GET /api/auth/me`, but this endpoint doesn't exist
- **Fix:** Replace with `GET /api/users/me` (which exists)
- **Impact:** ⚠️ Medium — affects auth initialization on page load

```typescript
// BEFORE (wrong)
const response = await fetch(`${API_URL}/api/auth/me`, { headers });

// AFTER (correct)
const response = await fetch(`${API_URL}/api/users/me`, { headers });
```

### 2. **Rejected Projects Show "Under Review" in Dashboard**
- **Location:** `client/src/pages/Dashboard.tsx` → `getProjectStatus()`
- **Problem:** Status badge checks `verified` field instead of `status` enum
- **Problem:** Shows "needs_update" instead of "rejected" badge for rejected projects
- **Fix:** Check `project.status === 'rejected'` and return `'rejected'` status type
- **Impact:** 🔴 High — UX is confusing; users can't tell if project was rejected or still pending

```typescript
// BEFORE (wrong)
if (project.published === true && project.verified === true) {
  return 'verified';  // Only checks 'verified', not 'status'
}

// AFTER (correct)
if (project.published === true && project.status === 'approved') {
  return 'verified';
}
if (project.status === 'rejected') {
  return 'rejected';  // Add new badge type
}
```

### 3. **"View Submission" Returns "Project Not Found"**
- **Location:** `client/src/pages/ViewProject.tsx`
- **Status:** ✅ Fixed — API-only, no projects.json fallback
- **Problem (was):** Fallback to `projects.json` masked API errors; owners couldn't see pending submissions
- **Fix:** Only fetch from API; show appropriate error for 403/404

### 4. **Search Crashes After Approving/Rejecting Projects**
- **Location:** `server/lib/services/search.service.ts`
- **Problem:** Response envelope doesn't include all required fields for frontend
- **Problem:** Missing fields cause React to crash when rendering search results
- **Fix:** Use `transformProjectToJsonFormat()` when returning search results
- **Impact:** 🔴 High — search feature broken after any admin action

```typescript
// BEFORE (incomplete)
return {
  data: projects,  // Missing: categories, country_name, etc.
  meta: { page, limit, total },
};

// AFTER (complete)
return {
  data: projects.map(transformProjectToJsonFormat),
  meta: { page, limit, total },
};
```

### 5. **Missing Endpoint: `POST /api/admin/projects/[id]/feedback`**
- **Location:** Should be at `server/app/api/admin/projects/[id]/feedback/route.ts`
- **Problem:** Admin can click "Request Changes" button but endpoint doesn't exist
- **Problem:** Returns 404 error instead of updating project status
- **Fix:** Create endpoint that sets `status='rejected', published=false` + sends email
- **Impact:** 🔴 High — "Request Changes" feature doesn't work

---

## 9.2 High-Priority Issues (Fix Soon)

### 6. **Missing Endpoint: `POST /api/admin/projects/[id]/feedback`**
(Already listed above as #5)

### 7. **Ephemeral Upload Storage**
- **Location:** `server/app/api/projects/submit/route.ts` → writes to `public/uploads/logos/`
- **Problem:** Render's filesystem is ephemeral; uploads lost on redeploy/restart
- **Solution:** Use object storage (S3, Cloudflare R2, or Cloudinary)
- **Impact:** 🟠 High — all user-uploaded logos are lost after deployment

### 8. **Email Notifications Not Working in Production**
- **Location:** `server/lib/services/email.service.ts`
- **Problem:** Non-blocking emails (setImmediate) may not complete on serverless/scaled-to-zero
- **Problem:** Gmail SMTP credentials may not be set correctly
- **Solution:** Use job queue (Bull, Inngest) or ensure always-on instance
- **Impact:** 🟠 High — users don't receive critical notifications (approval, rejection, welcome)

### 9. **Secrets in `next.config.js#env`**
- **Location:** `server/next.config.js`
- **Problem:** `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `DATABASE_URL` exposed in `env` block
- **Problem:** Values inlined at build time; can leak into client bundles
- **Solution:** Read secrets from `process.env` server-side only; remove from `env` block
- **Impact:** 🟠 Medium — security risk; JWT secrets could be compromised

```javascript
// BEFORE (wrong)
env: {
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
},

// AFTER (correct)
// Remove entirely; read from process.env in route handlers
```

### 10. **CORS Wildcard with Credentials**
- **Location:** `server/lib/auth/middleware.ts` → `getCorsHeaders()`
- **Problem:** Allows `Access-Control-Allow-Origin: *` while also setting `Access-Control-Allow-Credentials: true`
- **Problem:** This combination is invalid per spec; browsers will reject requests
- **Solution:** Strict allow-list; no wildcard
- **Impact:** 🟠 Medium — potential CORS failures in production

```typescript
// BEFORE (wrong)
function getCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': origin || '*',  // Wildcard fallback
    'Access-Control-Allow-Credentials': 'true',    // Invalid combo
  };
}

// AFTER (correct)
const ALLOWED_ORIGINS = ['https://directory.bitcoiners.africa', 'http://localhost:5173'];
function getCorsHeaders(origin: string | null) {
  return {
    'Access-Control-Allow-Origin': ALLOWED_ORIGINS.includes(origin) ? origin : '',
    'Access-Control-Allow-Credentials': 'true',
  };
}
```

---

## 9.3 Medium-Priority Issues (Refactor)

### 11. **Inconsistent Route Handler Patterns**
- **Problem:** Some routes use `createApiHandler` (clean); others are raw handlers (boilerplate-heavy)
- **Problem:** Param typing inconsistent (`params: { id }` vs `params: Promise<{ id }>`)
- **Solution:** Standardize all routes on `createApiHandler` + async param unwrapping
- **Impact:** 🟡 Medium — code duplication; maintenance burden

### 12. **Inconsistent Prisma Client Usage**
- **Problem:** Some routes instantiate `new PrismaClient()` per file instead of using singleton
- **Problem:** Risks connection pool exhaustion
- **Solution:** Always import from `@/lib/db`
- **Impact:** 🟡 Medium — potential database connection errors under load

### 13. **Missing Declare for `nanoid` Dependency**
- **Location:** `server/app/api/projects/submit/route.ts` → imports `nanoid`
- **Problem:** `nanoid` not in `package.json` (only transitive via another package)
- **Problem:** Can cause clean install/build to fail in CI/CD
- **Solution:** Add `npm install nanoid` or remove usage (use CUID instead)
- **Impact:** 🟡 Medium — deployment risk

### 14. **Unused Code & Dependencies**
- **Unused:** `rate-limit.ts` (defined but never wired into routes)
- **Unused:** `winston` logger (installed but unused; `pino` is primary)
- **Unused:** Tailwind CSS + `globals.css` in API-only server
- **Stale:** `schema.backup.prisma`, `dummy.txt`
- **Solution:** Remove or repurpose
- **Impact:** 🟡 Low — code clutter; increases cognitive load

---

## 9.4 Low-Priority Issues (Nice to Have)

### 15. **No Infrastructure-as-Code**
- **Problem:** Render services configured manually in dashboard; no `render.yaml`
- **Solution:** Add `render.yaml` for reproducibility
- **Impact:** 🟢 Low — affects deployment automation only

### 16. **OAuth Scaffolded but Not Implemented**
- **Problem:** Schema has `googleId`, `nostrPubkey`; validators prepared; but no OAuth routes
- **Solution:** Implement Google OAuth + Nostr login (future feature)
- **Impact:** 🟢 Low — nice-to-have; not blocking

### 17. **Reviews & AuditLog Not Implemented**
- **Problem:** Schema exists; no API or UI
- **Solution:** Implement CRUD routes + admin UI
- **Impact:** 🟢 Low — future feature

### 18. **No Automated Tests**
- **Problem:** Jest configured but no tests committed
- **Solution:** Add unit tests (services, validators) + integration tests (routes)
- **Impact:** 🟢 Low — good practice; improves confidence

---

## 9.5 Summary Table

| Issue | Severity | Area | Fix Effort |
|-------|----------|------|-----------|
| Non-existent `/api/auth/me` | 🔴 High | API/Client | 30 min |
| Rejected projects show "Under Review" | 🔴 High | Frontend | 1 hour |
| "View Submission" returns "Not Found" | 🔴 High | Frontend | 1 hour |
| Search crashes after approval | 🔴 High | Backend | 1 hour |
| Missing feedback endpoint | 🔴 High | Backend | 2 hours |
| Ephemeral uploads | 🟠 Medium | Deployment | 4–8 hours |
| Email not working in prod | 🟠 Medium | Infrastructure | 2–4 hours |
| Secrets in next.config.js | 🟠 Medium | Security | 2 hours |
| CORS wildcard issue | 🟠 Medium | Security | 1 hour |
| Inconsistent handlers | 🟡 Medium | Code Quality | 4–8 hours |
| Unused dependencies | 🟡 Medium | Cleanup | 1 hour |
| No Infrastructure-as-Code | 🟢 Low | DevOps | 2 hours |
| OAuth not implemented | 🟢 Low | Future | TBD |
| No tests | 🟢 Low | Quality | TBD |

---

# 10. Testing & QA

## 10.1 Manual Testing Checklist

### **Category 1: User Submission Workflow**

- [ ] **Submit New Project**
  - [ ] Navigate to `/create-project`
  - [ ] Fill form (name, description, website, logo, country, category)
  - [ ] Submit
  - [ ] ✅ Redirected to success page
  - [ ] ✅ Email received (user confirmation)
  - [ ] ✅ Admin team receives notification email
  - [ ] ✅ Project in DB with `status='pending'`, `published=false`, `userId=<current>`

- [ ] **View Own Submission (Owner)**
  - [ ] Log in as project owner
  - [ ] Go to `/dashboard`
  - [ ] Click "View Submission"
  - [ ] ✅ Can see project details
  - [ ] ✅ Banner says "This project is under review"
  - [ ] ✅ No "Edit" button (pending projects can't be edited)

- [ ] **Public Cannot View Pending**
  - [ ] Log out
  - [ ] Try to access project URL directly: `/project/<slug>`
  - [ ] ✅ Error or "under review" message (not accessible)
  - [ ] Try search for project name
  - [ ] ✅ Project does NOT appear in search results

### **Category 2: Admin Approval Workflow**

- [ ] **View Pending Projects (Admin)**
  - [ ] Log in as admin
  - [ ] Go to `/admin/projects/pending`
  - [ ] ✅ See list of all pending projects (count matches DB)
  - [ ] Click "View Details" on a project
  - [ ] ✅ Admin can see project details

- [ ] **Approve Project**
  - [ ] Click "Approve" button
  - [ ] Confirm dialog
  - [ ] ✅ Success message
  - [ ] ✅ Project removed from pending list
  - [ ] Check DB: `published=true`, `status='approved'`
  - [ ] ✅ User receives approval email

- [ ] **Project Now Visible Publicly**
  - [ ] Log out
  - [ ] Go to homepage `/`
  - [ ] ✅ Approved project appears in listings
  - [ ] Go to directory `/directory`
  - [ ] ✅ Project visible
  - [ ] Search for project name
  - [ ] ✅ Project appears in search results
  - [ ] Access project URL directly
  - [ ] ✅ Page loads; no "under review" banner

- [ ] **User Dashboard Updated**
  - [ ] Log in as project owner
  - [ ] Go to `/dashboard`
  - [ ] ✅ Project now shows "Verified" badge (green)
  - [ ] ✅ "View" + "Edit" buttons visible
  - [ ] Click "Edit"
  - [ ] ✅ Can edit project; changes save immediately

### **Category 3: Request Changes Workflow**

- [ ] **Admin Requests Changes**
  - [ ] Go to `/admin/projects/pending`
  - [ ] Click "Request Changes" on a project
  - [ ] Enter feedback: "Please add Twitter link"
  - [ ] Click "Send Feedback"
  - [ ] ✅ Success message
  - [ ] Check DB: `status='rejected'`, `published=false`
  - [ ] ✅ User receives "changes requested" email with feedback

- [ ] **User Dashboard Shows Rejection**
  - [ ] Log in as project owner
  - [ ] Go to `/dashboard`
  - [ ] ✅ Project shows "Rejected" badge (red)
  - [ ] ✅ Action button says "Revise & Resubmit"

- [ ] **User Revises & Resubmits**
  - [ ] Click "Revise & Resubmit"
  - [ ] ✅ Redirected to edit form
  - [ ] Add Twitter link, save
  - [ ] Check DB: `status='pending'`, `published=false`
  - [ ] ✅ Project back in admin pending queue
  - [ ] Admin approves again
  - [ ] ✅ Project goes live

### **Category 4: Reject Workflow**

- [ ] **Admin Rejects Project**
  - [ ] Go to `/admin/projects/pending`
  - [ ] Click "Reject" on a project
  - [ ] ✅ Success message
  - [ ] Check DB: `status='rejected'`, `published=false`
  - [ ] ✅ User receives rejection email

- [ ] **Public Cannot See Rejected**
  - [ ] Search for rejected project
  - [ ] ✅ Does not appear in results

### **Category 5: Search & Filters**

- [ ] **Search Only Returns Approved**
  - [ ] Search for an approved project name
  - [ ] ✅ Results show project
  - [ ] Search for a pending project name
  - [ ] ✅ No results
  - [ ] Search for rejected project name
  - [ ] ✅ No results

- [ ] **Filter by Country**
  - [ ] Click country filter
  - [ ] Select "Nigeria"
  - [ ] ✅ See only approved projects from Nigeria
  - [ ] Check that no pending/rejected projects appear

- [ ] **Filter by Category**
  - [ ] Click category filter
  - [ ] Select "Education"
  - [ ] ✅ See only approved education projects

### **Category 6: Edge Cases**

- [ ] **Non-Admin Cannot Approve**
  - [ ] Log in as regular user
  - [ ] Try to access `/admin/projects/pending`
  - [ ] ✅ Denied (redirected or error)

- [ ] **Unauthenticated Cannot Submit**
  - [ ] Log out
  - [ ] Try to access `/create-project`
  - [ ] ✅ Redirected to login

- [ ] **Non-Owner Cannot Edit Others' Projects**
  - [ ] Submit project as User A
  - [ ] Log out, log in as User B
  - [ ] Try to access edit form for User A's project
  - [ ] ✅ Denied (error or no edit button)

## 10.2 Database Verification

```sql
-- Count pending projects
SELECT COUNT(*) FROM projects WHERE status = 'pending' AND published = false;

-- Count approved/live projects
SELECT COUNT(*) FROM projects WHERE status = 'approved' AND published = true;

-- Count rejected projects
SELECT COUNT(*) FROM projects WHERE status = 'rejected' AND published = false;

-- Verify owner of a specific project
SELECT id, name, slug, userId, status, published FROM projects WHERE slug = 'test-project';

-- Check user's projects (all statuses)
SELECT id, name, status, published FROM projects WHERE userId = '<user-id>';
```

---

# 11. Deployment Pipeline

## 11.1 Environments

| Environment | Server URL | Client URL | Database | Purpose |
|-------------|-----------|-----------|----------|---------|
| **Local Dev** | http://localhost:3000 | http://localhost:5173 | Local PostgreSQL | Development |
| **Staging** | (Not yet configured) | (Not yet configured) | Staging DB | Testing before prod |
| **Production** | https://directory-server-bwfz.onrender.com | https://directory.bitcoiners.africa | Neon PostgreSQL | Live platform |

## 11.2 Deployment Process

### **Server Deployment (Next.js)**

1. **Build:**
   ```bash
   cd server
   npm install               # Generates Prisma client
   npm run build             # Compiles TypeScript
   ```

2. **Pre-deployment:**
   ```bash
   npm run db:generate       # Ensure Prisma client is up-to-date
   ```

3. **On Render:**
   - Set all environment variables (see [Environment Variables](#environment-variables) section)
   - Configure health check: `GET /api/health`
   - Set start command: `npm run start`
   - After deployment, **manually** run migrations:
     ```bash
     npx prisma migrate deploy
     ```

### **Client Deployment (Vite SPA)**

1. **Build:**
   ```bash
   cd client
   npm install
   npm run build              # → dist/
   ```

2. **Set build-time env vars:**
   - `VITE_API_URL=https://directory-server-bwfz.onrender.com`
   - `VITE_GA_TRACKING_ID=<your-ga4-id>`

3. **On Render (or any static host):**
   - Upload `dist/` folder
   - Configure rewrite rule: all routes → `index.html` (for SPA routing)
   - Set caching headers: `Cache-Control: public, max-age=3600` (HTML), `max-age=31536000` (JS/CSS)

## 11.3 Database Migrations

**Before deploying schema changes:**

1. Write migration:
   ```bash
   cd server
   npx prisma migrate dev --name <migration_name>
   ```

2. Test locally

3. Commit migration file to Git

4. **On production deployment**, manually run:
   ```bash
   npx prisma migrate deploy
   ```

   Or integrate into CI/CD (with approval gate):
   ```yaml
   # Pseudo-CI/CD
   - name: Run migrations
     run: npx prisma migrate deploy --skip-generate
     env:
       DATABASE_URL: ${{ secrets.PROD_DATABASE_URL }}
   ```

## 11.4 Known Deployment Issues

- ⚠️ **No `render.yaml`** — Services are configured manually in the Render dashboard. Recommended: create Infrastructure-as-Code file.
- ⚠️ **Ephemeral filesystem** — Uploaded logos (`public/uploads/`) are lost on redeploy. Switch to object storage.
- ⚠️ **Email reliability** — Background work (Nodemailer, Sheets) uses `setImmediate`, which may not complete on scaled-to-zero. Use a job queue or ensure always-on.
- ⚠️ **Cold starts** — Neon Database may take a few seconds to wake up if unused. Consider using a keepalive ping.

---

# 12. Development Workflow for Agents

This section is **critical for coding agents** (Cursor, Claude Code, Codex, etc.).

## 12.1 Pre-Development Checklist

Before making ANY changes, verify:

- [ ] **Clone repo:** `git clone https://github.com/CodeNaut1/directory && cd directory`
- [ ] **Understand current state:** Read this ROADMAP + browse `ROADMAP.md` (if exists) + review recent commits
- [ ] **Local setup:**
  ```bash
  cd server && npm install && npm run db:generate
  cd ../client && npm install
  cp server/.env.example server/.env  # Add DATABASE_URL + JWT secrets
  npm run dev  # Both client and server
  ```
- [ ] **Test endpoints:** Visit `http://localhost:5173`, try submitting a test project
- [ ] **Verify DB:** `npx prisma studio` to inspect data

## 12.2 Common Development Tasks

### **Task 1: Fix an API Bug**

**Example:** "The search endpoint crashes after approving projects."

1. **Understand the bug:**
   - Read section [Search Crashes After Approving/Rejecting](#4-search-crashes-after-approving-rejecting-projects)
   - Check logs: `npm run dev` on server, watch for errors
   - Test: Search for "togo", approve a project, search again
   - Observe the error

2. **Locate the code:**
   - Bug is in `server/lib/services/search.service.ts`
   - The service returns incomplete project objects

3. **Find related code:**
   - Look at `transformProjectToJsonFormat()` in `server/lib/services/project.service.ts`
   - This function normalizes DB projects to match frontend expectations

4. **Implement fix:**
   ```typescript
   // In search.service.ts, at the end of searchProjects()
   return {
     data: projects.map(transformProjectToJsonFormat),  // ← Add this
     meta: { page, limit, total },
   };
   ```

5. **Test:**
   - Restart server
   - Submit a test project, approve it, search for it
   - Verify search results display correctly

6. **Commit:**
   ```bash
   git add server/lib/services/search.service.ts
   git commit -m "fix: transform projects in search results to match expected shape"
   ```

### **Task 2: Create a New Admin Feature**

**Example:** "Add ability for admins to bulk-approve projects."

1. **Plan:**
   - API endpoint: `POST /api/admin/projects/bulk-approve` with `{ projectIds: string[] }`
   - Service function: `bulkApproveProjects(projectIds)`
   - Frontend: Add checkbox column to `/admin/projects`, bulk-action button

2. **Implement backend first:**
   - Create `server/app/api/admin/projects/bulk-approve/route.ts`
   - Use `createPostHandler` wrapper
   - Call `bulkApproveProjects` from service
   - Add Zod validator for request body

3. **Test with curl:**
   ```bash
   curl -X POST http://localhost:3000/api/admin/projects/bulk-approve \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer <token>" \
     -d '{ "projectIds": ["proj-id-1", "proj-id-2"] }'
   ```

4. **Implement frontend:**
   - Add checkbox state to `/admin/projects` table
   - Add bulk-approve button
   - Call `POST /api/admin/projects/bulk-approve` with checked IDs
   - Refresh list on success

5. **Test end-to-end:**
   - Go to admin projects page
   - Check 2–3 projects
   - Click "Bulk Approve"
   - Verify they are now approved

### **Task 3: Fix a Frontend Bug**

**Example:** "Dashboard shows 'Under Review' for rejected projects."

1. **Locate the code:**
   - Bug is in `client/src/pages/Dashboard.tsx`
   - Function: `getProjectStatus(project)`

2. **Understand the issue:**
   - Current logic only checks `verified` field (Boolean)
   - Should check `status` field (enum: 'pending', 'approved', 'rejected')

3. **Implement fix:**
   ```typescript
   const getProjectStatus = (project: Project): ProjectStatus => {
     if (project.published === true && (project as any).status === 'approved') {
       return 'verified';
     }
     if ((project as any).status === 'rejected') {
       return 'rejected';  // ← New case
     }
     if ((project as any).status === 'pending' || !project.published) {
       return 'under_review';
     }
     return 'under_review';
   };
   ```

4. **Add badge styling:**
   ```typescript
   case 'rejected':
     return {
       background: '#FEF3F2',
       color: '#B42318',
       icon: <XCircleIcon />,
       text: 'Rejected',
     };
   ```

5. **Test:**
   - Submit a project, reject it, view dashboard
   - Verify badge shows "Rejected" in red

### **Task 4: Add a New Validation Rule**

**Example:** "Project names must be at least 5 characters."

1. **Locate validator:**
   - `server/lib/validators/index.ts` (or split files like `validators/project.ts`)

2. **Update Zod schema:**
   ```typescript
   const projectSubmitSchema = z.object({
     name: z.string().min(5, 'Project name must be at least 5 characters').max(100),
     description: z.string().optional(),
     // ...
   });
   ```

3. **Test with invalid input:**
   ```bash
   curl -X POST http://localhost:3000/api/projects/submit \
     -H "Authorization: Bearer <token>" \
     -d '{ "name": "AB" }'  # Too short
   ```
   - ✅ Expect 400 Bad Request with validation error

4. **Test with valid input:**
   - ✅ Project creates successfully

### **Task 5: Update Database Schema**

**Example:** "Add `logo_color` field to projects for better branding."

1. **Edit schema:**
   ```prisma
   model Project {
     // ... existing fields
     logoColor  String?        // e.g., "#FF5733"
   }
   ```

2. **Create migration:**
   ```bash
   cd server
   npx prisma migrate dev --name add_logo_color
   ```
   - Prisma auto-generates SQL
   - Schema is updated

3. **Update service layer:**
   ```typescript
   // In project.service.ts, submitProject()
   const project = await prisma.project.create({
     data: {
       // ... existing fields
       logoColor: validatedData.logoColor || null,
     },
   });
   ```

4. **Update frontend types:**
   ```typescript
   // client/src/data/projects.types.ts
   interface Project {
     // ... existing fields
     logoColor?: string;
   }
   ```

5. **Add to form:**
   ```typescript
   // client/src/pages/CreateProject.tsx
   <input type="color" placeholder="Logo Color" />
   ```

6. **Test:**
   - Submit a project with logo color
   - Verify it's stored in DB and returned in API

## 12.3 Code Organization Rules

### **API Endpoints (Routes)**

**Location:** `server/app/api/<resource>/<action>/route.ts`

**Pattern:**
```typescript
import { createGetHandler, createPostHandler } from '@/lib/utils/api-handler';
import { someSchema } from '@/lib/validators';
import { someService } from '@/lib/services';

export const GET = createGetHandler(
  async (req, { params }) => {
    const result = await someService();
    return NextResponse.json(successResponse(result));
  },
  { requireAuth: true, requireRoles: ['admin'] }
);
```

**Rules:**
- Always use `createApiHandler` wrapper (or raw handler if justified)
- Thin layer — business logic goes in services
- Validate input with Zod (`getValidatedBody`)
- Return standardized envelope (`successResponse` or `errorResponse`)
- Include auth checks via handler options or `getRequestUser`

### **Services (Business Logic)**

**Location:** `server/lib/services/<domain>.service.ts`

**Pattern:**
```typescript
import { prisma } from '@/lib/db';

export async function doSomething(input: SomeType): Promise<ResultType> {
  // Validation (optional; can also happen in route)
  // Prisma queries
  // Side effects (email, Sheets)
  // Return result
}
```

**Rules:**
- Pure business logic — no HTTP/req/res concerns
- All database access through the Prisma singleton
- Side effects (email, Sheets) are OK but should be non-blocking
- Throw `AppError` subclasses (`ValidationError`, `NotFoundError`, etc.)
- Document parameters and return type

### **Validators (Input Schemas)**

**Location:** `server/lib/validators/index.ts` (or split by resource)

**Pattern:**
```typescript
import { z } from 'zod';

export const projectSubmitSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().optional(),
  website: z.string().url().optional().or(z.literal('')),
  categoryId: z.string().optional(),
  countryId: z.string().optional(),
  // ...
});

export type ProjectSubmitInput = z.infer<typeof projectSubmitSchema>;
```

**Rules:**
- Define schema + infer TypeScript type
- Fail fast on invalid input (Zod throws, middleware catches)
- Reuse schemas across routes (e.g., submit vs. update)

### **Frontend Pages**

**Location:** `client/src/pages/<PageName>.tsx`

**Pattern:**
```typescript
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { authenticatedFetch } from '@/utils/api';

export function MyPage() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) return;  // Wait for auth
    
    const fetch = async () => {
      try {
        const res = await authenticatedFetch(`/api/endpoint`);
        if (!res.ok) throw new Error(await res.text());
        const json = await res.json();
        setData(json.data);
      } catch (err) {
        setError(err.message);
      }
    };
    
    fetch();
  }, [user]);

  return <div>{ /* render */ }</div>;
}

export default MyPage;
```

**Rules:**
- Use `useAuth()` for current user + auth state
- Use `authenticatedFetch()` for API calls (injects Bearer token)
- Handle loading, error, and success states
- Render error messages to user

## 12.4 Git Workflow

1. **Create a branch:**
   ```bash
   git checkout -b fix/search-crash
   ```

2. **Make changes** (follow code org rules above)

3. **Test locally:**
   ```bash
   npm run dev  # Both client and server
   # Try the feature, check logs
   ```

4. **Commit with clear message:**
   ```bash
   git add .
   git commit -m "fix: transform projects in search results to match expected shape"
   ```

5. **Push and open PR:**
   ```bash
   git push origin fix/search-crash
   # Open PR on GitHub
   ```

6. **PR checklist:**
   - [ ] Tests pass locally
   - [ ] Code follows project patterns
   - [ ] Commit messages are clear
   - [ ] Related issues mentioned (e.g., "Fixes #123")

## 12.5 Debugging Tips

- **Server logs:** `npm run dev` shows request/error logs (pino)
- **Prisma Studio:** `npx prisma studio` for visual DB inspection
- **Browser DevTools:** Network tab for API requests, Console for errors
- **Database query logs:** Add `log: ['query']` to PrismaClient options
- **Email testing:** Use `POST /api/test-email` endpoint to verify Gmail config

---

# 13. Future Features & Roadmap

## 13.1 Prioritized Backlog

### **Phase 1: Critical Fixes** (Current)
- [x] Database as single source of truth (completed in testing phase)
- [ ] Fix all critical issues (section [9.1](#91-critical-issues-fix-immediately))
- [ ] Implement missing endpoints (`/api/admin/projects/*/feedback`, etc.)
- [ ] Move uploads to object storage (S3/R2/Cloudinary)

### **Phase 2: Core Features** (Next 1–2 months)
- [ ] **OAuth Login** — Implement Google + Nostr sign-in
  - Routes: `POST /api/auth/google-callback`, `POST /api/auth/nostr-callback`
  - Frontend: Add "Sign in with Google" button
  - Estimated effort: 4–6 hours

- [ ] **Project Reviews & Ratings** — Enable community feedback
  - Model exists; need API CRUD
  - Frontend: Rating widget on project pages
  - Estimated effort: 4–6 hours

- [ ] **Audit Logging** — Track all admin actions for compliance
  - Model exists; middleware to log all mutations
  - Admin UI to view audit trail
  - Estimated effort: 3–4 hours

- [ ] **Email Templates** — Refactor hardcoded HTML into template files
  - Move from inline strings to separate `.html` files
  - Support Handlebars variables
  - Estimated effort: 2–3 hours

### **Phase 3: Scalability** (2–3 months)
- [ ] **API Documentation** — OpenAPI/Swagger auto-generated from Zod schemas
  - Tool: `zod-openapi` or similar
  - Estimated effort: 2–3 hours

- [ ] **Caching Layer** — Redis for frequently accessed data (project listings, taxonomy)
  - Cache invalidation on writes
  - Estimated effort: 4–6 hours

- [ ] **Full-Text Search Optimization** — Use PostgreSQL full-text search instead of LIKE
  - Estimated effort: 2–3 hours

- [ ] **Rate Limiting** — Wire up existing `rate-limit.ts` to auth and submission endpoints
  - Estimated effort: 2–3 hours

### **Phase 4: Analytics & Insights** (3–4 months)
- [ ] **Advanced Admin Dashboard** — Charts, trends, heatmaps
  - New endpoint: `GET /api/admin/analytics`
  - Chart libraries: Recharts or Chart.js
  - Estimated effort: 6–8 hours

- [ ] **Project Analytics** — Views, claims, trending, engagement
  - Estimated effort: 4–6 hours

- [ ] **Newsletter Signup** — Capture interest in specific categories/countries
  - New model: `NewsletterSubscription`
  - Email jobs: send digests
  - Estimated effort: 4–6 hours

### **Phase 5: Community & Governance** (4–6 months)
- [ ] **User Profiles** — Public profiles, contribution history
- [ ] **Comments & Discussion** — On projects, moderated
- [ ] **Voting & Reputation** — Upvote projects, badges for top contributors
- [ ] **Disputes & Appeals** — Process for rejecting claims or suspended projects

---

## 13.2 Known Limitations & Future Considerations

| Limitation | Impact | Solution (Future) |
|-----------|--------|-------------------|
| **Uploads are ephemeral** | Logos lost on redeploy | Move to S3/R2/Cloudinary |
| **No OAuth** | Only email/password auth | Implement Google/Nostr sign-in |
| **No job queue** | Background work unreliable | Use Bull, Inngest, or similar |
| **No caching** | Repeated DB queries on high traffic | Add Redis |
| **No monitoring/alerts** | No visibility into errors | Integrate Sentry, DataDog |
| **No API rate limits** | Subject to brute-force attacks | Wire up rate-limit.ts |
| **No automated tests** | Risky refactors | Add unit + integration tests |
| **Limited analytics** | Hard to understand ecosystem growth | Build admin analytics dashboard |

---

# 14. Quick Reference: File Structure

```
directory/
├── README.md                           # Project overview
├── ROADMAP.md                          # This file
│
├── client/                             # React SPA (frontend)
│   ├── src/
│   │   ├── main.tsx                    # Entry point (React + Router + Auth)
│   │   ├── App.tsx                     # Route definitions
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   ├── ProtectedRoute.tsx
│   │   │   ├── AdminLayout.tsx
│   │   │   ├── BitcoinLiveMap.tsx
│   │   │   └── ...
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx         # JWT auth state
│   │   ├── pages/
│   │   │   ├── Home.tsx
│   │   │   ├── Directory.tsx
│   │   │   ├── SearchResults.tsx
│   │   │   ├── ViewProject.tsx
│   │   │   ├── CreateProject.tsx
│   │   │   ├── Dashboard.tsx           # User dashboard
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.tsx
│   │   │   │   ├── PendingProjects.tsx
│   │   │   │   ├── AllProjects.tsx
│   │   │   │   └── ...
│   │   │   └── ...
│   │   ├── data/
│   │   │   ├── projects.json           # Local dev export (gitignored, npm run sync)
│   │   │   ├── coordinates.json        # Map marker positions
│   │   │   └── projects.types.ts
│   │   ├── utils/
│   │   │   ├── api.ts                  # authenticatedFetch()
│   │   │   └── analytics.ts            # GA4 setup
│   │   └── styles/
│   │       ├── global.css
│   │       └── livemap.css
│   ├── vite.config.ts                  # Dev proxy config
│   ├── tsconfig.json
│   ├── index.html
│   └── package.json
│
└── server/                             # Next.js API (backend)
    ├── app/
    │   ├── api/
    │   │   ├── auth/                   # Register, login, refresh, logout
    │   │   │   ├── register/route.ts
    │   │   │   ├── login/route.ts
    │   │   │   ├── refresh/route.ts
    │   │   │   └── logout/route.ts
    │   │   ├── users/
    │   │   │   └── me/route.ts
    │   │   ├── projects/               # List, get, submit, my-projects, claim
    │   │   │   ├── route.ts            # GET (list)
    │   │   │   ├── [id]/
    │   │   │   │   ├── route.ts        # GET, PATCH, DELETE
    │   │   │   │   └── claim/
    │   │   │   ├── submit/route.ts     # POST (create)
    │   │   │   ├── my-projects/route.ts
    │   │   │   └── [id]/claim/
    │   │   ├── search/route.ts         # Full-text search
    │   │   ├── categories/route.ts     # Taxonomy
    │   │   ├── countries/route.ts
    │   │   ├── tags/route.ts
    │   │   ├── admin/                  # Admin only
    │   │   │   ├── stats/route.ts
    │   │   │   ├── projects/
    │   │   │   │   ├── pending/route.ts
    │   │   │   │   └── [id]/
    │   │   │   │       ├── approve/route.ts
    │   │   │   │       ├── reject/route.ts
    │   │   │   │       └── feedback/route.ts
    │   │   │   ├── categories/route.ts
    │   │   │   ├── countries/route.ts
    │   │   │   ├── tags/route.ts
    │   │   │   ├── users/route.ts
    │   │   │   └── claims/
    │   │   │       └── [id]/
    │   │   │           ├── approve/route.ts
    │   │   │           └── reject/route.ts
    │   │   ├── health/route.ts
    │   │   └── test-email/route.ts
    │   └── ...
    ├── lib/
    │   ├── auth/
    │   │   ├── jwt.ts                  # Token issuance/verification (jose)
    │   │   ├── middleware.ts           # getAuthenticatedUser()
    │   │   └── password.ts             # Hashing (bcryptjs)
    │   ├── db/
    │   │   └── prisma.ts               # Singleton PrismaClient
    │   ├── services/                   # Business logic layer
    │   │   ├── auth.service.ts
    │   │   ├── project.service.ts
    │   │   ├── claim.service.ts
    │   │   ├── search.service.ts
    │   │   ├── user.service.ts
    │   │   ├── category.service.ts
    │   │   ├── country.service.ts
    │   │   ├── tag.service.ts
    │   │   ├── email.service.ts
    │   │   └── googleSheets.ts
    │   ├── validators/
    │   │   └── index.ts                # Zod schemas for all inputs
    │   ├── utils/
    │   │   ├── api-handler.ts          # createApiHandler wrappers
    │   │   ├── api-response.ts         # successResponse / errorResponse
    │   │   ├── errors.ts               # AppError subclasses
    │   │   ├── logger.ts               # pino logging
    │   │   └── rate-limit.ts           # (Unused, future)
    │   └── jobs/                       # (Placeholder for background jobs)
    ├── prisma/
    │   ├── schema.prisma               # Data model
    │   ├── seed.ts                     # Database seeding
    │   ├── migrations/
    │   │   ├── 20251230075648_init/
    │   │   ├── 20260105132524_add_projects_json_fields/
    │   │   └── 20260319045645_add_project_claims/
    │   └── schema.backup.prisma        # (Stale backup)
    ├── middleware.ts                   # Global CORS + security headers
    ├── next.config.js                  # Build config + env vars (⚠️ has secrets)
    ├── tsconfig.json
    ├── jest.config.js                  # Jest config (no tests yet)
    └── package.json
```

---

# 15. Common Tasks for Agents

Quick commands for coding agents:

### **Setup**
```bash
cd directory
npm install -g @vercel/ncc  # Build CLI tools
cd server && npm install && npm run db:generate
cd ../client && npm install
```

### **Development**
```bash
cd server && npm run dev    # Terminal 1 (→ http://localhost:3000)
cd client && npm run dev    # Terminal 2 (→ http://localhost:5173)
# Open http://localhost:5173
```

### **Database**
```bash
cd server
npx prisma studio         # GUI for browsing data
npm run db:migrate        # Apply migrations
npm run db:seed           # Seed categories + countries
npm run db:generate       # Regenerate Prisma client
```

### **Testing**
```bash
cd server
npm test                  # Run Jest (no tests yet)
npm run test:watch       # Watch mode
npm run test:coverage    # Coverage report
```

### **Build & Deploy**
```bash
# Local build (test before pushing)
cd server && npm run build
cd ../client && npm run build

# Push to GitHub (Render deploys automatically)
git push origin <branch>
```

### **Common Fixes**
```bash
# Clear Next.js cache
rm -rf server/.next

# Regenerate Prisma client (if type errors)
cd server && npm run db:generate

# Reinstall dependencies (if weird errors)
rm -rf node_modules package-lock.json && npm install
```

---

---

## Final Notes for Coding Agents

1. **Always read this ROADMAP first** before making changes. It's your source of truth.

2. **Database is single source of truth.** Frontend reads exclusively from API. `projects.json` is a local dev export only (`npm run sync`).
3. **CountryProjects, InfographicMap, BitcoinLiveMap** fetch from `GET /api/projects` — not static JSON.

3. **Coordinate with team** when:
   - Adding new model fields (may require migrations)
   - Changing API endpoints (may break client)
   - Modifying auth/authorization rules
   - Deploying to production (requires env vars, migrations)

4. **Test locally first.** Use the [Testing & QA](#10-testing--qa) checklist before shipping.

5. **Follow code patterns.** Use `createApiHandler`, Zod validators, service layer, Prisma singleton.

6. **Document your changes.** Update this ROADMAP if you add features or fix major issues.

---

**Questions? Issues? Improvements to this ROADMAP?**

Open an issue or PR on [GitHub](https://github.com/CodeNaut1/directory).

**Last updated:** July 2026  
**Maintained by:** Jacy (Jacinta Idialu), African Bitcoiners
