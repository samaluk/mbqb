import { Suspense } from 'react'

import { PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'

import { PlacesPageContent } from './PlacesPageContent'

export const metadata = { title: 'Lugares' }

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default function PlacesPage({ searchParams }: PageProps) {
  return (
    <PageShell>
      <PageKicker>Lugares</PageKicker>
      <PageTitle data-testid="places-list-title">
        Directorio de lugares y espacios comunitarios.
      </PageTitle>
      <PageLede>Guía de lugares, tipos de acceso y ubicaciones para la comunidad.</PageLede>
      <Suspense fallback={null}>
        <PlacesPageContent searchParams={searchParams} />
      </Suspense>
    </PageShell>
  )
}
