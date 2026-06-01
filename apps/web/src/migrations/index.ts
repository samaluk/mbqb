import * as migration_20260601_053237_drop_legacy_pages from './20260601_053237_drop_legacy_pages'

export const migrations = [
  {
    down: migration_20260601_053237_drop_legacy_pages.down,
    name: '20260601_053237_drop_legacy_pages',
    up: migration_20260601_053237_drop_legacy_pages.up,
  },
]
