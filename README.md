# Sahil Productivity OS — Next.js (unified)

Single Next.js 16 App Router app: frontend, API routes, and database all in one project. This replaces the earlier two-server setup (`backend/` NestJS + `frontend/` Vite) with one `next dev` p rocess.    

## Stack

- **Next.js 16** (App Router, Turbopack), React 19, TypeScript
- **Prisma 5 + SQLite** (pinned to v5 — Prisma 7 requires a driver-adapter rewrite that wasn't in scope for this port)
- **Route Handlers** (`app/api/**/route.ts`) instead of NestJS controllers; **Zod** instead of class-validator DTOs
- **`proxy.ts`** (Next 16 renamed `middleware.ts` → `proxy.ts`) for auth-gated route redirects
- **`instrumentation.ts`** runs the in-app notification generator on a 5-minute `setInterval` — the in-process replacement for `@nestjs/schedule`, since this runs as a persistent Node server rather than serverless functions
- Same frontend stack as before: Tailwind v4, Radix primitives, React Query, React Hook Form + Zod, Recharts

## Running

```bash
cd web
npm install
npx prisma migrate dev   # first time only — creates prisma/dev.db
npm run dev
```

Open http://localhost:3000. One process, one port — no CORS, no dev proxy config needed (API routes are same-origin by construction).

## What changed vs. the NestJS + Vite version

- **Auth**: JWT verify/sign moved to `lib/auth.ts`; the httpOnly cookie is set via `(await cookies()).set(...)` in the login/register Route Handlers. `proxy.ts` verifies the cookie before any protected page renders and redirects to `/login` if missing/invalid (mirrors what the old `JwtAuthGuard` + client-side `ProtectedRoute` did together).
- **Business logic**: every NestJS service (`tasks`, `dsa`, `jobs`, `learning`, `goals`, `dashboard`, `reports`, `notifications`) ported near-verbatim into `lib/services/*.ts` as plain functions — the smart-planner, focus-hours bucketing, and local-timezone date handling are unchanged.
- **Pages**: routing moved from React Router to file-based App Router (`app/(app)/*`, `app/(auth)/*`). Nearly every component stays a Client Component (`'use client'`) since this app is timer/form/live-query heavy — there's little to gain chasing Server Components here, so data fetching still goes through React Query hitting the new same-origin `/api/*` routes.
- **Cron**: see `instrumentation.ts` above.

## Project layout

```
app/
  (auth)/login, (auth)/register        — public pages
  (app)/*                               — sidebar-wrapped pages (dashboard, schedule, ...)
  api/**/route.ts                       — REST endpoints, one folder per resource
lib/
  services/*.ts                         — business logic (ported from NestJS services)
  auth.ts, errors.ts, prisma.ts         — cross-cutting helpers
  date-utils.ts, enums.ts, utils.ts, badges.tsx, api.ts
components/                             — ui primitives, layout, and per-domain form dialogs
proxy.ts, instrumentation.ts            — route protection + background notification job
```

## Migration note

This app replaced an earlier two-server setup (NestJS backend + Vite frontend). That code has been removed — this is the only version now.
