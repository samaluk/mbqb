import * as migration_20260601_053237_drop_legacy_pages from './20260601_053237_drop_legacy_pages'
import * as migration_20260602_003617_cms_home_page_video from './20260602_003617_cms_home_page_video'
import * as migration_20260602_120000_sync_missing_payload_schema from './20260602_120000_sync_missing_payload_schema'

export const migrations = [
  {
    down: migration_20260601_053237_drop_legacy_pages.down,
    name: '20260601_053237_drop_legacy_pages',
    up: migration_20260601_053237_drop_legacy_pages.up,
  },
  {
    down: migration_20260602_003617_cms_home_page_video.down,
    name: '20260602_003617_cms_home_page_video',
    up: migration_20260602_003617_cms_home_page_video.up,
  },
  {
    down: migration_20260602_120000_sync_missing_payload_schema.down,
    name: '20260602_120000_sync_missing_payload_schema',
    up: migration_20260602_120000_sync_missing_payload_schema.up,
  },
]
