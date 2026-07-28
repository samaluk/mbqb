# project

2026-07-27, whole-project Radix → Base UI migration via shadcn golden-pair CLI.

## Summary

- Style flipped: `radix-nova` → `base-nova` in `apps/web/components.json`.
- Installed `@base-ui/react@1.6.0` alongside `radix-ui`, then removed `radix-ui` after the last wrapper.
- Migrated pristine wrappers one-by-one with `shadcn add <name> --overwrite` (no bulk `--all`).
- Consumer sweep followed `consumer-props.md` (asChild→render / buttonVariants for links, Select items + nullable values, ToggleGroup arrays, Slider `onValueCommitted`).

## Migrated wrappers

separator, label, toggle, button, badge, slider, select, dropdown-menu, sheet, toggle-group

## Intentionally untouched

- `sonner` (third-party toast; skill hard rule)
- `card`, `empty`, `field`, `table`, `spinner`, `input` (no Radix imports / not Radix primitives)

## Final verify

- `pnpm typecheck` green
- `rg "radix-ui|@radix-ui" apps/web/src/components/ui` → 0 wrappers remain on Radix
- Unit tests green at each commit via pre-commit

## Behavior deltas flagged (see per-component reports)

- Button links use `buttonVariants` instead of Base UI Button `render`
- Dropdown checkbox items may keep the menu open (`closeOnClick` default false)
