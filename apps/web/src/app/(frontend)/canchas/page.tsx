import config from '@payload-config'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import { readCanchasUserGeoCookie } from '@/lib/canchasGeoCookie'
import { createPayloadCanchasAdapter, loadCanchasBrowsing } from '@/lib/canchasBrowsing'
import { getCmsQueryOptions } from '@/lib/cmsQuery'

import { PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'

import { CanchasFilteredResults } from './CanchasFilteredResults'
import { CanchasGeoProvider } from './CanchasGeoContext'
import { CanchasViewControls } from './CanchasViewControls'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CanchasPage({ searchParams }: PageProps) {
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
    <PageShell>
      <PageKicker>Canchas</PageKicker>
      <PageTitle>Donde jugar golf en Chile.</PageTitle>
      <PageLede>
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </PageLede>
      <Suspense fallback={null}>
        <CanchasGeoProvider initialUserGeo={userGeo}>
          <CanchasViewControls controls={browsing.controls} />
          <CanchasFilteredResults results={browsing.results} />
        </CanchasGeoProvider>
      </Suspense>
    </PageShell>
  )
}
