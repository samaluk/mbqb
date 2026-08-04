import config from '@payload-config'
import Link from 'next/link'
import { cacheLife } from 'next/cache'
import { notFound } from 'next/navigation'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import {
  MetaPills,
  PageDetail,
  PageKicker,
  PageLede,
  PageTitle,
  RichContent,
} from '@/components/page'
import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from '@/lib/canchas'
import { getCmsQueryOptions, getPublishedCmsQueryOptions } from '@/lib/cmsQuery'
import { isPayloadUnavailableError } from '@/lib/payloadUnavailableError'
import type { Cancha } from '@/payload-types'

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default function CanchaDetailPage({ params }: PageProps) {
  return (
    <Suspense fallback={null}>
      <CanchaDetailContent params={params} />
    </Suspense>
  )
}

async function CanchaDetailContent({ params }: PageProps) {
  const { slug } = await params
  const { isEnabled: draft } = await draftMode()
  const cancha = draft ? await getDraftCancha(slug) : await getPublishedCancha(slug)

  if (!cancha) notFound()

  const canchaItem = cancha as CanchaMapItem
  const metaItems = [
    canchaAccessLabels[cancha.accessType],
    ...(cancha.region ? [cancha.region] : []),
    ...(cancha.city ? [cancha.city] : []),
  ]

  return (
    <PageDetail>
      <Link className="back-link" href="/canchas">
        Volver a canchas
      </Link>
      <PageKicker>Cancha</PageKicker>
      <PageTitle>{cancha.title}</PageTitle>
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
    </PageDetail>
  )
}

async function getPublishedCancha(slug: string): Promise<Cancha | null> {
  'use cache'
  cacheLife('publicContent')

  try {
    const payload = await getPayload({ config })
    const canchas = await payload.find({
      collection: 'canchas',
      depth: 1,
      limit: 1,
      locale: 'es',
      ...getPublishedCmsQueryOptions(),
      where: {
        slug: {
          equals: slug,
        },
      },
    })

    return canchas.docs[0] ?? null
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error(`Failed to load cancha "${slug}"`, error)
    }

    return null
  }
}

async function getDraftCancha(slug: string): Promise<Cancha | null> {
  const payload = await getPayload({ config })
  const cmsQuery = await getCmsQueryOptions()
  const canchas = await payload.find({
    collection: 'canchas',
    depth: 1,
    limit: 1,
    locale: 'es',
    ...cmsQuery,
    where: {
      slug: {
        equals: slug,
      },
    },
  })

  return canchas.docs[0] ?? null
}
