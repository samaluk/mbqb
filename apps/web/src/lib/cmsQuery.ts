import { draftMode } from 'next/headers'

export async function getCmsQueryOptions() {
  const { isEnabled: draft } = await draftMode()

  return {
    draft,
    overrideAccess: draft,
  } as const
}
