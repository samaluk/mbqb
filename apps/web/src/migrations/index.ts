import * as migration_20260604_000000_baseline from './20260604_000000_baseline'

export const migrations = [
  {
    down: migration_20260604_000000_baseline.down,
    name: '20260604_000000_baseline',
    up: migration_20260604_000000_baseline.up,
  },
]

