import Link from 'next/link'
import { draftMode } from 'next/headers'
import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import {
  MetaPills,
  PageDetail,
  PageKicker,
  PageLede,
  PageTitle,
  RichContent,
} from '@/components/page'
import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from '@/lib/canchas'
import { getDraftPayloadDocBySlug, getPublishedPayloadDocBySlug } from '@/lib/payloadBySlug'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default function CanchaDetailPage({ params }: PageProps) {
  return (
    <PageDetail>
      <Link className="back-link" data-testid="cancha-detail-back-link" href="/canchas">
        Volver a canchas
      </Link>
      <PageKicker>Cancha</PageKicker>
      <Suspense fallback={null}>
        <CanchaDetailContent params={params} />
      </Suspense>
    </PageDetail>
  )
}

async function CanchaDetailContent({ params }: PageProps) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const cancha = draft
    ? await getDraftPayloadDocBySlug('canchas', slug)
    : await getPublishedPayloadDocBySlug('canchas', slug)

  if (!cancha) notFound()

  // oxlint-disable-next-line typescript/consistent-type-assertions
  const canchaItem = cancha as CanchaMapItem
  const metaItems = [
    canchaAccessLabels[cancha.accessType],
    ...(cancha.region ? [cancha.region] : []),
    ...(cancha.city ? [cancha.city] : []),
  ]

  return (
    <>
      <PageTitle data-testid="cancha-detail-title">{cancha.title}</PageTitle>
      <MetaPills items={metaItems} />
      {cancha.summary ? <PageLede className="max-w-195">{cancha.summary}</PageLede> : null}
      <a
        className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-green bg-transparent px-4 font-bold text-green no-underline"
        href={getGoogleMapsUrl(canchaItem)}
        rel="noreferrer"
        target="_blank"
      >
        Abrir en Google Maps
      </a>
      <RichContent body={cancha.body} />
    </>
  )
}
