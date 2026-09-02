import config from '@payload-config'
import { cacheLife } from 'next/cache'
import { draftMode } from 'next/headers'
import { getPayload } from 'payload'

import { getCmsQueryOptions } from '@/lib/cmsQuery'
import { isPayloadUnavailableError } from '@/lib/payloadUnavailableError'
import type { SiteSetting } from '@/payload-types'

export const DEFAULT_SITE_SETTINGS: SiteSetting = {
  id: 0,
  brandName: 'Community',
  siteDescription: 'A platform for community connection and shared knowledge.',
  defaultLocale: 'en',
  lang: 'en',
  memberIdentifierType: 'generic',
  createdAt: '',
  updatedAt: '',
}

async function fetchSiteSettings(options: {
  draft: boolean
  overrideAccess: boolean
}): Promise<SiteSetting> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({
      slug: 'site-settings',
      depth: 1,
      ...options,
    })

    return {
      ...DEFAULT_SITE_SETTINGS,
      ...settings,
    }
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error('Failed to load site settings', error)
    }

    return DEFAULT_SITE_SETTINGS
  }
}

async function getPublishedSiteSettings(): Promise<SiteSetting> {
  'use cache'
  cacheLife('publicContent')

  return fetchSiteSettings({ draft: false, overrideAccess: false })
}

export async function getSiteSettings(): Promise<SiteSetting> {
  try {
    const { isEnabled: draft } = await draftMode()
    if (!draft) {
      return await getPublishedSiteSettings()
    }

    const cmsQuery = await getCmsQueryOptions()

    return await fetchSiteSettings(cmsQuery)
  } catch {
    return await getPublishedSiteSettings()
  }
}
