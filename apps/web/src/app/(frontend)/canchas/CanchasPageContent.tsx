import config from '@payload-config'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import { readCanchasUserGeoCookie } from '@/lib/canchasGeoCookie'
import { createPayloadCanchasAdapter, loadCanchasBrowsing } from '@/lib/canchasBrowsing'
import { getCmsQueryOptions } from '@/lib/cmsQuery'

import { CanchasFilteredResults } from './CanchasFilteredResults'
import { CanchasGeoProvider } from './CanchasGeoContext'
import { CanchasViewControls } from './CanchasViewControls'

export type CanchasPageContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CanchasPageContent({ searchParams }: CanchasPageContentProps) {
  const params = await searchParams
  // Cookie read, Payload boot, and CMS query options don't depend on each
  // other, so race them. The browsing load depends on all three results, so
  // it chains once they settle.
  const { browsing, userGeo } = await Promise.all([
    readCanchasUserGeoCookie(),
    getPayload({ config }),
    getCmsQueryOptions(),
  ]).then(async ([geo, payload, cmsQuery]) => ({
    userGeo: geo,
    browsing: await loadCanchasBrowsing({
      canchas: createPayloadCanchasAdapter({ cmsQuery, payload }),
      searchParams: params,
      userGeo: geo,
    }),
  }))

  return (
    <Suspense fallback={null}>
      <CanchasGeoProvider initialUserGeo={userGeo}>
        <CanchasViewControls controls={browsing.controls} />
        <CanchasFilteredResults results={browsing.results} />
      </CanchasGeoProvider>
    </Suspense>
  )
}
