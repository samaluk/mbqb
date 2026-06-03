import config from '@payload-config'
import Link from 'next/link'
import { notFound } from 'next/navigation'
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

type PageProps = {
  params: Promise<{
    slug: string
  }>
}

export default async function CanchaDetailPage({ params }: PageProps) {
  const { slug } = await params
  const payload = await getPayload({ config })
  const canchas = await payload.find({
    collection: 'canchas',
    depth: 0,
    limit: 1,
    locale: 'es',
    where: {
      slug: {
        equals: slug,
      },
    },
  })
  const cancha = canchas.docs[0]

  if (!cancha) notFound()

  const canchaItem = cancha as CanchaMapItem
  const metaItems = [
    canchaAccessLabels[cancha.accessType],
    ...(cancha.region ? [cancha.region] : []),
    ...(cancha.city ? [cancha.city] : []),
  ]

  return (
    <PageDetail>
      <Link className="w-fit text-[15px] font-extrabold text-green no-underline" href="/canchas">
        Volver a canchas
      </Link>
      <PageKicker>Cancha</PageKicker>
      <PageTitle>{cancha.title}</PageTitle>
      <MetaPills items={metaItems} />
      {cancha.summary ? <PageLede className="max-w-[780px]">{cancha.summary}</PageLede> : null}
      <a
        className="inline-flex min-h-10 w-fit items-center justify-center rounded-md border border-green bg-transparent px-4 font-bold text-green no-underline"
        href={getGoogleMapsUrl(canchaItem)}
        rel="noreferrer"
        target="_blank"
      >
        Abrir en Google Maps
      </a>
      <RichContent html={cancha.bodyHtml} />
    </PageDetail>
  )
}
