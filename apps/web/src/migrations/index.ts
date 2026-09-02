import * as migration_20260604_000000_baseline from './20260604_000000_baseline'
import * as migration_20260902_000000_rename_active_memberships_to_memberships from './20260902_000000_rename_active_memberships_to_memberships'

export const migrations = [
  {
    down: migration_20260604_000000_baseline.down,
    name: '20260604_000000_baseline',
    up: migration_20260604_000000_baseline.up,
  },
  {
    down: migration_20260902_000000_rename_active_memberships_to_memberships.down,
    name: '20260902_000000_rename_active_memberships_to_memberships',
    up: migration_20260902_000000_rename_active_memberships_to_memberships.up,
  },
]
