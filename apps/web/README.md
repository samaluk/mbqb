# MBQB Web

Next.js and Payload app for MBQB.

## Quick Start

From the repository root:

```sh
pnpm install
cd apps/web
vercel login
vercel link
pnpm env:pull
docker compose up -d postgres
cd ../..
pnpm dev
```

The app runs at `http://localhost:3000`. Payload admin runs at `/admin`.

## Environment

[Vercel](https://vercel.com) is the source of truth for all environment variables. The canonical list and validation rules live in [`src/env.ts`](src/env.ts) (`@t3-oss/env-nextjs` + Zod). Local files are only a cache from `vercel env pull`:

| File | When |
|------|------|
| `.env.local` | Local dev and tests — `pnpm env:pull` (Vercel **Development**) |
| `.env.production.local` | Production DB scripts — `pnpm env:pull:production` |

```sh
cd apps/web
pnpm env:pull              # → .env.local
pnpm env:pull:production   # → .env.production.local
vercel env ls              # inspect remote values
```

Configure the Vercel **Development** environment with a local Docker `DATABASE_URL` (`postgres://postgres:postgres@127.0.0.1:5433/mbqb`), `NEXT_PUBLIC_SERVER_URL=http://localhost:3000`, `PAYLOAD_SECRET`, `PREVIEW_SECRET`, and `BLOB_READ_WRITE_TOKEN` (optional). Do not point Development `DATABASE_URL` at production.

If you run `pnpm seed:dev-from-prod`, set Development `PAYLOAD_SECRET` to the **same value as Production** in the Vercel dashboard so membership lookup hashes match the copied data.

### Adding a new variable

1. Add it in the Vercel project (`vercel env add …`).
2. Add it to the `server` or `client` schema and `runtimeEnv` in [`src/env.ts`](src/env.ts).
3. Run `pnpm env:pull` (or `env:pull:production` if production-only).
4. Use `env.YOUR_VAR` in application code under `src/` — do not read `process.env` directly.

## Local Database

Use Docker when you do not have local Postgres:

```sh
cd apps/web
docker compose up -d postgres
```

Postgres 17 + PostGIS on port **5433** (avoids clashing with a local Postgres on 5432). Set `DATABASE_URL` in Vercel Development, then `pnpm env:pull`.

### Seed local data from production

```sh
cd apps/web
pnpm env:pull:production
pnpm seed:dev-from-prod
```

This replaces your local `mbqb` database with a copy of production (schema and content), then applies any pending Payload migrations.

### Production admin user

```sh
cd apps/web
pnpm env:pull:production
CMS_USER_EMAIL=you@example.com CMS_USER_PASSWORD="$(openssl rand -base64 32)" pnpm create:prod-user
```

Use `CMS_USER_UPDATE_EXISTING=true` to reset an existing user password. `create:prod-user` loads `.env.production.local` when `NODE_ENV=production`.

## Current Foundation

The app uses Payload with Postgres, Vercel Blob-backed media when `BLOB_READ_WRITE_TOKEN` is present, and built-in admin auth with `admin`, `editor`, and `validation-manager` staff roles.

Current CMS foundation includes `users`, `media`, `active-memberships`, and `site-settings`.

## Live preview (server-rendered)

Editors can preview draft CMS content in the admin panel (Live Preview) and via the Preview button. The frontend uses Next.js draft mode plus `router.refresh()` on autosave.

`PREVIEW_SECRET` and `NEXT_PUBLIC_SERVER_URL` must be set (via Vercel / `env:pull`). They are validated in `src/env.ts`.

### Migrations

Local development follows Payload's recommended Postgres workflow: the local database is a sandbox, and Payload/Drizzle `push` syncs schema changes while `pnpm dev` runs. Do not run migrations against the same pushed local database as part of ordinary feature work; Payload treats `push` and migrations as separate workflows.

For normal schema changes:

1. Edit the Payload config locally and develop against the pushed local schema.
2. Finish the feature before generating a migration.
3. Create a migration from `apps/web`:

   ```sh
   pnpm payload migrate:create meaningful-name
   ```

4. Review the generated SQL before committing it.
5. Let CI/production run `pnpm migrate` before `next build`.

If a migration depends on environment-specific config, generate and review it with those conditions in mind. This matters for production-only plugins or flags, including Vercel Blob storage controlled by `BLOB_READ_WRITE_TOKEN`.

Useful migration commands from `apps/web`:

```sh
pnpm migrate:status
pnpm migrate:create meaningful-name
pnpm migrate:down
pnpm migrate:fresh
```

For production migration against a pulled env file:

```sh
pnpm env:pull:production
pnpm migrate
```

### Squashed baseline

Schema history starts from `20260604_000000_baseline` (includes drafts/version tables and Lexical `body` jsonb columns). One-off data backfills live in scripts, not migrations.

**Local / CI — empty database:**

```sh
cd apps/web
DATABASE_URL=postgres://postgres:postgres@127.0.0.1:5433/mbqb pnpm migrate:fresh
```

**Local — match production:** `pnpm seed:dev-from-prod` (restores prod dump, then `payload migrate`).

### Lexical body cleanup

The final content shape stores editorial rich text in Lexical `body` only. The legacy Shopify importer has been removed.

Before applying the generated migration that drops legacy `body_html` columns:

1. Take a production `pg_dump` backup.
2. Deploy this code while the database still has the legacy `body_html` columns.
3. Run the raw-column data backfill:

   ```sh
   cd apps/web
   pnpm env:pull:production
   LEGACY_IMAGE_BASE_URL=https://mbqb.cl \
   LEGACY_IMAGE_ALLOWED_HOSTS=mbqb.cl,cdn.shopify.com,cdn.shopifycdn.net \
   pnpm backfill:lexical-body:prod
   ```

4. Verify the script reports zero failures.
5. Sync Lexical `body` into published version snapshots (required for the public site when drafts are enabled):

   ```sh
   cd apps/web
   pnpm sync:published-lexical-body:prod -- --dry-run
   pnpm sync:published-lexical-body:prod
   ```

   The HTML backfill updates `*_locales.body` only. Payload serves anonymous reads from `_collection_v_locales.version_body` on the published snapshot, so the storefront can stay empty while admin looks correct until this step runs.

6. Finish the feature, then generate the drop-column migration with Payload:

   ```sh
   cd apps/web
   pnpm payload migrate:create remove-body-html
   ```

7. Review and commit the generated migration.

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
