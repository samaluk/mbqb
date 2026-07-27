# toggle-group

2026-07-27, golden pair via CLI (`shadcn add toggle-group --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/toggle-group.tsx`: Radix ToggleGroup → `@base-ui/react/toggle-group` + Toggle items.
- Leftover scan clean.
- `CanchasViewControls.tsx`: removed `type="single"`; `value`/`onValueChange` use arrays (`value={[view]}`, read `value[0]`).

## Left alone

- Non-radix siblings untouched.

## Behavior changes

- Value shape is always an array; single-select is the default when `multiple` is omitted.

## Verify by hand

- Canchas Mapa/Tabla toggle switches view and updates the URL.
- Deselecting all items is ignored by the null/empty guard.
