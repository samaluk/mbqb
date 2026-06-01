import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from '@/lib/canchas'

import { CanchasMapLoader } from './CanchasMapLoader'

export const dynamic = 'force-dynamic'

export default async function CanchasPage() {
  const payload = await getPayload({ config })
  const canchas = await payload.find({
    collection: 'canchas',
    depth: 0,
    limit: 50,
    locale: 'es',
    sort: 'title',
  })
  const canchaDocs = canchas.docs as CanchaMapItem[]

  return (
    <section className="page-shell">
      <div className="page-kicker">Canchas</div>
      <h1 className="page-title">Donde jugar golf en Chile.</h1>
      <p className="page-lede">
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </p>
      <div className="mt-6 grid grid-cols-[minmax(320px,0.85fr)_minmax(0,1.15fr)] items-start gap-4 max-[760px]:mt-4 max-[760px]:grid-cols-1 max-[760px]:gap-3">
        <CanchasMapLoader canchas={canchaDocs} />
        <div
          className="grid max-h-[680px] gap-2 overflow-auto pr-1 max-[760px]:max-h-none max-[760px]:overflow-visible max-[760px]:pr-0"
          aria-label="Listado de canchas"
        >
          {canchaDocs.map((cancha, index) => (
            <Card className="compact-card min-w-0" key={cancha.id}>
              <CardHeader>
                <div className="flex items-start gap-2.5">
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-green text-[13px] font-black text-white-soft max-[760px]:size-6 max-[760px]:text-xs">
                    {index + 1}
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">{canchaAccessLabels[cancha.accessType]}</Badge>
                    {cancha.region ? <Badge variant="outline">{cancha.region}</Badge> : null}
                    {cancha.city ? <Badge variant="outline">{cancha.city}</Badge> : null}
                  </div>
                </div>
                <CardTitle className="compact-card-title">{cancha.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                {cancha.summary ? (
                  <p className="max-w-none text-base text-muted max-[760px]:text-sm max-[760px]:leading-[1.4]">
                    {cancha.summary}
                  </p>
                ) : null}
                <div className="compact-actions">
                  <Button asChild className="font-extrabold" variant="link">
                    <Link href={`/canchas/${cancha.slug}`}>Ver ficha</Link>
                  </Button>
                  <Button asChild className="font-extrabold" variant="link">
                    <a href={getGoogleMapsUrl(cancha)} rel="noreferrer" target="_blank">
                      Google Maps
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
