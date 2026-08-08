# instant-nav rig: MBQB web

- BUILD: seed fixtures before building any cached public lists, then run
  `EXPOSE_TESTING_API=1 pnpm build:next` (`apps/web`), served by `pnpm start`.
  CI runs `pnpm migrate && pnpm exec tsx scripts/seed-e2e-fixtures.ts` before
  the build; local databases already have the schema and should run the seed
  script before each measured build. Both use `POSTGRES_URL` from `.env.local`
  (local) or CI env.
- EXPOSE: `process.env.EXPOSE_TESTING_API === '1'` — set explicitly for every
  measured build (local and CI e2e), never set in real production. The
  Playwright webServer command sets it in CI so `pnpm start` runs an
  API-exposed build; locally build AND start must both be run with it.
- RUN: `pnpm test:e2e` (`playwright test --config=playwright.config.ts`) with
  `BASE_URL=http://localhost:3000` (webServer: `pnpm dev` locally, `pnpm start`
  in CI). Playwright `globalSetup` seeds fixture content (see below).
- TEST USER: anonymous public visitor — the frontend routes under test are
  public. Data is fixture-seeded by `tests/e2e/global-setup.ts`
  (`scripts/seed-e2e-fixtures.ts`) into `POSTGRES_URL` before tests: 2 canchas,
  2 La Biblia articles, 2 products, all `_status: 'published'`, fixed slugs
  (`cancha-fixture-1`, `articulo-fixture-1`, `producto-fixture-1`, ...).
- DRIFT:
  - Empty vs seeded DB: CI and fresh local DBs have NO content; the seed script
    is the only source of content, so content-dependent flows are deterministic.
  - Draft mode: fixtures are published only; draft-mode reads must not change
    what the test user sees.
  - Locale: fixtures are seeded in `es` (the site's only locale).
  - Geo cookie: canchas list reads a user-geo cookie; seeded canchas have no
    region, so geo must not filter them out.
- LOOP: local seed → `EXPOSE_TESTING_API=1 pnpm build:next` → `pnpm start`
  (port 3000) → `pnpm test:e2e`; fully agent-drivable on this machine. CI:
  push → migrate/seed → API-exposed build → `pnpm test:e2e`; the same suite
  runs in the `build-and-integration` job. No deploy approvals or secrets
  needed.
- LIVENESS: n/a for the local `build && start` rig (artifact is freshly
  built). Stop any previous `next start` before starting; fail the loop on
  `EADDRINUSE`.
- WALLS:
  - Local build requires `.env.local` (present) and a reachable Postgres at
    `POSTGRES_URL` (docker compose postgres on 5433). Build runs migrations on
    an empty DB automatically (`pnpm build` = `migrate && build:next`).
  - Build masks `.env.production.local` to keep prod vars out of local builds.
  - Seeding uses the Payload local API; it must run after migrations exist and
    before `next start` serves traffic.
