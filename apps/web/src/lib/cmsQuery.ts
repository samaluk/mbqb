import { draftMode } from 'next/headers'

export async function getCmsQueryOptions() {
  const { isEnabled: draft } = await draftMode()

  return {
    draft,
    overrideAccess: draft,
  } as const
}

export function getPublishedCmsQueryOptions() {
  return {
    draft: false,
    overrideAccess: false,
  } as const
}
