import type { MigrateUpArgs } from '@payloadcms/db-postgres'

const versionedCollections = ['canchas', 'la-biblia-articles', 'products'] as const

export async function up({ payload }: MigrateUpArgs): Promise<void> {
  if (!payload) {
    return
  }

  for (const collection of versionedCollections) {
    await payload.update({
      collection,
      data: {
        _status: 'published',
      },
      overrideAccess: true,
      where: {},
    })
  }

  await payload.updateGlobal({
    slug: 'home-page',
    data: {
      _status: 'published',
    },
    overrideAccess: true,
  })
}

export async function down(): Promise<void> {
  // Irreversible data backfill.
}
