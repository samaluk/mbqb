import config from '@payload-config'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import { readCanchasUserGeoCookie } from '@/lib/canchasGeoCookie'
import { createPayloadCanchasAdapter, loadCanchasBrowsing } from '@/lib/canchasBrowsing'
import { getCmsQueryOptions } from '@/lib/cmsQuery'

import { CanchasFilteredResults } from './CanchasFilteredResults'
import { CanchasGeoProvider } from './CanchasGeoContext'
import { CanchasViewControls } from './CanchasViewControls'

type CanchasPageContentProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export async function CanchasPageContent({ searchParams }: CanchasPageContentProps) {
  const params = await searchParams
  const userGeo = await readCanchasUserGeoCookie()
  const payload = await getPayload({ config })
  const cmsQuery = await getCmsQueryOptions()
  const browsing = await loadCanchasBrowsing({
    canchas: createPayloadCanchasAdapter({ cmsQuery, payload }),
    searchParams: params,
    userGeo,
  })

  return (
    <Suspense fallback={null}>
      <CanchasGeoProvider initialUserGeo={userGeo}>
        <CanchasViewControls controls={browsing.controls} />
        <CanchasFilteredResults results={browsing.results} />
      </CanchasGeoProvider>
    </Suspense>
  )
}
