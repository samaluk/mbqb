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

## Current Foundation

The app uses Payload with Postgres, Vercel Blob-backed media when `BLOB_READ_WRITE_TOKEN` is present, and built-in admin auth with `admin`, `editor`, and `validation-manager` staff roles.

Current CMS foundation includes `users`, `media`, `active-memberships`, and `site-settings`.
