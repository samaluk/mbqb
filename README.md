# MBQB

Monorepo for the MBQB public site and CMS.

CI runs on GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): lint, format, typecheck, fallow checks, unit tests, production build (with migrations), integration tests, and Playwright E2E tests against PostGIS.

## Development

```sh
pnpm install
```

Environment variables and local setup: [apps/web/README.md](apps/web/README.md).

```sh
pnpm dev
```
