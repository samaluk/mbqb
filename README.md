# MBQB

Monorepo for the MBQB public site and CMS.

## Toolchain

Node and pnpm versions are defined only in the root [`package.json`](package.json):

- **Node** — `engines.node` (use [Corepack](https://nodejs.org/api/corepack.html) or install that exact version locally)
- **pnpm** — `packageManager` (Corepack activates this version automatically)

CI reads both fields via [`.github/actions/setup-toolchain`](.github/actions/setup-toolchain). Docker images must stay aligned with `engines.node` (see comments in `apps/web/Dockerfile`).

CI runs on GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)): lint, format, typecheck, fallow checks, unit tests, production build (with migrations), integration tests, and Playwright E2E tests against PostGIS.

## Development

```sh
pnpm install
```

Environment variables and local setup: [apps/web/README.md](apps/web/README.md).

```sh
pnpm dev
```
