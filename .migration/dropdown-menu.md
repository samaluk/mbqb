# dropdown-menu

2026-07-27, golden pair via CLI (`shadcn add dropdown-menu --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/dropdown-menu.tsx`: Radix DropdownMenu → `@base-ui/react/menu` base-nova variant.
- Leftover scan clean.
- `CanchasColumnControls.tsx`: `DropdownMenuTrigger asChild` → `render={<Button ... />}`.

## Left alone

- CheckboxItem `closeOnClick` left at Base UI default (false). Not patched.

## Behavior changes

- Checkbox/radio menu items do not auto-close on select (Base UI default). Flagged; add `closeOnClick` only if product asks.

## Verify by hand

- Canchas column picker opens from the trigger button.
- Toggling checkboxes updates column visibility; note whether menu stays open.
