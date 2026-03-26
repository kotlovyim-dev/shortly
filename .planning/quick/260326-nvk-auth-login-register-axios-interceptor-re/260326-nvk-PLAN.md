# Quick Task 260326-nvk Plan

## Goal
Implement Next.js auth pages (register/login), axios auth interceptor with refresh flow, and split auth logic into reusable hooks/utils.

## Tasks
1. Build auth data layer
- files: apps/web/src/lib/api.ts, apps/web/src/features/auth/api/*, apps/web/src/features/auth/utils/*, apps/web/src/features/auth/types/*
- action: create axios instance with request/response interceptors, token storage helpers, and typed auth API calls.
- verify: 401 responses trigger refresh once, failed refresh redirects to /login.
- done: completed.

2. Build reusable auth form logic
- files: apps/web/src/features/auth/schemas/*, apps/web/src/features/auth/hooks/*
- action: add zod schemas and React Hook Form hooks for login and register.
- verify: register validates confirmPassword; login shows dedicated 401 message.
- done: completed.

3. Build auth pages and route targets
- files: apps/web/src/features/auth/components/*, apps/web/src/app/auth/login/page.tsx, apps/web/src/app/auth/register/page.tsx, apps/web/src/app/login/page.tsx, apps/web/src/app/dashboard/page.tsx
- action: create styled pages based on existing landing visual language and wire submit success to /dashboard.
- verify: lint passes and pages compile.
- done: completed.
