# 🔗 Shortly

> A full-stack URL shortener with built-in click analytics. Turn any long URL into a short link, share it anywhere, and track every click — device, browser, and referrer — in real time.

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.1-E0234E?logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-7.5-2D3748?logo=prisma)](https://www.prisma.io/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Redis](https://img.shields.io/badge/Redis-ioredis-DC382D?logo=redis)](https://redis.io/)

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Architecture](#-architecture)
- [Database Schema](#-database-schema)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Available Scripts](#-available-scripts)
- [API Reference](#-api-reference)

---

## 🎯 Overview

Shortly is a monorepo combining a **Next.js** frontend with a **NestJS** API backend. Users register, shorten URLs with optional custom codes and expiry dates, and then explore per-link analytics — clicks over time, top countries, devices, and referrers — all without leaving the dashboard.

### What Makes This Interesting?

- **Redis-first redirect** — short code lookups are served from an in-memory cache; Postgres is only hit on a cold miss, making redirects sub-millisecond in practice
- **Separate analytics storage** — click events land in MongoDB so heavy aggregation queries never touch the relational DB
- **Monorepo with Turborepo** — a single `npm run dev` boots both the Next.js app and the NestJS API in parallel
- **Prisma 7 at root** — schema, migrations, and generated client live at the repo root and are shared across workspaces

---

## ✨ Key Features

### 🔗 Link Management

- Create short links with auto-generated or custom codes
- Optional title, description, and expiry date per link
- Toggle link active/inactive without deleting
- Delete with cache invalidation
- Paginated link list per authenticated user

### 📊 Click Analytics

- Every redirect asynchronously records a click event to MongoDB
- Tracked fields: IP, browser, OS, device type, referrer (country/city are stored as `unknown` until a geo-IP source is added)
- Per-link summary: total clicks, unique IPs, clicks today, top countries, top referrers
- Timeline endpoint: clicks grouped by day for 7 / 30 / 90-day windows

### ⚡ Redirect Engine

- `GET /:shortCode` resolves outside the `/api` prefix for clean short URLs
- Redis cache checked first; on miss, Postgres is queried and the result is cached with a 24-hour TTL
- Returns `302 Found` on hit, `404` if the code does not exist, `410 Gone` if the link is inactive or expired

### 🔐 Authentication

- Email/password registration with bcrypt-hashed passwords
- JWT access tokens (short-lived) + refresh tokens (stored as hashed values, 30-day expiry)
- Token rotation on refresh — old token is revoked, new one issued
- Logout invalidates the refresh token server-side

### 🛡️ Security & Rate Limiting

- Global rate limiting via `@nestjs/throttler` (configurable TTL and limit per env)
- CORS restricted to `CORS_ORIGIN` env variable
- Refresh tokens stored as hashes, never as plain values
- `RefreshToken.revokedAt` field enables explicit token revocation

---

## 🛠️ Tech Stack

| Layer         | Technology                          | Version             |
| ------------- | ----------------------------------- | ------------------- |
| Monorepo      | npm workspaces + Turborepo          | npm@11.8.0 / ^2.5.8 |
| API framework | NestJS                              | ^11.1.17            |
| Web framework | Next.js (App Router)                | 16.2.1              |
| UI library    | React / React DOM                   | 19.2.4              |
| ORM           | Prisma + @prisma/client             | ^7.5.0              |
| SQL adapter   | @prisma/adapter-pg / pg             | ^7.5.0 / ^8.20.0    |
| SQL database  | PostgreSQL                          | —                   |
| MongoDB ODM   | Mongoose / @nestjs/mongoose         | ^9.3.2 / ^11.0.4    |
| Redis client  | ioredis                             | ^5.10.1             |
| Auth          | @nestjs/jwt + @nestjs/passport      | —                   |
| Validation    | class-validator / class-transformer | —                   |
| UI components | shadcn/ui + next-themes             | —                   |

---

## 🏗️ Architecture

### System Overview

```
┌──────────────────────────────────────────────────────────┐
│                     Client (Next.js)                     │
│              App Router · shadcn/ui · React 19           │
└────────────────────────┬─────────────────────────────────┘
                         │ HTTP
┌────────────────────────▼─────────────────────────────────┐
│                    NestJS API  :3001                      │
│  global prefix: /api                                     │
│                                                          │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐ │
│  │ AuthModule  │  │ LinksModule │  │ClickEventsModule │ │
│  │ /auth/*     │  │ /links/*    │  │  (internal only) │ │
│  └──────┬──────┘  └──────┬──────┘  └────────┬─────────┘ │
└─────────┼────────────────┼───────────────────┼───────────┘
          │                │                   │
    ┌─────▼──────┐  ┌──────▼──────┐   ┌───────▼────────┐
    │ PostgreSQL │  │    Redis    │   │    MongoDB     │
    │  (Prisma)  │  │  (ioredis) │   │   (Mongoose)   │
    │            │  │            │   │                │
    │ users      │  │ shortCode  │   │ click_events   │
    │ links      │  │  → url     │   │                │
    │ refresh_   │  │ (TTL 24h)  │   │                │
    │  tokens    │  └────────────┘   └────────────────┘
    └────────────┘
```

### Redirect Flow (Critical Path)

```
GET /:shortCode
      │
      ▼
Redis GET shortCode ──hit──▶ 302 redirect
      │                            │
     miss                    async fire-and-forget
      │                            │
      ▼                      MongoDB.insert(clickEvent)
Postgres findUnique(code)
      │
   not found ──▶ 404
      │
   inactive / expired ──▶ 410
      │
  found & active
      │
Redis SET shortCode url EX 86400
      │
      ▼
302 redirect ──▶ async MongoDB.insert(clickEvent)
```

### Authentication Flow

```
POST /api/auth/register
  → hash password (bcrypt)
  → Prisma.user.create
  → issue accessToken (JWT, short-lived)
  → hash refreshToken → Prisma.refreshToken.create
  → return { accessToken, refreshToken }

POST /api/auth/refresh
  → hash incoming token → Prisma.refreshToken.findUnique
  → verify not expired, not revoked
  → Prisma.refreshToken.update({ revokedAt: now })   ← rotate
  → create new refreshToken pair
  → return { accessToken, refreshToken }
```

---

## 🗄️ Database Schema

### PostgreSQL (Prisma)

```prisma
model User {
  id            String         @id @default(cuid())
  email         String         @unique
  passwordHash  String
  name          String?
  createdAt     DateTime       @default(now())
  updatedAt     DateTime       @updatedAt
  links         Link[]
  refreshTokens RefreshToken[]

  @@map("users")
}

model Link {
  id          String    @id @default(cuid())
  code        String    @unique         // short code, e.g. "xK9mP2"
  originalUrl String
  title       String?
  description String?
  expiresAt   DateTime?
  clicks      Int       @default(0)    // denormalised counter
  isActive    Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  userId      String?
  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([userId])
  @@map("links")
}

model RefreshToken {
  id        String    @id @default(cuid())
  tokenHash String    @unique           // SHA-256 hash, never plain text
  expiresAt DateTime
  revokedAt DateTime?                   // set on rotation or logout
  createdAt DateTime  @default(now())
  userId    String
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId])
  @@index([expiresAt])
  @@map("refresh_tokens")
}
```

### MongoDB (Mongoose)

Collection: `click_events` — `apps/api/src/features/click-events/click-event.schema.ts`

```ts
{
    linkId: string; // references Link.id from Postgres
    ip: string;
    country: string;
    city: string;
    browser: string;
    os: string;
    device: string; // "desktop" | "mobile" | "tablet"
    referer: string;
    createdAt: Date; // default: Date.now
}
```

### Redis

Key pattern: `shortCode` → `originalUrl` with `EX 86400` (24-hour TTL).
Keys are deleted on link update or deactivation to prevent stale cache hits.

---

## 📁 Project Structure

```
.
├── apps/
│   ├── api/                        # NestJS API — port 3001
│   │   ├── src/
│   │   │   ├── app.module.ts       # Root module (ConfigModule, MongooseModule,
│   │   │   │                       #   RedisModule, PrismaModule, AuthModule,
│   │   │   │                       #   LinksModule, ThrottlerModule)
│   │   │   ├── main.ts             # Bootstrap, global prefix "/api",
│   │   │   │                       #   redirect handler for /:shortCode
│   │   │   ├── config/             # env validation, Prisma service, Redis module
│   │   │   └── features/
│   │   │       ├── auth/           # register, login, me, refresh, logout
│   │   │       ├── links/          # CRUD + redirect logic + cache invalidation
│   │   │       └── click-events/   # Mongoose schema + analytics aggregations
│   │   └── test/                   # e2e tests
│   │
│   └── web/                        # Next.js 16 — port 3000 (App Router)
│       └── src/
│           ├── app/                # Route segments
│           ├── components/         # Shared UI components
│           ├── features/           # Feature-scoped components & hooks
│           └── lib/                # API client, utils
│
├── packages/
│   └── shared/                     # Shared types/utils (no package.json yet)
│
├── prisma/
│   ├── schema.prisma               # Single source of truth for PG schema
│   ├── seed.ts                     # Dev seed data
│   └── migrations/                 # Prisma migration history
│
├── generated/
│   └── prisma/                     # Generated Prisma client output
│
├── prisma.config.ts                # Prisma 7 defineConfig (schema path, migrations path)
├── turbo.json                      # Turborepo task pipeline
├── package.json                    # Root — workspaces, shared devDeps, scripts
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 22.12+
- npm 11+
- Docker (for PostgreSQL, MongoDB and Redis via `compose.yaml`)

### 1. Clone

```bash
git clone https://github.com/kotlovyim-dev/shortly.git
cd shortly
```

### 2. Install

```bash
npm install
```

### 3. Configure environment and start databases

```bash
cp .env.example .env   # dev defaults; compose.yaml reads the same file
npm run db:up          # PostgreSQL, MongoDB, Redis
```

The API loads env from `apps/api/.env`, falling back to `.env` at the root.

### 4. Run migrations

```bash
npm run db:migrate
```

### 5. Seed database (optional)

```bash
npx prisma db seed
```

### 6. Start development servers

```bash
npm run dev
```

| Service       | URL                       |
| ------------- | ------------------------- |
| Web (Next.js) | http://localhost:3000     |
| API (NestJS)  | http://localhost:3001     |
| API base path | http://localhost:3001/api |

---

## 🔐 Environment Variables

| Variable         | Required | Default                 | Description                       |
| ---------------- | -------- | ----------------------- | --------------------------------- |
| `DATABASE_URL`   | ✅       | —                       | PostgreSQL connection string      |
| `MONGODB_URI`    | ✅       | —                       | MongoDB connection string         |
| `REDIS_URL`      | ✅       | —                       | Redis connection string           |
| `JWT_SECRET`     | ✅       | —                       | Access-token signing secret, ≥ 32 chars |
| `PORT`           | ❌       | `3001`                  | NestJS listen port                |
| `CORS_ORIGIN`    | ❌       | `http://localhost:3000` | Allowed CORS / CSRF origin (the web app) |
| `NODE_ENV`       | ❌       | `development`           | Node environment                  |
| `THROTTLE_TTL`   | ❌       | `60000`                 | Rate limit window in ms           |
| `THROTTLE_LIMIT` | ❌       | `120`                   | Max requests per window (auth: 10/min) |
| `TRUST_PROXY`    | ❌       | —                       | Comma-separated proxy IPs/CIDRs for `req.ip` |
| `ANALYTICS_RETENTION_DAYS` | ❌ | `90`               | Click events are deleted after this many days |
| `NEXT_PUBLIC_API_BASE_URL` | ❌ | `http://localhost:3001` | Web: API origin              |
| `NEXT_PUBLIC_WEB_BASE_URL` | ❌ | `http://localhost:3000` | Web: origin shown in short URLs |

---

## 📜 Available Scripts

### Root

```bash
npm run dev              # Start all workspaces in parallel (Turborepo)
npm run build            # Build all workspaces
npm run lint             # Lint all workspaces
npm run test             # Test all workspaces
npm run check            # lint + test + build (what CI runs)
npm run db:up            # Start PostgreSQL, MongoDB, Redis (docker compose)
npm run db:migrate       # Apply Prisma migrations
```

### API workspace

```bash
npm run dev:api                      # NestJS watch mode
npm run build:api                    # Compile to dist/
npm run start:api                    # Start compiled build (prod)
npm run lint:api                     # ESLint
npm run test:api                     # Unit + e2e tests (Jest)
npm run test:e2e:api                 # End-to-end tests
npm run seed --workspace=apps/api    # Seed the database
```

### Web workspace

```bash
npm run dev:web          # Next.js dev server
npm run build:web        # Production build
npm run start:web        # Start production server
npm run lint:web         # ESLint
```

---

## 📡 API Reference

### Auth — `/api/auth`

| Method | Path                 | Auth | Description                        |
| ------ | -------------------- | ---- | ---------------------------------- |
| `POST` | `/api/auth/register` | —    | Create account, sets auth cookies  |
| `POST` | `/api/auth/login`    | —    | Login, sets auth cookies           |
| `GET`  | `/api/auth/me`       | JWT  | Get current user                   |
| `POST` | `/api/auth/refresh`  | —    | Rotate refresh token               |
| `POST` | `/api/auth/logout`   | JWT  | Revoke refresh token               |

### Links — `/api/links`

| Method   | Path             | Auth | Description                          |
| -------- | ---------------- | ---- | ------------------------------------ |
| `POST`   | `/api/links`     | JWT  | Create a new short link              |
| `GET`    | `/api/links`     | JWT  | List own links (`page`, `limit`, `q` search) |
| `GET`    | `/api/links/:id` | JWT  | Get one own link                     |
| `PATCH`  | `/api/links/:id` | JWT  | Update title / isActive / expiresAt  |
| `DELETE` | `/api/links/:id` | JWT  | Delete link, its clicks, and cache   |
| `GET`    | `/api/links/:id/stats` | JWT | Totals, unique IPs, today, top referrers/countries/devices/browsers |
| `GET`    | `/api/links/:id/timeline?days=7\|30\|90` | JWT | Clicks per day (UTC), zero-filled |

Tokens are never returned in response bodies; they live in `httpOnly` cookies.

### Redirect

| Method | Path          | Auth | Description                                  |
| ------ | ------------- | ---- | -------------------------------------------- |
| `GET`  | `/:shortCode` | —    | Resolve and redirect (`302` / `404` / `410`) |

> There is no global `/api` prefix: API controllers declare `api/...` themselves, so the root `/:shortCode` redirect stays clean (e.g. `http://localhost:3001/xK9mP2`).

### Analytics _(coming soon)_

Aggregation endpoints backed by MongoDB — summary and timeline per link are implemented in `ClickEventsModule` and will be exposed via a dedicated controller.

---

## 📄 License

MIT
