# Quick Task 260326-nvk Summary

## Description
Сторінки auth (login/register), axios interceptor refresh, рефакторинг хуків/утиліт.

## Completed
- Added register page at apps/web/src/app/auth/register/page.tsx with React Hook Form + Zod and fields name/email/password/confirmPassword.
- Added login page at apps/web/src/app/auth/login/page.tsx with email/password and explicit 401 error handling.
- Added reusable auth hooks, schemas, and API module under apps/web/src/features/auth.
- Replaced apps/web/src/lib/api.ts with axios instance interceptors:
  - Request interceptor injects Authorization: Bearer <token>
  - Response interceptor handles 401 via /api/auth/refresh retry and redirects to /login on failure.
- Added /login alias route and /dashboard page for post-auth redirect target.

## Verification
- npm run lint --workspace web
- No TypeScript/ESLint errors reported for changed auth files.

## Notes
- GSD quick init reported roadmap_exists=false before execution; project planning bootstrap files were added under .planning to enable quick-task tracking.
