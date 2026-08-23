# Fallow

MBQB is in the Fallow ZERO-DEBT steady state (see
[issue #264](https://github.com/samaluk/mbqb/issues/264), with
[fintual-api #405](https://github.com/samaluk/fintual-api/pull/405) as the
reference). The full repository scan reports zero findings, and every surface
— pre-commit, pre-push, `hk check`, CI, and drift watch — blocks on any of
them.

## Gates

| Surface | Command | Scope |
|---|---|---|
| pre-commit | `pnpm fallow:staged` | every finding on staged hunks (`audit --diff-stdin --gate all`) |
| pre-push | `pnpm test:coverage && pnpm fallow:full` | FULL repository scan over fresh coverage |
| `hk check` | `pnpm test:coverage && pnpm fallow:full` | manual deep check, same scope as pre-push |
| CI — [`.github/workflows/fallow.yml`](.github/workflows/fallow.yml) | gate job runs `pnpm fallow:full` | blocking on pull_request and push to master |
| CI — review job | pinned `fallow-rs/fallow` Action at `gate: all` | PR feedback: sticky comment, Check Run, inline review comments |
| drift — [`fallow-drift.yml`](.github/workflows/fallow-drift.yml) | bare-mode full scan via the Action | once per resolved fallow version, fully blocking |

The canonical scripts live in the root `package.json`:

```bash
pnpm fallow          # passthrough to the CLI
pnpm fallow:staged   # strict audit over the staged diff (pre-commit)
pnpm fallow:full     # full scan: dead-code + dupes + health, fail-on-issues
pnpm fallow:ci       # alias of fallow:full used by CI and pre-push
```

Coverage coupling is explicit: gates that score CRAP pass
`--coverage coverage/coverage-final.json` and require it to exist (run
`pnpm test:coverage` first). The shared config carries no coverage key, so a
zero-install drift scan can run the same config with module-graph estimation.

## Command reference

```bash
pnpm fallow:dead-code       # unused files, exports, types, deps, leaks
pnpm fallow:dupes           # semantic and near duplication
pnpm fallow:health          # thresholds, CRAP, coverage-aware health
pnpm fallow:security        # unverified advisory candidates
pnpm fallow:suppressions    # suppression inventory
pnpm fallow:recommend       # stack/config recommendation
pnpm fallow:status          # type-aware companion status
pnpm fallow:boundaries      # zones and dependency rules
pnpm fallow:config          # resolved configuration
```

None uses a baseline or regression machinery.

## Analysis configuration

### Type-aware analysis

Type-aware analysis is enabled and required to be `complete` for:

- `apps/web/tsconfig.json` — application and production sources;
- `apps/web/tsconfig.tests.json` — Vitest and Playwright configuration/tests.

Fallow 3.17 reports TypeScript-Go protocol 7, zero abstentions, zero unresolved
queries, and zero warnings for these projects. This is Fallow-owned semantic
evidence; `tsc --noEmit` remains responsible for compiler correctness and
Oxlint remains responsible for typed lint rules.

`includeEntryExports` remains disabled: treating Next.js and tooling entry
exports as ordinary public API reports false positives for framework-managed
surfaces.

### Dead code and exceptions

The entry model covers App Router route files, `payload.config.ts`, and the
standalone script entries (`seed-e2e-fixtures.ts`,
`resolve-postgres-url.ts` — the latter invoked by
`seed-dev-from-production.sh` through tsx by path). Payload-generated
type/schema files and test/build artifacts are ignored because they are
generated surfaces, not application modules. Payload migrations are marked
`dynamicallyLoaded`.

The only broad export exception is the shadcn/Base UI primitive surface under
`apps/web/src/components/ui/*.tsx`: removing it produced a large set of
intentionally available primitive exports. Those files remain analyzed for
reachability; their internal repetition is handled by reviewed duplication
exceptions below rather than by refactoring them away from upstream.

Private type leaks, stale suppressions, missing suppression reasons, and
boundary violations are errors — and with zero debt, any finding blocks.

### Duplication

Semantic mode with near detection, an 8-line/60-token floor,
`minOccurrences: 2`, and import wiring ignored. Generated surfaces are
excluded via `duplicates.ignore` (migrations, Payload-generated admin routes).
Ten clone groups are recorded in `ignoredClones` as reviewed exceptions —
vendored UI patterns and intentional CSS variants — each keyed by occurrence
count so content or count changes re-report them.

### Coverage and health

`pnpm test:coverage` writes Istanbul-format `coverage/coverage-final.json`.
Health thresholds: cyclomatic 20, cognitive 15, CRAP 30, unit size 60. Every
flagged function sits below them; the drift scan proves the set stays clean
across tool upgrades. The `coverage-gaps` rule remains advisory `warn`.

### Architecture boundaries

Ten repository-derived zones with ten dependency-direction rules and complete
boundary coverage (`fallow:boundaries`); the full boundary scan has zero
violations.

## Hooks and CI

`hk` remains the only hook manager.

- **Pre-commit** formats and lints staged web files, then runs typecheck,
  `fallow:staged`, unit tests, and the staged React Doctor scan.
- **Pre-push** checks the environment, typechecks, fetches origin/master,
  runs the changed-scope React Doctor gate, builds, generates fresh coverage,
  and runs `fallow:full` (depends on the fetch step).

CI splits quality jobs so a pull request goes green fast:

- **`Lint, typecheck & format`** (ci.yml) — static checks.
- **`Test with coverage`** (ci.yml) — the unit suite.
- **`Fallow gate`** (fallow.yml) — fresh coverage + the full scan, blocking.
- **`Fallow PR review`** (fallow.yml) — native Fallow PR feedback from the
  same coverage artifact.
- **`Build, integration, and E2E tests`** (ci.yml) — Playwright against
  PostGIS.

Each is its own required status check on the `master` branch ruleset. The
drift workflow runs separately per fallow version, also blocking.
