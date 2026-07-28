# button

2026-07-27, golden pair via CLI (`shadcn add button --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/button.tsx`: replaced Radix `Slot`/`asChild` button with `@base-ui/react/button` primitive from base-nova.
- Leftover scan clean: no `radix-ui` / `@radix-ui` / `IconPlaceholder` in the wrapper.
- Consumer sweep (link compositions cannot use Base UI Button `render` safely — Base UI forces `role="button"`):
  - `apps/web/src/app/(frontend)/page.tsx`
  - `apps/web/src/app/(frontend)/productos/page.tsx`
  - `apps/web/src/app/(frontend)/la-biblia/page.tsx`
  - `apps/web/src/app/(frontend)/canchas/CanchasFilteredResults.tsx`
  - `apps/web/src/app/(frontend)/canchas/CanchasDataTable.tsx`
  - `apps/web/src/app/(frontend)/canchas/CanchasPagination.tsx`
  - Each former `<Button asChild><Link/></Button>` is now `<Link className={buttonVariants(...)} />` (or `<a>`).

## Left alone

- `DropdownMenuTrigger asChild` in `CanchasColumnControls.tsx` — deferred until dropdown-menu migration.
- Non-radix wrappers (sonner, card, empty, field, table, spinner) untouched.

## Behavior changes

- Link-styled actions no longer mount a Base UI Button element; they are plain links styled via `buttonVariants` (matches shadcn Base Button docs guidance).

## Verify by hand

- Home hero CTAs navigate to bogeyficador / canchas.
- Productos / La Biblia card links navigate.
- Canchas table title/sort/pagination/maps links still work and look like buttons.
