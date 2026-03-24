# Shortly Monorepo

This repository uses npm workspaces plus Turborepo to manage the web app, API, and shared packages from a single root.

## Layout

- `apps/web` - Next.js frontend
- `apps/api` - NestJS backend
- `packages/shared` - shared code for both apps

## Setup

From the repository root:

```bash
npm install
```

## Common commands

```bash
npm run dev
npm run build
npm run lint
npm run test
```

## Notes

- Run installs from the root so npm can link workspace dependencies correctly.
- The web app runs on `3000` and the API defaults to `3001` to avoid port conflicts during local development.
- Add new app or package folders under `apps/` or `packages/` and npm will pick them up automatically.
- Turbo will run workspace tasks named `dev`, `build`, `lint`, and `test` across the repo.
