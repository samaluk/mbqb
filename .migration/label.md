# label

2026-07-27, golden pair via CLI (`shadcn add label --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/label.tsx`: replaced Radix-based nova wrapper with base-nova registry variant.
- Leftover scan clean: `grep -n "radix-ui\|@radix-ui\|IconPlaceholder"` on this file returned no matches.

## Left alone

- Non-radix siblings (sonner, card, empty, field, table, spinner) untouched.
- App consumers: no label-specific call-site prop changes required for this leaf.

## Behavior changes

None observed for this leaf primitive.

## Verify by hand

- Confirm label still renders in any screen that uses it.
- No keyboard/focus regressions expected for this leaf.
