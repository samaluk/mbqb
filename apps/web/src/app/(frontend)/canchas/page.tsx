import config from '@payload-config'
import Link from 'next/link'
import { getPayload } from 'payload'

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
    <section className="mx-auto min-h-[calc(100vh-86px)] w-[min(1120px,calc(100%_-_48px))] py-14 pb-24 max-[760px]:min-h-[calc(100vh-67px)] max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        Canchas
      </div>
      <h1 className="my-3 max-w-[780px] text-[clamp(40px,6vw,72px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        Donde jugar golf en Chile.
      </h1>
      <p className="m-0 max-w-[640px] text-xl text-muted max-[760px]:text-base max-[760px]:leading-[1.45]">
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </p>
      <div className="mt-9 grid grid-cols-[minmax(360px,0.95fr)_minmax(0,1.05fr)] items-start gap-6 max-[760px]:mt-[22px] max-[760px]:grid-cols-1 max-[760px]:gap-3.5">
        <CanchasMapLoader canchas={canchaDocs} />
        <div
          className="grid max-h-[680px] gap-3.5 overflow-auto pr-1 max-[760px]:max-h-none max-[760px]:gap-2.5 max-[760px]:overflow-visible max-[760px]:pr-0"
          aria-label="Listado de canchas"
        >
          {canchaDocs.map((cancha, index) => (
            <article
              className="grid min-w-0 content-start gap-2.5 rounded-lg border border-line bg-white-soft p-[18px] max-[760px]:gap-[9px] max-[760px]:p-[13px]"
              key={cancha.id}
            >
              <div className="flex items-start gap-2.5">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-green text-[13px] font-black text-white-soft max-[760px]:size-6 max-[760px]:text-xs">
                  {index + 1}
                </span>
                <div className="flex flex-wrap gap-2 text-[13px] font-extrabold uppercase text-green max-[760px]:gap-1.5 max-[760px]:text-[11px]">
                  <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
                    {canchaAccessLabels[cancha.accessType]}
                  </span>
                  {cancha.region ? (
                    <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
                      {cancha.region}
                    </span>
                  ) : null}
                  {cancha.city ? (
                    <span className="rounded-full border border-green/20 px-2 py-[3px] max-[760px]:px-[7px] max-[760px]:py-0.5">
                      {cancha.city}
                    </span>
                  ) : null}
                </div>
              </div>
              <h2 className="m-0 text-2xl leading-[1.15] max-[760px]:text-xl">
                {cancha.title}
              </h2>
              {cancha.summary ? (
                <p className="max-w-none text-base text-muted max-[760px]:text-sm max-[760px]:leading-[1.4]">
                  {cancha.summary}
                </p>
              ) : null}
              <div className="flex flex-wrap gap-3">
                <Link
                  className="text-[15px] font-extrabold text-green"
                  href={`/canchas/${cancha.slug}`}
                >
                  Ver ficha
                </Link>
                <a
                  className="text-[15px] font-extrabold text-green"
                  href={getGoogleMapsUrl(cancha)}
                  rel="noreferrer"
                  target="_blank"
                >
                  Google Maps
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
