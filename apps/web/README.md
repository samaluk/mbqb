# MBQB Web

Next.js and Payload app for MBQB.

## Quick Start

From the repository root:

```sh
pnpm install
pnpm dev
```

The app runs at `http://localhost:3000`. Payload admin runs at `/admin`.

## Environment

Copy `.env.example` to `.env` inside `apps/web` and set:

- `DATABASE_URL`: Postgres connection string.
- `PAYLOAD_SECRET`: Payload secret.
- `BLOB_READ_WRITE_TOKEN`: Vercel Blob token for production media storage.

## Local Database

Use Docker when you do not have local Postgres:

```sh
cd apps/web
docker compose up postgres
```

### Seed local data from production

Local Postgres should match production (Postgres 17 + PostGIS). Use the Compose service (port **5433** so it does not clash with a Homebrew Postgres on 5432):

```sh
cd apps/web
docker compose up -d postgres
```

After pulling production env vars to the repo root (`.vercel/.env.production.local`):

```sh
vercel env pull ../../.vercel/.env.production.local --environment=production
pnpm seed:dev-from-prod
```

This replaces your local `mbqb` database with a copy of production (schema and content), then applies any pending Payload migrations.

### Production admin user

```sh
cd apps/web
CMS_USER_EMAIL=you@example.com CMS_USER_PASSWORD="$(openssl rand -base64 32)" pnpm create:prod-user
```

Use `CMS_USER_UPDATE_EXISTING=true` to reset an existing user password. For production, ensure `DOTENV_CONFIG_PATH` points at pulled Vercel env (or rely on `.vercel/.env.production.local`) and set `NODE_ENV=production`.

### Import public content from mbqb.cl into production

Pull production env vars first, then import canchas, products, La Biblia articles, and site settings from the live Shopify storefront:

```sh
cd apps/web
vercel env pull ../../.vercel/.env.production.local --environment=production
pnpm import:mbqb:prod
```

The importer upserts by slug and does not modify `users` or `home-page` media. Re-running is safe: it refreshes Shopify HTML fields but keeps existing cancha coordinates, hole counts, booking URLs, and any site settings you already set in admin. Expect roughly 16 canchas, 1 product, and 1+ La Biblia articles (depending on what is linked from the live hub page).

For local database targets, use `pnpm import:mbqb` with `apps/web/.env` configured.

## Current Foundation

The app uses Payload with Postgres, Vercel Blob-backed media when `BLOB_READ_WRITE_TOKEN` is present, and built-in admin auth with `admin`, `editor`, and `validation-manager` staff roles.

Current CMS foundation includes `users`, `media`, `active-memberships`, and `site-settings`.

## Live preview (server-rendered)

Editors can preview draft CMS content in the admin panel (Live Preview) and via the Preview button. The frontend uses Next.js draft mode plus `router.refresh()` on autosave.

Set in `apps/web/.env`:

- `NEXT_PUBLIC_SERVER_URL` — public app URL (e.g. `http://localhost:3000`)
- `PREVIEW_SECRET` — random string; must match production Vercel env

### Migrations (squashed baseline)

Schema history is a single migration: `20260604_000000_baseline` (includes drafts/version tables and Lexical `body` jsonb columns). One-off data backfills (publish drafts, Lexical body content) live in scripts, not migrations.

**Local / CI — empty database:**

```sh
cd apps/web
yes | DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/mbqb npx payload migrate:fresh
```

**Local — match production:** `pnpm seed:dev-from-prod` (restores prod dump, then `payload migrate`).

**After deploying the squash to production** (schema already correct; Lexical shipped):

1. Take a production `pg_dump` backup.
2. Deploy this commit.
3. Run `scripts/reset-payload-migrations-to-baseline.sql` against production (resets only `payload_migrations`, not content).
4. Confirm the next deploy’s `pnpm migrate` reports no pending migrations.

Regenerate the baseline from a DB that matches prod:

```sh
cd apps/web
node scripts/build-baseline-migration.mjs
```
