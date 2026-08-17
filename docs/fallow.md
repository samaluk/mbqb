# Fallow adoption gate

MBQB is in the Fallow 3.17 ADOPTION state. The repository deliberately keeps
existing findings visible while blocking newly introduced debt with native
`fallow audit --gate new-only`. This is a migration guard, not the strict
zero-debt architecture. The later transition is tracked in [issue #264](https://github.com/samaluk/mbqb/issues/264), with [fintual-api #405](https://github.com/samaluk/fintual-api/pull/405) as the steady-state reference.

## Blocking migration gate

Run coverage before commands that consume it:

```bash
pnpm test:coverage
pnpm fallow:audit
```

`pnpm fallow:audit` is the authoritative migration gate:

```text
fallow audit --gate new-only --type-aware \
  --coverage coverage/coverage-final.json \
  --coverage-root "$PWD"
```

Only findings introduced by the changeset drive the verdict. Existing findings
remain in the report and are mergeable. `pnpm fallow:ci` is an alias for this
same gate; it is not a full-repository zero-debt gate.

The first migration audit can report a type-aware identity warning because the
3.15 base and 3.17 head use different semantic schema versions. Fallow falls
back to syntactic base attribution for that comparison while still running
type-aware refinement on head findings. This is expected for the upgrade PR;
future audits use the same 3.17 identity.

## Native pull-request reporting

Pull requests run one immutable Fallow 3.17.0 Action analysis with:

- `command: audit`
- `gate: new-only`
- `type-aware: true`
- the repository's Istanbul coverage file and checkout root
- compact sticky summary comment
- Check Run
- inline review comments and review guidance

The Action uses `branded-token: false`, `sarif: false`, and only
`contents: read`, `pull-requests: write`, and `checks: write`. Manual SARIF
generation, HEAD/base splitting, duplicate Code Scanning uploads, plain
annotations, and `security-events` permission are intentionally absent.

The project-local `fallow` dependency is pinned exactly to `3.17.0`. The
matching versioned skill is vendored at `.agents/skills/fallow/`, and
`.mcp.json` exposes `pnpm exec fallow-mcp` for repository-local MCP clients.

## Full-repository inspection

These commands measure and investigate existing debt. They are not expected to
return zero during adoption, and none uses a baseline or `--fail-on-issues`:

```bash
pnpm fallow:dead-code       # unused files, exports, types, deps, cycles
pnpm fallow:dupes           # semantic and near duplication
pnpm fallow:health          # thresholds, CRAP, score, coverage-aware health
pnpm fallow:security        # unverified advisory candidates
pnpm fallow:suppressions    # suppression inventory
pnpm fallow:recommend       # stack/config recommendation
pnpm fallow:status          # type-aware companion status
pnpm fallow:boundaries      # zones and dependency rules
pnpm fallow:config          # resolved configuration
```

The current snapshot is:

- dead code: 45 findings — 3 unused files, 6 unused exports, 2 unused types,
  32 private type leaks, and 2 unused dependencies;
- duplication: 24 semantic/near clone groups across 18 families;
- health: 21 functions above threshold, score 71.3/B;
- security: 35 advisory candidates (not confirmed vulnerabilities);
- suppressions: 0 active markers;
- boundaries: 10 zones and 10 rules, with 0 boundary or coverage violations.

These findings are future cleanup work, not permanent acceptance. Do not add a
baseline to make them appear clean.

## Analysis configuration

### Type-aware analysis

Type-aware analysis is enabled and required to be `complete` for:

- `apps/web/tsconfig.json` — application and production sources;
- `apps/web/tsconfig.tests.json` — Vitest and Playwright configuration/tests.

Fallow 3.17 reports TypeScript-Go protocol 7, zero abstentions, zero unresolved
queries, and zero warnings for these projects. This is Fallow-owned semantic
evidence; `tsc --noEmit` remains responsible for compiler correctness and
Oxlint remains responsible for typed lint rules.

`includeEntryExports` was tested but remains explicitly disabled. Treating
Next.js and tooling entry exports as ordinary public API reports false positives
for `next.config.ts`, Playwright/Vitest config, and declaration-only surfaces,
and makes semantic completeness unavailable. Framework-managed entry exports
remain credited until a future cleanup can establish an accurate policy.

### Dead code and exceptions

The entry model is derived from this Next/Payload app: App Router route files,
`payload.config.ts`, and the E2E seed entry. Payload-generated type/schema files
and test/build artifacts are ignored because they are generated surfaces, not
application modules. Payload migrations are marked `dynamicallyLoaded` because
the runtime receives their directory through configuration rather than a
static import edge.

The only broad export exception is the shadcn/Base UI primitive surface under
`apps/web/src/components/ui/*.tsx`. Removing that exception was re-tested and
produced a large set of intentionally available primitive exports; the files
remain analyzed for reachability and duplication. CSS/tooling dependencies are
ignored only where their usage is through PostCSS/CSS or package-generator
conventions. `@payloadcms/ui` and `isomorphic-dompurify` remain visible as
unused-dependency debt rather than being hidden.

The pre-existing `rule-packs/env-hygiene.jsonc` remains a standalone policy
asset. It is not referenced by this adoption config because a native audit base
snapshot cannot load a new branch-only config asset that is absent from the
merge base. Activating it belongs in a follow-up once the pack is present on the
base branch.

Private type leaks, stale suppressions, missing suppression reasons, and
boundary violations are errors. Existing findings are still mergeable under
`new-only`; a new finding of any of these kinds blocks the audit.

### Duplication

Duplication uses semantic mode with near detection, an 8-line/60-token floor,
`minOccurrences: 2`, and import wiring ignored. Pair-level findings are
visible. No existing clone fingerprints are placed in `ignoredClones`, and no
duplication baseline exists.

### Coverage and health

`pnpm test:coverage` runs the unit suite with the Vitest V8 provider and writes
`coverage/coverage-final.json` in Istanbul format. The health thresholds remain
cyclomatic 20, cognitive 15, CRAP 30, and unit size 60. Fallow consumes the
coverage file for health and audit/CRAP evidence. Structural coverage gaps were
evaluated with `fallow health --coverage-gaps`; the current run matches 99 of
438 analyzed functions and reports no untested-file or untested-export findings.
The `coverage-gaps` rule is therefore enabled at advisory `warn`, not blocking
`error`, during adoption.

### Architecture boundaries

The zones are repository-derived rather than copied from another project:

```text
app → ui, logic, access, cms, config
ui → ui, logic, config
logic → logic, access, cms, config
access → access, logic, cms
cms → cms, access, logic, config
config → config, cms, access, logic, migrations
migrations → migrations, cms
tests → application/runtime zones needed by tests
scripts → config, cms, access, logic, migrations
tooling → app, tests, scripts, config
```

The ten zones cover application routes, UI, business/integration logic, access
policies, Payload collections/globals, runtime configuration, migrations, tests,
scripts, and tooling. Boundary coverage requires every analyzed source file to
match a zone, with only narrow unmatched exceptions for declaration files and
CSS/SCSS assets. The full scan currently has no violations; `new-only` prevents
new violations while inherited application debt is addressed later.

## Hooks and CI

`hk` remains the only hook manager.

- Pre-commit formats and lints staged web files, then runs typecheck, the fast
  native `new-only` audit, and unit tests.
- Pre-push checks the local environment, typechecks, builds, generates real
  coverage, and runs `pnpm fallow:ci`.
- CI runs coverage before the local migration gate. Pull requests additionally
  receive the native Fallow Action report described above.

No baseline regeneration, freshness comparison, regression counter, or custom
Fallow wrapper is involved.

## New-only proof

Temporary probes were added and removed without changing the working tree:

- an unused export and unused file;
- an unused production dependency;
- an access-to-UI boundary crossing;
- two semantic duplicate functions.

With the probes present, native Fallow returned `verdict: fail`, reported the
new unused file/export/dependency and boundary violation as `introduced: true`,
and reported two introduced clone groups. After every probe was restored, the
same audit returned `verdict: pass`; inherited dependency findings remained
visible but did not block.

## Zero-debt follow-up

Issue [#264](https://github.com/samaluk/mbqb/issues/264) is the umbrella tracker
for the eventual transition to the [fintual-api #405](https://github.com/samaluk/fintual-api/pull/405)
steady state. It records strict dead-code, duplication, coverage-aware health,
complete type-aware, representative audit, and `gate: all` exit criteria.
Future PRs can address each cleanup category incrementally; this adoption PR
does not attempt those refactors.
