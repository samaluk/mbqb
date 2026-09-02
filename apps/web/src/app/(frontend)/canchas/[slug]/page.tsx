import {
  MetaPills,
  PageLede,
  PayloadDocDetail,
  RichContent,
  type SlugPageProps,
} from '@/components/page'
import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from '@/lib/canchas'
import { payloadDocMetadata } from '@/lib/payloadBySlug'
import type { Cancha } from '@/payload-types'

export const generateMetadata = payloadDocMetadata('canchas', 'Canchas')

export default function CanchaDetailPage({ params }: SlugPageProps) {
  return (
    <PayloadDocDetail
      backHref="/canchas"
      backLabel="Volver a canchas"
      backTestId="cancha-detail-back-link"
      collection="canchas"
      kicker="Cancha"
      params={params}
      titleTestId="cancha-detail-title"
    >
      {(cancha) => <CanchaDetailBody cancha={cancha} />}
    </PayloadDocDetail>
  )
}

function CanchaDetailBody({ cancha }: { cancha: Cancha }) {
  // getGoogleMapsUrl consumes the narrower map-item shape.
  // oxlint-disable-next-line typescript/consistent-type-assertions
  const canchaItem = cancha as CanchaMapItem
  const metaItems = [
    canchaAccessLabels[cancha.accessType],
    ...(cancha.region ? [cancha.region] : []),
    ...(cancha.city ? [cancha.city] : []),
  ]

  return (
    <>
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
