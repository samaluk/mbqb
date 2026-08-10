# Fallow quality ratchet

MBQB uses [Fallow](https://docs.fallow.tools) 3.14 with type-aware TypeScript analysis as a strict quality ratchet. Existing technical debt is baselined; new debt is rejected.

## Identity baselines (`fallow-baselines/*.json`)

Identity-based snapshots of current findings, committed to the repo:

| File | Analysis | Matching mode |
|------|----------|---------------|
| `dead-code.json` | Unused code, deps, private type leaks | Per finding identity |
| `dupes.json` | Semantic clone groups (`minOccurrences: 3`) | Per clone fingerprint |
| `health.json` | Complexity, CRAP, unit size | Per function identity |

Per Fallow's [CI integration guide](https://docs.fallow.tools/integrations/ci), baselines are committed to the repo and **never regenerated in CI** — regenerating on every run would mean new issues are never reported. The gate fails when a finding appears that is not in the committed baseline, even if total count stays the same. Example: remove one unused export and add a different one → CI fails.

## Type-aware analysis

Enabled in `.fallowrc.json` via `typeAware.enabled: true` with `require: complete`. Projects:

- `apps/web/tsconfig.json` — production sources
- `apps/web/tsconfig.tests.json` — Vitest and Playwright config/tests

Type-aware analysis refines symbol-use evidence (unused exports, class members, private type leaks). It does **not** replace `tsc` or Oxlint.

Check companion status:

```bash
pnpm fallow:status
```

## Enabled analyses

**Dead code:** unused files/exports/types/deps, enum/class members, server actions, unresolved imports, circular deps, re-export cycles, stale suppressions, private type leaks (warn).

**Duplication:** semantic mode, `minLines: 8`, `minTokens: 60`, `minOccurrences: 3`, import wiring excluded. Focuses on meaningful copy-paste, not shadcn or test boilerplate.

**Health:** cyclomatic (20), cognitive (15), CRAP (30), unit size (60). Identity baseline tracks per-function hotspots. Use `--hotspots`, `--targets`, `--ownership`, `--type-coupling` for inspection.

## Commands

```bash
pnpm fallow:dead-code      # Gate: dead-code identity baseline
pnpm fallow:dupes          # Gate: duplication identity baseline
pnpm fallow:health         # Gate: health identity baseline
pnpm fallow:audit          # Changed-files review (new-only gate)
pnpm fallow:ci             # Full CI gate (status + the three identity gates)
pnpm fallow:baseline:update   # Regenerate all baselines after genuine fixes
pnpm fallow:fix:preview    # Type-aware dry-run fixes
pnpm fallow:fix            # Apply safe fixes (not run in CI)
```

Fallow's count-based regression flags (`--save-regression-baseline` / `--fail-on-regression`) are not used: `--fail-on-regression` still exits 1 whenever issues exist (exit 1 means findings, not failure), and the identity gates above already reject every new finding, which subsumes a count regression.

## Inspecting findings

```bash
# Why is an export flagged?
pnpm exec fallow dead-code --trace apps/web/src/lib/preview.ts:buildPreviewPath

# Exact TypeScript consumers
pnpm exec fallow dead-code --type-aware --symbol-impact apps/web/src/lib/preview.ts:buildPreviewPath

# Duplication fingerprint
pnpm exec fallow dupes --trace dup:223eb16e

# Health hotspots and targets
pnpm exec fallow health --hotspots --targets --ownership

# Explain an issue type
pnpm exec fallow explain private-type-leak
```

## Updating baselines after improvements

When you remove findings legitimately:

```bash
pnpm fallow:baseline:update
git add .fallowrc.json fallow-baselines/
```

`baseline:update` writes the three exact baselines to `fallow-baselines/`. Committing them keeps the ratchet tight: a finding removed and later re-added fails CI again. Per the docs, regenerate the baselines periodically on `main` — never in CI.

## Configuration exclusions

| Pattern | Reason |
|---------|--------|
| `ignorePatterns: **/payload-types.ts`, `**/payload-generated-schema.ts` | Generated Payload types |
| `ignoreFindings: apps/web/src/migrations/**` | Payload migrations stay in the import graph; hide dead-code noise that blocks type-aware completeness |
| `ignoreExports: apps/web/src/components/ui/*.tsx` | shadcn re-exports full component API |
| `ignoreDependencies: tailwindcss, shadcn, …` | Tooling/CSS deps not imported as modules |
| `ignorePatterns: scripts/**` | Repo root gate scripts (not app source) |

## CI behavior

On pull requests, `pnpm fallow:ci`:

1. Verifies the type-aware companion (`fallow type-aware status`)
2. Runs the three identity gates on the full repo against the committed baselines: `fallow:dead-code`, `fallow:dupes`, `fallow:health`

`pnpm fallow:audit` remains available for local changed-file review. It is not in CI today because type-aware baselines currently fail audit identity checks (`capabilities` mismatch in Fallow 3.14.0).
