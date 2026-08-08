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

### Git hooks

Local checks are managed by [hk](https://hk.jdx.dev/). Install hk once (`brew install hk` or `cargo install hk`), then run `bash scripts/setup-hk.sh` in this repo (or `hk install --global` once on your machine — hk is a silent no-op in repos without an `hk.pkl`).

> If you previously ran `scripts/setup-githooks.sh` (pre-hk), run `bash scripts/setup-hk.sh` once: it removes the stale `include.path` pointing at the deleted `.githooks/mbqb.config`. If you use `hk install --global` instead, clear it manually with `git config --local --fixed-value --unset-all include.path '../.githooks/mbqb.config'`.

- `pre-commit` — oxlint and oxfmt on **staged files only** (auto-fixes and re-stages them), then typecheck, fallow gates, and unit tests on the whole repo
- `pre-push` — typecheck and a local production build (requires `apps/web/.env.local`; run `cd apps/web && pnpm env:pull`)

The full fast suite is also available on demand: `hk check` (defaults to staged files; `--all` for every tracked file, `--unstaged` for working-tree changes) and `hk fix` to auto-fix.
