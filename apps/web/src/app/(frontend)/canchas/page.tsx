import { Suspense } from 'react'

import { PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'

import { CanchasPageContent } from './CanchasPageContent'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function CanchasPage({ searchParams }: PageProps) {
  return (
    <PageShell>
      <PageKicker>Canchas</PageKicker>
      <PageTitle>Donde jugar golf en Chile.</PageTitle>
      <PageLede>
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </PageLede>
      <Suspense fallback={null}>
        <CanchasPageContent searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}
