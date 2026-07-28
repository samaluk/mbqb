# toggle

2026-07-27, golden pair via CLI (`shadcn add toggle --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/toggle.tsx`: replaced Radix-based nova wrapper with base-nova registry variant.
- Leftover scan clean: `grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` on this file returned no matches.

## Left alone

- Non-radix siblings (sonner, card, empty, field, table, spinner) untouched.
- App consumers: no toggle-specific call-site prop changes required for this leaf.

## Behavior changes

None observed for this leaf primitive.

## Verify by hand

- Confirm toggle still renders in any screen that uses it.
- No keyboard/focus regressions expected for this leaf.
