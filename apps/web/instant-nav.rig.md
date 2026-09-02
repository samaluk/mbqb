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
- SEED: the Playwright `globalSetup` seeds fixture content only when
  `E2E_SEED_FIXTURES=1` (CI sets it). This keeps the upsert from running as a
  side effect of every local test run: it writes to `POSTGRES_URL` (the dev
  DB locally), and a slug collision would republish/overwrite content there.
  Local runs set the flag or seed explicitly with
  `pnpm exec tsx scripts/seed-e2e-fixtures.ts` (idempotent).
- RUN: `pnpm test:e2e` (`playwright test --config=playwright.config.ts`) with
  `BASE_URL=http://localhost:3000` (webServer: `pnpm dev` locally, `pnpm start`
  in CI). Playwright `globalSetup` seeds fixture content (see SEED above).
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
  (port 3000) → `E2E_SEED_FIXTURES=1 pnpm test:e2e`; fully agent-drivable on
  this machine. CI: push → migrate/seed → API-exposed build →
  `pnpm test:e2e` (sets `E2E_SEED_FIXTURES=1`); the same suite runs in the
  `build-and-integration` job. No deploy approvals or secrets needed.
- VERIFICATION: acceptance criteria map as follows.
  - AC 1-4 (instant UI on canchas / La Biblia / products / home CTAs): the
    self-validating `@next/playwright` `instant()` locks in
    `tests/e2e/instant-nav.e2e.spec.ts`. Each locks dynamic data while
    navigating and asserts the static shell commits under the lock, then
    asserts deferred content releases — so a vacuous pass is impossible on a
    build lacking the testing API.
  - AC 5 (Instant Insights reports no slow navigations): the `instant()`
    locks are the programmatic equivalent — they fail when a navigation
    exceeds the locked budget, which is the same signal Instant Insights
    surfaces in the Next DevTools extension. The extension is a manual
    spot-check; the locks are the CI-enforced check. (Differential evidence:
    reverting only the three detail-page Suspense hoists fails exactly the
    three detail guards, and the two Home CTA guards still pass.)
- SCOPE DECISIONS (issue #191 asks only for Suspense/`'use cache'` shells; the
  following are deliberate, documented additions):
  - Fixture seeding (`scripts/seed-e2e-fixtures.ts`, Playwright `globalSetup`,
    CI seed step, `EXPOSE_TESTING_API=1`): the `instant()` guards need
    deterministic published content, which the repository does not otherwise
    provide. Opt-in via `E2E_SEED_FIXTURES=1` so local runs never silently
    republish content in the dev DB.
  - `publicContentPublishing.ts` revalidation catch: Payload scripts (the
    fixture seed) run outside Next's runtime, where `next/cache` does not
    resolve; revalidation is best-effort there. Inside Next, the failure is
    rethrown, so production revalidation failures stay visible.
  - `fallow-baselines/dupes.json`: the new clone group (the three detail-page
    static shells) is whitelisted in the same commits — this duplication IS
    the PR's mechanism (three near-identical shell components), so it is a
    conscious accept.
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
