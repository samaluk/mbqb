# slider

2026-07-27, golden pair via CLI (`shadcn add slider --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/slider.tsx`: replaced Radix-based nova wrapper with base-nova registry variant.
- Leftover scan clean: no `radix-ui` / `@radix-ui` / `IconPlaceholder`.

## Left alone

- Non-radix siblings untouched.
- App consumers: no slider-specific call-site prop renames required beyond this commit unless noted below.

## Behavior changes

None for this step.

## Verify by hand

- Confirm slider still renders where used.

Consumer note: `CanchasLocationFilter.tsx` renamed `onValueCommit` → `onValueCommitted` and
narrows `number | number[]` callback values before indexing.
