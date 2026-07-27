# badge

2026-07-27, golden pair via CLI (`shadcn add badge --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/badge.tsx`: replaced Radix-based nova wrapper with base-nova registry variant.
- Leftover scan clean: no `radix-ui` / `@radix-ui` / `IconPlaceholder`.

## Left alone

- Non-radix siblings untouched.
- App consumers: no badge-specific call-site prop renames required beyond this commit unless noted below.

## Behavior changes

None for this step.

## Verify by hand

- Confirm badge still renders where used.
