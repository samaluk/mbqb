# sheet

2026-07-27, golden pair via CLI (`shadcn add sheet --overwrite` after style flip to base-nova). Pristine wrapper; verdict: migrated.

## Changed

- `apps/web/src/components/ui/sheet.tsx`: Radix Dialog-based Sheet → `@base-ui/react/dialog` base-nova variant (Backdrop/Popup).
- Leftover scan clean.

## Left alone

- No app call sites currently import Sheet (dead in product UI); wrapper migrated for registry consistency.
- Non-radix siblings untouched.

## Behavior changes

None observed (unused in app routes).

## Verify by hand

- If/when Sheet is wired into nav, check focus return, Escape, and outside click.
