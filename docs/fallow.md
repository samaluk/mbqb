# Fallow quality ratchet

MBQB uses [Fallow](https://docs.fallow.tools) 3.16 as a strict, comprehensive,
continuously improving code-quality ratchet. Existing technical debt is
baselined; new debt is rejected; debt only ever moves downward.

## 1. Purpose / quality-ratchet model

Fallow statically analyzes TypeScript/JavaScript for dead code, duplication,
complexity, architecture boundary violations, styling drift, and opt-in
security candidates, with optional TypeScript semantic evidence. The ratchet
model is:

- **existing debt may be baselined** (`fallow-baselines/*.json`)
- **new debt may not be introduced** (every gate rejects it)
- **existing debt must only move downward** (baseline freshness is enforced)

A baseline is a migration mechanism, not an allowlist: regenerating a worse
baseline to silence CI is never acceptable.

## 2. Fallow version

Pinned exactly: `fallow` 3.16.0 in the root `package.json` (`devDependencies`),
plus the version-matched `fallow-type-aware` semantic sidecar that `fallow type-aware`
manages. CI and the GitHub Action resolve the same pinned version from the
manifest — there is no floating version. After any Fallow upgrade, regenerate
baselines with `pnpm fallow:baseline:update` and re-vendor the agent skill from
`node_modules/fallow/skills/fallow/` into `.agents/skills/fallow/`.

## 3. Enabled analyses

| Family | Configuration |
|--------|---------------|
| Dead code | unused files/exports/types, enum/class members, dependencies (incl. dev), server actions, unresolved imports, unlisted deps, duplicate exports, circular deps, re-export cycles, stale suppressions, private type leaks |
| Duplication | semantic mode + near-miss, `minLines: 8`, `minTokens: 60`, `minOccurrences: 3`, import wiring excluded |
| Health | cyclomatic (20), cognitive (15), CRAP (30), unit size (60); per-function identity baseline; Istanbul coverage feeds CRAP |
| Architecture | 4 custom zones (data / domain / ui / app) with import rules, `boundary-violation: error` |
| Policy | oxlint `node/no-process-env: error` (no direct `process.env` reads in app code; `apps/web/src/env.ts` is the sanctioned env contract, tooling/scripts/test setup exempt) |
| Styling | Tailwind/CSS: `css-token-drift`, `css-duplicate-block`, `css-selector-complexity`, `css-dead-surface`, `css-broken-reference` — all `error`, gated on introduced findings via `fallow audit` |
| Security | deterministic candidates via `fallow security`; **verifier-filtered survivor gate** (`fallow:security:gate`) joins candidates with committed verdicts and fails CI on survivors, needs-human-review rows, or new unverdicted candidates |

Rules that default `warn` upstream are `error` here whenever they are
deterministic, applicable, and baselinable (unused dev deps, re-export cycles,
stale suppressions, missing suppression reasons, server actions, client/server
directives, CSS rules). Framework-specific rules for stacks this repo does not
use (Svelte, Vue, Angular, Pinia) stay at upstream `warn`. Opt-in rules that
are not surfaced in current output/baseline envelopes (`prop-drilling`,
`thin-wrapper`, `duplicate-prop-shape`) stay `off` so they cannot fail CI
invisibly.

## 4. Type-aware configuration / completeness

`typeAware.enabled: true`, `typeAware.require: "complete"`, projects:
`apps/web/tsconfig.json` (production) and `apps/web/tsconfig.tests.json`
(tests). `audit.typeAware: true` keeps the changed-code gate semantic too.
Type-aware analysis refines symbol-use evidence (unused exports, class
members, private type leaks); it does not replace `tsc` or Oxlint.

Completeness is gated: `pnpm fallow:status` reports the sidecar, and
`require: complete` fails the gate if a requested semantic query is
incomplete, so type-aware completeness cannot silently regress.

The dead-code baseline exists in two semantic modes because Fallow compares
baseline identities by raw capability equality:

- `fallow-baselines/dead-code.json` — standalone mode
  (`symbol-use`, `api-surface`), used by `fallow:dead-code`.
- `fallow-baselines/audit-dead-code.json` — audit mode
  (`symbol-use`, `api-surface`, `type-coupling`), produced by the combined
  `fallow --save-baseline` run, used by `fallow audit`. Using the standalone
  baseline for audit fails with a `capabilities` identity mismatch; using the
  audit baseline for the standalone gate would too. Each gate is regenerated
  and enforced in its own mode.

## 5. Architecture boundaries

Four zones reflect the actual dependency structure (verified via
`fallow list --boundaries`):

| Zone | Patterns | May import |
|------|----------|-----------|
| `data` | `src/collections/**`, `src/globals/**`, `src/access/**`, `src/payload.config.ts` | `data`, `domain` |
| `domain` | `src/lib/**` | `domain`, `data` |
| `ui` | `src/components/**` | `ui`, `domain` |
| `app` | `src/app/**` | everything (composition root, no rule) |

`boundary-violation` is `error`. Shared cross-cutting files are intentionally
unzoned (generated `payload-types.ts`, `payload-generated-schema.ts`,
`src/env.ts`, `src/types/**`, `src/migrations/**`) so type imports and the env
contract are not constrained; unzoned files can import and be imported freely.
`coverage.requireAllFiles` is off for this reason. Inspect with:

```bash
pnpm exec fallow list --boundaries
pnpm exec fallow guard apps/web/src/components/ui/button.tsx
```

## 6. Baseline layers

`fallow-baselines/` (committed, never regenerated in CI):

| File | Gate | Produced by |
|------|------|-------------|
| `dead-code.json` | `fallow:dead-code` (identity) | `fallow dead-code --save-baseline` |
| `audit-dead-code.json` | `fallow:audit` (identity, audit mode) | `fallow --save-baseline` |
| `dupes.json` | `fallow:dupes` (clone fingerprints) | `fallow dupes --save-baseline` |
| `health.json` | `fallow:health` (per-function identity) | `fallow health --baseline-mode identity --save-baseline` |
| `regression-dead-code.json` | `fallow:regression` (counts) | `fallow dead-code --save-regression-baseline` |

Four complementary gates:

- **Gate A — changed-code audit**: `fallow audit --gate new-only` with all
  three identity baselines, type-aware. Rejects introduced error-severity
  findings; inherited findings in touched files are reported but do not fail.
- **Gate B — identity baselines**: `fallow:dead-code`, `fallow:dupes`,
  `fallow:health` reject any finding not in the committed baseline — catching
  one-finding-removed-plus-one-finding-added even when the count is unchanged.
- **Gate C — regression counts**: `fallow:regression` fails when dead-code
  issue counts exceed the committed regression baseline (native
  `--fail-on-regression`, interpreted by `scripts/fallow-regression.mjs`
  because exit 1 is ambiguous between "findings" and "regression exceeded").
  Dupes/health counts are subsumed by their identity baselines.
- **Gate D — baseline freshness**: `fallow:baseline:check` regenerates every
  baseline to a temp directory and diffs against the committed files, so
  improvements that are not committed to the baselines fail CI. One-way
  ratchet: worse → identity gates fail; better but baseline unchanged →
  freshness fails; better + baseline reduced → passes.

## 7. Local commands

```bash
pnpm fallow                 # full pipeline (dead-code + dupes + health)
pnpm fallow:config          # show resolved config / loaded config file
pnpm fallow:recommend       # project-tailored config recommendations
pnpm fallow:status          # type-aware companion status
pnpm fallow:dead-code       # Gate B: dead-code identity baseline
pnpm fallow:dupes           # Gate B: duplication identity baseline
pnpm fallow:health          # Gate B: health identity baseline (coverage-aware)
pnpm fallow:audit           # Gate A: changed-code audit (new-only, type-aware)
pnpm fallow:regression      # Gate C: dead-code count regression
pnpm fallow:baseline:check  # Gate D: baseline freshness
pnpm fallow:security        # security candidates + attack surface (verifier input)
pnpm fallow:security:gate  # security gate: survivors/unverdicted fail (in fallow:ci)
pnpm fallow:suppressions    # suppression inventory
pnpm fallow:css             # styling/design-system findings (advisory)
pnpm fallow:fix:preview     # type-aware dry-run of safe fixes
pnpm fallow:fix             # apply safe fixes (never run in CI)
pnpm fallow:ci              # authoritative local equivalent of the CI gate
```

`fallow:ci` = `fallow:status` + the three identity gates + `fallow:audit` +
`fallow:security:gate` + `fallow:regression` + `fallow:baseline:check`. The
health and audit commands consume Istanbul coverage via
`scripts/fallow-env.sh`; run `pnpm test:unit:coverage` first (CI does). A
missing coverage file fails with a clear exit-2 error rather than silently
switching to static CRAP estimates.

Exit-code semantics (Fallow's ladder): `0` clean, `1` findings (or an
exceeded gate), `2` real analyzer/config error. Never `|| true` a fallow
command without preserving the distinction.

### Security verification workflow

`fallow security` produces deterministic candidates, not verdicts. The gate
(`fallow:security:gate`) works like the other ratchets: candidates are
dispositioned by a verifier (agent or human) into
`fallow-baselines/security-verdicts.json`, and CI fails when a candidate
survives verification, is marked `needs-human-review`, or is new (no verdict
yet — `--require-verdict-for-each-candidate`).

To disposition candidates (e.g. on a PR that introduces a new one):

1. `pnpm fallow:security > candidates.json` — full inventory with `attack_surface`.
2. Diff `finding_id`s against `fallow-baselines/security-verdicts.json`;
   every new/changed id needs a verdict.
3. For each candidate, read the finding's `trace` and the source window, and
   apply the verifier contract: is the input attacker-controlled, does it
   reach the sink, is the boundary relevant, is there a defensive control
   that dismisses it? Verdicts: `dismissed` / `survivor` / `needs-human-review`.
4. Update the verdicts file and commit it with the change.

Finding IDs are content-derived and stable across line shifts, so routine
edits do not invalidate dispositions; only changed security-relevant code
does.

## 8. CI behavior

The `quality` job runs `pnpm test:unit:coverage` then `pnpm fallow:ci`, so CI
fails when any of: a forbidden finding is introduced in changed code, a
security candidate survives verification or is new/unverdicted, an identity
baseline is exceeded, regression counts increase, committed baselines
are stale, the type-aware companion is incomplete, or a config/type-aware
error occurs. A separate `fallow-pr` job runs the official
`fallow-rs/fallow@v3` Action (`command: audit`) to render the same gate as PR
feedback: sticky summary comment, inline review comments, and SARIF upload for
Code Scanning. CI never regenerates committed baselines.

## 9. Git-hook behavior

Hooks are managed by `hk` (`hk.pkl`); fallow does not install a competing hook
manager.

- **pre-commit** — fast changed/staged gate:
  `git diff --cached --unified=0 | pnpm exec fallow audit --gate new-only --diff-stdin --quiet`.
  Only lines added by this commit are gated.
- **pre-push** — full ratchet: `pnpm test:unit:coverage && pnpm fallow:ci`
  (alongside the existing typecheck and build steps).

## 10. Agent / MCP integration

- The version-matched Fallow agent skill is vendored at
  `.agents/skills/fallow/` and is regenerated from
  `node_modules/fallow/skills/fallow/` after an upgrade. Load the `fallow`
  skill before analyzing or gating code.
- `AGENTS.md` summarizes when and how to use fallow without duplicating the
  skill.
- The `fallow-mcp` server is configured repo-locally in `.mcp.json`
  (`pnpm exec fallow-mcp`), exposing the same analyses as agent tools.
- Agents: always `--format json --quiet`, treat exit 1 as findings (not
  failure), trace consumers with `dead-code --type-aware --symbol-impact`
  before deleting anything, and never run `fallow:fix` in CI.

## 11. Coverage behavior

Unit tests run with Istanbul coverage (`@vitest/coverage-istanbul`,
`pnpm test:unit:coverage` writes `apps/web/coverage/coverage-final.json`).
Fallow consumes it via `FALLOW_COVERAGE` / `FALLOW_COVERAGE_ROOT`
(`scripts/fallow-env.sh`) so `fallow health` and `fallow audit` score CRAP
from real coverage (325/438 functions matched in this repo; unmatched
functions use the graph estimate). The committed health baseline is
coverage-aware, and every gate/baseline/freshness run uses identical coverage
input, so a coverage-less run can never be silently compared against a
coverage-aware baseline. `server-only` is aliased in
`apps/web/vitest.config.mts` to a test mock so coverage instrumentation can
transform server-only modules.

`fallow health --coverage-gaps` (untested runtime-reachable code) is available
for inspection but deliberately not gated: at ~25% unit-test coverage it would
flag most of the app, and it is advisory by design.

## 12. Intentional exclusions

| Pattern | Reason |
|---------|--------|
| `ignorePatterns: **/payload-types.ts`, `**/payload-generated-schema.ts` | Generated Payload types |
| `ignorePatterns: apps/web/tests/e2e/**`, `playwright-report/**`, `test-results/**` | Playwright output and e2e specs (covered by their own harness) |
| `ignorePatterns: scripts/**` | Repo-root tooling scripts (not app source) |
| `ignoreFindings: apps/web/src/migrations/**` | Payload migrations stay in the import graph; findings hidden to preserve type-aware completeness |
| `ignoreExports: apps/web/src/components/ui/*.tsx` | Vendored shadcn components re-export the full component API |
| `ignoreDependencies: @base-ui/react, class-variance-authority, @next/playwright, shadcn, tw-animate-css, tailwindcss` | Tooling/CSS deps resolved outside the module graph |
| `duplicates.minOccurrences: 3` | Pairs would add ~20 clone groups of shadcn/test boilerplate noise; 3+ focuses on meaningful copy-paste |
| unzoned `src/env.ts`, `src/types/**`, generated payload files | Cross-cutting infrastructure; type imports and the env contract must stay unconstrained |
| `security-*` rules `off` | Candidates are surfaced by `fallow security` (not in the dead-code envelope); the deterministic security gate is `fallow:security:gate` with committed verifier verdicts |
| `coverage-gaps` off | Advisory by design; see §11 |
| `prop-drilling`, `thin-wrapper`, `duplicate-prop-shape` off | Opt-in rules not surfaced in current baseline envelopes (would fail CI invisibly) |

Each exclusion is the narrowest available mechanism; no broad file ignores.

## 13. How to investigate a finding

```bash
# Why is an export flagged?
pnpm exec fallow dead-code --trace apps/web/src/lib/preview.ts:buildPreviewPath

# Exact TypeScript consumers before deleting anything
pnpm exec fallow dead-code --type-aware --symbol-impact apps/web/src/lib/canchasBrowsing.ts:CanchasFinder

# Who would be affected by a file change
pnpm exec fallow dead-code --impact-closure apps/web/src/lib/canchas.ts

# A duplication fingerprint
pnpm exec fallow dupes --trace dup:c77b3abb6f87acd9-2

# Health hotspots, owners, and refactoring targets
pnpm exec fallow health --hotspots --ownership --targets

# Which architecture rules apply to a file before editing it
pnpm exec fallow guard apps/web/src/lib/publicContentPublishing.ts

# Active suppressions
pnpm exec fallow suppressions

# Explain an issue type
pnpm exec fallow explain private-type-leak
```

## 14. How to update baselines after improvements

Only after genuine fixes, config changes, or a deliberate Fallow upgrade:

```bash
pnpm fallow:baseline:update   # regenerates every committed baseline coherently
git add .fallowrc.json fallow-baselines/ rule-packs/ scripts/
```

`fallow:baseline:update` never hides analyzer errors (exit 2 aborts). It
regenerates coverage-dependent baselines with the same Istanbul input the
gates enforce. Never regenerate baselines merely to silence CI; a finding
removed and later re-added fails CI again.

## 15. Known upstream limitations

- **Audit baseline identity**: `fallow audit` runs its dead-code sub-analysis
  with an extra `type-coupling` semantic capability (because the health
  sub-pass shares the session), so a dead-code baseline saved by standalone
  `fallow dead-code` is rejected by audit with a `capabilities` identity
  mismatch. The workaround is two mode-specific dead-code baselines
  (§4/§6); each gate is enforced in its own mode.
- **Audit base-snapshot vs new config-referenced files**: `audit --gate
  new-only` re-analyzes a git worktree at the merge base using the current
  config; a rule-pack file that is new in the current branch must already
  exist at the base ref or the base config load fails. Land config-referenced
  files (rule packs) before opening the PR that first references them.
- **`fallow audit` rejects global `--baseline`/`--save-baseline`** (exit 2);
  use the per-analysis `--dead-code-baseline` / `--health-baseline` /
  `--dupes-baseline` (or the `audit.*Baseline` config fields).
- **Dupes/health `--fail-on-regression`** does not expose a machine-readable
  regression verdict (and dupes did not flag an increased clone count in
  testing); those analyses are gated by identity baselines (Gate B) instead.
- **Security findings are candidates, not verified vulnerabilities.** Fallow
  never decides exploitability; a verifier (agent or human) must. This repo
  commits verifier dispositions in `fallow-baselines/security-verdicts.json`
  and gates CI on `fallow security survivors` — new or surviving candidates
  block merge until dispositioned. To re-verify when candidates change: run
  `pnpm fallow:security` (full inventory with attack surface), compare
  `finding_id`s against the committed verdicts, disposition each new or
  changed candidate per the verifier contract (see §7), and commit the
  updated verdicts file. The exit-8 `--gate new`/`newly-reachable` mode is
  available as an alternative posture.
- **Paid Fallow Runtime** (production execution evidence, hot-path verdicts,
  `fallow coverage`) is not enabled; it requires a license/account. The static
  layer covers everything above.
