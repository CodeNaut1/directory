# Bitcoin in Africa Directory - Backend API

Backend API server for the Bitcoin in Africa Live Directory built with Next.js 15, Prisma, and PostgreSQL (Neon).

> **📊 Implementation Status:** 13/25 endpoints implemented (52%). **Core functionality is production-ready.** See [IMPLEMENTATION_STATUS.md](./IMPLEMENTATION_STATUS.md) for complete status.

## 🚀 Quick Start

### Prerequisites

- Node.js >= 18.0.0
- PostgreSQL database (Neon recommended)
- npm or yarn

### Installation

1. **Install dependencies:**
```bash
npm install
```

2. **Set up environment variables:**
```bash
cp .env.example .env
# Edit .env with your DATABASE_URL and other configurations
```

3. **Set up the database:**
```bash
npm run db:generate    # Generate Prisma client
npm run db:migrate     # Create database tables
npm run db:seed        # Seed initial data (categories, countries, tags, admin user)
```

4. **Run the development server:**
```bash
npm run dev
```

The API will be available at `http://localhost:3000/api`

---

## 📡 API Overview

All API endpoints are prefixed with `/api`. The base URL is:
- **Development**: `http://localhost:3000/api`
- **Production**: `https://your-domain.com/api`

### Response Format

All endpoints return a consistent JSON response structure:

```typescript
{
  success: boolean;
  data?: T;           // Response data (on success)
  error?: {           // Error object (on failure)
    message: string;
    code?: string;
  };
  meta?: {            // Pagination metadata (for list endpoints)
    page?: number;
    limit?: number;
    total?: number;
  };
}
```

### Authentication

Most endpoints require authentication using JWT tokens. Include the token in the `Authorization` header:

```
Authorization: Bearer <your-jwt-token>
```

Tokens are obtained through the authentication endpoints (see below).

---

## 🔐 Authentication Endpoints

> **✅ Status:** Core authentication is complete (4/6 endpoints). OAuth methods (Google, Nostr) are planned but not yet implemented.

### Register User
**POST** `/api/auth/register`

Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

---

### Login
**POST** `/api/auth/login`

Authenticate and receive tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx123...",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

**Note:** Refresh token is also set as an HTTP-only cookie.

---

### Google OAuth ⏳ (Not Yet Implemented)
**POST** `/api/auth/google`

> **Status:** Planned but not yet implemented. Will authenticate using Google OAuth when available.

**Request Body:** (when implemented)
```json
{
  "idToken": "google-id-token"
}
```

**Response:** Same as login

---

### Nostr Authentication ⏳ (Not Yet Implemented)
**POST** `/api/auth/nostr`

> **Status:** Planned but not yet implemented. Will authenticate using Nostr protocol when available.

**Request Body:** (when implemented)
```json
{
  "pubkey": "nostr-public-key",
  "signature": "signed-message"
}
```

**Response:** Same as login

---

### Refresh Token
**POST** `/api/auth/refresh`

Get a new access token using refresh token.

**Headers:**
- `Cookie: refreshToken=<refresh-token>` (HTTP-only cookie)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc..."
  }
}
```

---

### Logout
**POST** `/api/auth/logout`

Invalidate tokens and log out.

**Headers:**
- `Authorization: Bearer <access-token>`
- `Cookie: refreshToken=<refresh-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Logged out successfully"
  }
}
```

---

## 👤 User Endpoints

### Get Current User
**GET** `/api/users/me`

Get the authenticated user's profile.

**Headers:**
- `Authorization: Bearer <access-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Doe",
    "avatar": "https://...",
    "role": "user",
    "emailVerified": "2024-01-01T00:00:00Z",
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

---

### Update Current User
**PATCH** `/api/users/me`

Update the authenticated user's profile.

**Headers:**
- `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "https://..."
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "email": "user@example.com",
    "name": "John Updated",
    "avatar": "https://...",
    "role": "user"
  }
}
```

---

## 📁 Metadata Endpoints (Public)

### Get Categories
**GET** `/api/categories`

Get all project categories.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "name": "Exchange",
      "slug": "exchange",
      "description": "Bitcoin exchanges and trading platforms",
      "icon": "icon-url",
      "order": 1
    },
    {
      "id": "clx456...",
      "name": "Wallet",
      "slug": "wallet",
      "description": "Bitcoin wallets and custody solutions",
      "icon": "icon-url",
      "order": 2
    }
  ]
}
```

---

### Get Countries
**GET** `/api/countries`

Get all African countries.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "code": "NG",
      "name": "Nigeria",
      "flag": "🇳🇬"
    },
    {
      "id": "clx456...",
      "code": "ZA",
      "name": "South Africa",
      "flag": "🇿🇦"
    }
  ]
}
```

---

### Get Tags
**GET** `/api/tags`

Get all available tags.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "name": "Lightning Network",
      "slug": "lightning-network"
    },
    {
      "id": "clx456...",
      "name": "Bitcoin Only",
      "slug": "bitcoin-only"
    }
  ]
}
```

---

## 🚀 Project Endpoints (Public)

### List Projects
**GET** `/api/projects`

Get paginated list of published projects.

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `limit` (number, default: 20) - Items per page
- `category` (string) - Filter by category slug
- `country` (string) - Filter by country code
- `tag` (string) - Filter by tag slug
- `search` (string) - Search in name and description
- `featured` (boolean) - Show only featured projects
- `sort` (string) - Sort order: `newest`, `oldest`, `name`

**Example:** `GET /api/projects?page=1&limit=10&category=exchange&country=NG`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "name": "Bitcoin Exchange Africa",
      "slug": "bitcoin-exchange-africa",
      "description": "Leading Bitcoin exchange in Africa",
      "website": "https://example.com",
      "logo": "https://...",
      "coverImage": "https://...",
      "published": true,
      "featured": true,
      "verified": true,
      "country": {
        "code": "NG",
        "name": "Nigeria",
        "flag": "🇳🇬"
      },
      "category": {
        "name": "Exchange",
        "slug": "exchange"
      },
      "tags": [
        { "name": "Trading", "slug": "trading" }
      ],
      "createdAt": "2024-01-01T00:00:00Z",
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 50
  }
}
```

---

### Get Project by ID
**GET** `/api/projects/:id`

Get a single project by ID or slug.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "name": "Bitcoin Exchange Africa",
    "slug": "bitcoin-exchange-africa",
    "description": "Leading Bitcoin exchange in Africa",
    "website": "https://example.com",
    "logo": "https://...",
    "coverImage": "https://...",
    "published": true,
    "featured": true,
    "verified": true,
    "country": {
      "id": "clx456...",
      "code": "NG",
      "name": "Nigeria",
      "flag": "🇳🇬"
    },
    "category": {
      "id": "clx789...",
      "name": "Exchange",
      "slug": "exchange"
    },
    "tags": [
      { "id": "clx111...", "name": "Trading", "slug": "trading" }
    ],
    "details": {
      "longDescription": "Extended description...",
      "socialLinks": {
        "twitter": "https://twitter.com/...",
        "github": "https://github.com/..."
      },
      "contactEmail": "contact@example.com",
      "bitcoinOnly": true,
      "lightningNetwork": true
    },
    "user": {
      "id": "clx222...",
      "name": "Project Owner",
      "email": "owner@example.com"
    },
    "createdAt": "2024-01-01T00:00:00Z",
    "publishedAt": "2024-01-01T00:00:00Z"
  }
}
```

---

## 🏗️ Project Builder Endpoints (Authenticated)

**Note:** These endpoints require authentication and the user must have `builder` role or be the project owner.

### Create Project
**POST** `/api/projects`

Create a new project (initially as draft).

**Headers:**
- `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "name": "My Bitcoin Project",
  "description": "A great Bitcoin project",
  "website": "https://example.com",
  "logo": "https://...",
  "coverImage": "https://...",
  "countryId": "clx123...",
  "categoryId": "clx456...",
  "city": "Lagos",
  "address": "123 Main St",
  "tagIds": ["clx789...", "clx111..."],
  "details": {
    "longDescription": "Extended description...",
    "socialLinks": {
      "twitter": "https://twitter.com/...",
      "github": "https://github.com/..."
    },
    "contactEmail": "contact@example.com",
    "bitcoinOnly": true,
    "lightningNetwork": true
  }
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx999...",
    "name": "My Bitcoin Project",
    "slug": "my-bitcoin-project",
    "published": false,
    "featured": false,
    "verified": false
  }
}
```

---

### Update Project
**PATCH** `/api/projects/:id`

Update an existing project (must be owner).

**Headers:**
- `Authorization: Bearer <access-token>`

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Project Name",
  "description": "Updated description",
  "website": "https://new-website.com",
  "countryId": "clx123...",
  "categoryId": "clx456...",
  "tagIds": ["clx789..."]
}
```

**Response:** `200 OK` (updated project object)

---

### Submit Project for Review
**POST** `/api/projects/:id/submit`

Submit a project for moderation/approval.

**Headers:**
- `Authorization: Bearer <access-token>`

**Request Body:** (optional)
```json
{
  "notes": "Please review this project"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Project submitted for review",
    "submission": {
      "id": "clx123...",
      "status": "pending",
      "projectId": "clx999..."
    }
  }
}
```

---

### Delete Project
**DELETE** `/api/projects/:id`

Delete a project (must be owner).

**Headers:**
- `Authorization: Bearer <access-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Project deleted successfully"
  }
}
```

---

## 🔍 Search Endpoint (Public)

### Search Projects
**GET** `/api/search`

Full-text search across projects.

**Query Parameters:**
- `q` (string, required) - Search query
- `page` (number, default: 1)
- `limit` (number, default: 20)
- `category` (string) - Filter by category
- `country` (string) - Filter by country
- `tag` (string) - Filter by tag

**Example:** `GET /api/search?q=bitcoin+exchange&category=exchange&country=NG`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "name": "Bitcoin Exchange Africa",
      "slug": "bitcoin-exchange-africa",
      "description": "Leading Bitcoin exchange...",
      "country": { "name": "Nigeria", "code": "NG" },
      "category": { "name": "Exchange", "slug": "exchange" }
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 5
  }
}
```

---

## ⭐ Review Endpoints ⏳ (Not Yet Implemented)

> **Status:** Review functionality is planned but not yet implemented.

### Get Project Reviews
**GET** `/api/projects/:id/reviews`

Get all published reviews for a project.

**Query Parameters:**
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "rating": 5,
      "title": "Great project!",
      "comment": "Really impressed with this service",
      "user": {
        "id": "clx456...",
        "name": "John Doe",
        "avatar": "https://..."
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 10
  }
}
```

---

### Create Review
**POST** `/api/projects/:id/reviews`

Create a review for a project (authenticated users only).

**Headers:**
- `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "rating": 5,
  "title": "Great project!",
  "comment": "Really impressed with this service"
}
```

**Validation:**
- `rating`: Required, integer between 1-5
- `title`: Optional, string (max 200 chars)
- `comment`: Optional, string

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": "clx123...",
    "rating": 5,
    "title": "Great project!",
    "comment": "Really impressed with this service",
    "published": true,
    "createdAt": "2024-01-01T00:00:00Z"
  }
}
```

**Note:** Users can only submit one review per project.

---

## 👨‍💼 Admin/Moderation Endpoints ⏳ (Not Yet Implemented)

> **Status:** Admin/moderation endpoints are planned but not yet implemented. Submission approval/rejection can be done via database directly for now.

**Note:** These endpoints require `moderator` or `admin` role (when implemented).

### Get Submissions
**GET** `/api/admin/submissions`

Get all project submissions for moderation.

**Headers:**
- `Authorization: Bearer <access-token>`

**Query Parameters:**
- `status` (string) - Filter by status: `pending`, `approved`, `rejected`
- `page` (number, default: 1)
- `limit` (number, default: 20)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "clx123...",
      "status": "pending",
      "project": {
        "id": "clx456...",
        "name": "New Bitcoin Project",
        "slug": "new-bitcoin-project"
      },
      "user": {
        "id": "clx789...",
        "name": "Project Owner",
        "email": "owner@example.com"
      },
      "createdAt": "2024-01-01T00:00:00Z"
    }
  ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 15
  }
}
```

---

### Approve Submission
**POST** `/api/admin/submissions/:id/approve`

Approve a project submission (publishes the project).

**Headers:**
- `Authorization: Bearer <access-token>`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Submission approved and project published",
    "submission": {
      "id": "clx123...",
      "status": "approved",
      "moderatedAt": "2024-01-01T00:00:00Z"
    },
    "project": {
      "id": "clx456...",
      "published": true,
      "publishedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

### Reject Submission
**POST** `/api/admin/submissions/:id/reject`

Reject a project submission.

**Headers:**
- `Authorization: Bearer <access-token>`

**Request Body:**
```json
{
  "reason": "Project does not meet our guidelines"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Submission rejected",
    "submission": {
      "id": "clx123...",
      "status": "rejected",
      "rejectionReason": "Project does not meet our guidelines",
      "moderatedAt": "2024-01-01T00:00:00Z"
    }
  }
}
```

---

## 📊 Analytics Endpoints ⏳ (Not Yet Implemented)

> **Status:** Analytics tracking is planned but not yet implemented.

### Track Project View
**POST** `/api/analytics/view`

Track when a project is viewed.

**Request Body:**
```json
{
  "projectId": "clx123...",
  "referrer": "https://google.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "View tracked"
  }
}
```

---

### Track Project Click
**POST** `/api/analytics/click`

Track when a user clicks on a project's website link.

**Request Body:**
```json
{
  "projectId": "clx123...",
  "url": "https://example.com"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "message": "Click tracked"
  }
}
```

---

## 🏥 Health Check

### Health Check
**GET** `/api/health`

Check API health status.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "status": "ok",
    "timestamp": "2024-01-01T00:00:00Z",
    "uptime": 12345.67
  }
}
```

---

## 🔒 User Roles

The API uses role-based access control:

- **user** - Regular user (default role)
- **builder** - Project owner/creator
- **moderator** - Can approve/reject submissions
- **admin** - Full system access

Role hierarchy: `user < builder < moderator < admin`

---

## 📝 Data Models

### User
```typescript
{
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  role: "user" | "builder" | "moderator" | "admin";
  emailVerified?: string; // ISO date
  createdAt: string; // ISO date
  updatedAt: string; // ISO date
}
```

### Project
```typescript
{
  id: string;
  name: string;
  slug: string;
  description: string;
  website?: string;
  logo?: string;
  coverImage?: string;
  published: boolean;
  featured: boolean;
  verified: boolean;
  countryId: string;
  categoryId: string;
  userId: string;
  createdAt: string; // ISO date
  publishedAt?: string; // ISO date
}
```

### Category
```typescript
{
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  order: number;
}
```

### Country
```typescript
{
  id: string;
  code: string; // ISO 3166-1 alpha-2 (e.g., "NG", "ZA")
  name: string;
  flag?: string; // Emoji or URL
}
```

### Tag
```typescript
{
  id: string;
  name: string;
  slug: string;
}
```

### Review
```typescript
{
  id: string;
  projectId: string;
  userId: string;
  rating: number; // 1-5
  title?: string;
  comment?: string;
  published: boolean;
  createdAt: string; // ISO date
}
```

---

## ⚠️ Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  }
}
```

### Common HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error or invalid input
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Insufficient permissions
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate email)
- `500 Internal Server Error` - Server error

### Common Error Codes

- `VALIDATION_ERROR` - Input validation failed
- `AUTHENTICATION_ERROR` - Invalid or missing authentication
- `AUTHORIZATION_ERROR` - Insufficient permissions
- `NOT_FOUND` - Resource not found
- `CONFLICT` - Resource conflict
- `RATE_LIMIT_EXCEEDED` - Too many requests

---

## 📚 Project Structure

```
server/
├── app/
│   ├── api/              # API route handlers
│   │   ├── auth/         # Authentication endpoints
│   │   ├── users/        # User endpoints
│   │   ├── projects/     # Project endpoints
│   │   ├── categories/   # Category endpoints
│   │   ├── countries/    # Country endpoints
│   │   ├── tags/         # Tag endpoints
│   │   ├── search/       # Search endpoint
│   │   ├── reviews/      # Review endpoints
│   │   ├── admin/        # Admin/moderation endpoints
│   │   └── analytics/    # Analytics endpoints
│   └── ...
├── lib/
│   ├── db/               # Database utilities (Prisma)
│   ├── auth/             # Authentication utilities
│   ├── validators/       # Zod validation schemas
│   ├── services/         # Business logic layer
│   ├── jobs/             # Background jobs
│   └── utils/            # Utility functions
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seed script
└── tests/                # Test files
```

---

## 🛠️ Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema changes (dev only)
- `npm run db:studio` - Open Prisma Studio (database GUI)
- `npm run db:seed` - Seed the database with initial data
- `npm run db:test` - Test database connection
- `npm test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

---

## 🔧 Environment Variables

See `.env.example` for all required environment variables. Key variables:

- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret for JWT signing
- `JWT_REFRESH_SECRET` - Secret for refresh tokens
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `NODE_ENV` - Environment (development/production)
- `ALLOWED_ORIGIN` - CORS allowed origin

---

## 📖 Additional Resources

- [Implementation Status](./IMPLEMENTATION_STATUS.md) - **Current status: what's ready vs pending**
- [Development Roadmap](./ROADMAP.md) - Complete roadmap
- [Setup Verification Guide](./VERIFY_SETUP.md) - How to verify everything works
- [Phase Status Documents](./PHASE1_STATUS.md) - Detailed phase completion status

---

## 🤝 Frontend Integration Tips

1. **Token Storage**: Store access tokens in memory or secure storage (not localStorage for XSS protection). Refresh tokens are HTTP-only cookies.

2. **Token Refresh**: Implement automatic token refresh before expiration. Use the `/api/auth/refresh` endpoint.

3. **Error Handling**: Always check the `success` field in responses. Handle errors gracefully with user-friendly messages.

4. **Pagination**: Use the `meta` field for pagination controls. Most list endpoints support `page` and `limit` query parameters.

5. **Image Uploads**: Image upload endpoints are not yet implemented. For now, use external URLs for `logo` and `coverImage` fields.

6. **Real-time Updates**: The API is RESTful. For real-time features, implement polling or consider adding WebSocket support later.

7. **Rate Limiting**: Be mindful of rate limits, especially on authentication endpoints. Implement exponential backoff for retries.

---

## 🐛 Troubleshooting

### Common Issues

**401 Unauthorized**
- Check if token is included in `Authorization` header
- Verify token hasn't expired
- Use refresh token to get new access token

**403 Forbidden**
- Verify user has required role/permissions
- Check if user owns the resource (for update/delete operations)

**404 Not Found**
- Verify endpoint URL is correct
- Check if resource ID exists
- Ensure resource is published (for public endpoints)

**500 Internal Server Error**
- Check server logs
- Verify database connection
- Ensure environment variables are set

---

## 📄 License

[Add your license here]

---

**Need help?** Check the [ROADMAP.md](./ROADMAP.md) for implementation details or open an issue.
