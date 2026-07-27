# select

2026-07-27, golden pair via CLI (`shadcn add select --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/select.tsx`: replaced Radix Select with `@base-ui/react/select` base-nova variant (Portal > Positioner > Popup, List, ScrollArrows).
- Leftover scan clean: no `radix-ui` / `@radix-ui` / `IconPlaceholder`.
- Consumers:
  - `CanchasViewControls.tsx` `FilterSelect`: pass `items`, guard `onValueChange` for `null`.
  - `CanchasPageSizeSelect.tsx`: pass `items`, null-guard `onValueChange`, `alignItemWithTrigger={false}` with `side="top"`.

## Left alone

- Non-radix siblings untouched.

## Behavior changes

- `onValueChange` may emit `null` (cleared selection); call sites ignore null.
- SelectValue labels come from the `items` map rather than only child text.

## Verify by hand

- Canchas filters (access/region/city) open, typeahead/select, update URL.
- Page-size select opens upward and changes page size.
