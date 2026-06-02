import config from '@payload-config'
import Link from 'next/link'
import { getPayload, type Where } from 'payload'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { canchaAccessLabels, getGoogleMapsUrl, type CanchaMapItem } from '@/lib/canchas'

import { CanchasDataTable, type CanchasSort } from './CanchasDataTable'
import { CanchasMapLoader } from './CanchasMapLoader'
import { CanchasViewControls } from './CanchasViewControls'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultPageSize = 10
const maxPageSize = 50
const sortableFields = new Set(['accessType', 'city', 'region', 'title'])

export default async function CanchasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)
  const payload = await getPayload({ config })
  const where = getCanchasWhere(filters)
  const canchas = await payload.find({
    collection: 'canchas',
    depth: 0,
    limit: filters.pageSize,
    locale: 'es',
    page: filters.page,
    sort: getPayloadSort(filters.sort),
    ...(where ? { where } : {}),
  })
  const filterOptions = await payload.find({
    collection: 'canchas',
    depth: 0,
    limit: 1000,
    locale: 'es',
    sort: 'title',
  })
  const canchaDocs = canchas.docs as CanchaMapItem[]
  const optionDocs = filterOptions.docs as CanchaMapItem[]
  const view = filters.view === 'table' ? 'table' : 'cards'

  return (
    <section className="page-shell">
      <div className="page-kicker">Canchas</div>
      <h1 className="page-title">Donde jugar golf en Chile.</h1>
      <p className="page-lede">
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </p>
      <CanchasViewControls
        accessTypes={getUniqueValues(optionDocs, 'accessType')}
        cities={getUniqueValues(optionDocs, 'city')}
        regions={getUniqueValues(optionDocs, 'region')}
        view={view}
      />
      {view === 'table' ? (
        <CanchasDataTable
          canchas={canchaDocs}
          page={canchas.page ?? filters.page}
          pageSize={filters.pageSize}
          searchParams={params}
          sort={filters.sort}
          totalDocs={canchas.totalDocs}
          totalPages={canchas.totalPages}
        />
      ) : (
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
                      {(filters.page - 1) * filters.pageSize + index + 1}
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
      )}
    </section>
  )
}

function parseFilters(params: Record<string, string | string[] | undefined>) {
  const sort = parseSort(getParam(params.sort))

  return {
    accessType: getParam(params.accessType),
    city: getParam(params.city),
    page: clampNumber(getParam(params.page), 1, 9999, 1),
    pageSize: clampNumber(getParam(params.pageSize), 1, maxPageSize, defaultPageSize),
    q: getParam(params.q),
    region: getParam(params.region),
    sort,
    view: getParam(params.view),
  }
}

function getParam(value: string | string[] | undefined) {
  if (Array.isArray(value)) return value[0] ?? ''

  return value ?? ''
}

function clampNumber(value: string, min: number, max: number, fallback: number) {
  const number = Number(value)

  if (!Number.isInteger(number)) return fallback

  return Math.min(Math.max(number, min), max)
}

function parseSort(value: string): CanchasSort {
  const direction = value.startsWith('-') ? 'desc' : 'asc'
  const field = value.replace(/^-/, '')

  if (sortableFields.has(field)) {
    return {
      direction,
      field: field as CanchasSort['field'],
    }
  }

  return {
    direction: 'asc',
    field: 'title',
  }
}

function getPayloadSort(sort: CanchasSort) {
  return `${sort.direction === 'desc' ? '-' : ''}${sort.field}`
}

function getCanchasWhere(filters: ReturnType<typeof parseFilters>) {
  const and: Where[] = []

  if (filters.q) {
    and.push({
      or: [
        {
          title: {
            contains: filters.q,
          },
        },
        {
          summary: {
            contains: filters.q,
          },
        },
      ],
    })
  }

  if (filters.accessType) {
    and.push({
      accessType: {
        equals: filters.accessType,
      },
    })
  }

  if (filters.region) {
    and.push({
      region: {
        equals: filters.region,
      },
    })
  }

  if (filters.city) {
    and.push({
      city: {
        equals: filters.city,
      },
    })
  }

  if (and.length === 0) return undefined
  if (and.length === 1) return and[0]

  return { and }
}

function getUniqueValues(docs: CanchaMapItem[], key: keyof CanchaMapItem): string[] {
  return Array.from(
    new Set(
      docs
        .map((doc) => doc[key])
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b, 'es'))
}
