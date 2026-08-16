# AGENTS.md

## Next.js agent rules

The version-matched Next.js agent-rules block lives in `apps/web/AGENTS.md`,
next to the `next` package it references (`node_modules/next/dist/docs/` does not
resolve from the repo root in this monorepo). `next dev` writes and refreshes
that block, so run `pnpm dev` once after a Next.js upgrade to update it. Read
`apps/web/AGENTS.md` before writing code in `apps/web`.

## Fallow quality ratchet

Fallow is the repository's code-quality ratchet (dead code, duplication,
complexity, architecture boundaries). The full setup is in `docs/fallow.md` and
the version-matched agent skill is vendored at `.agents/skills/fallow/`
(regenerate it from `node_modules/fallow/skills/fallow/` after a Fallow
upgrade).

Use it before touching code or opening a PR:

- Load the `fallow` skill before analyzing, fixing, or gating code.
- Run the authoritative gate with `pnpm fallow:ci` (requires `pnpm
  test:unit:coverage` first — CI does this automatically).
- Inspect a finding with `pnpm exec fallow dead-code --trace <file>:<symbol>`
  or `pnpm exec fallow explain <issue-type>`.
- Never delete a symbol fallow flags without tracing its consumers
  (`--symbol-impact` with type-aware evidence). Delete an unused export or
  dependency only after `pnpm fallow:fix:preview` shows it is safe, and never
  run `fallow:fix` in CI.
- Never `|| true` a fallow command: exit 1 means findings (normal), exit 2
  means a real analyzer/config error and must fail the run.
- Respect architecture boundaries (`fallow guard <files>` shows the rules) and
  the env-hygiene policy (oxlint `node/no-process-env`: no direct
  `process.env` reads in app code — use `apps/web/src/env.ts`).
- Existing debt is baselined in `fallow-baselines/`; new debt is rejected.
  After a genuine fix, run `pnpm fallow:baseline:update` and commit the
  reduced baselines. Never regenerate baselines just to silence CI.

The `fallow-mcp` server is configured repo-locally in `.mcp.json`.

## Agent skills

### Testing

For testing changes, follow `docs/agents/testing-principles.md` in addition to repository-specific commands and framework guidance.

### Issue tracker

Issues and PRDs for this repo live as GitHub issues; use the `gh` CLI. See `docs/agents/issue-tracker.md`.

### Triage labels

Use the default canonical triage labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, and `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Use a single-context layout with root `CONTEXT.md` and `docs/adr/`. See `docs/agents/domain.md`.
