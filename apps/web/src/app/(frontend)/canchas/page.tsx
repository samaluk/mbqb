import config from '@payload-config'
import { Suspense } from 'react'
import { getPayload, type Where } from 'payload'

import type { CanchaMapItem } from '@/lib/canchas'

import { clampNumber } from './canchasSearchParams'
import { CanchasFilteredResults } from './CanchasFilteredResults'
import { CanchasGeoProvider } from './CanchasGeoContext'
import { CanchasViewControls } from './CanchasViewControls'
import type { CanchasSort } from './CanchasDataTable'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

const defaultPageSize = 10
const maxPageSize = 50
const sortableFields = new Set(['accessType', 'city', 'region', 'title'])

export default async function CanchasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)
  const view = filters.view === 'table' ? 'table' : 'cards'
  const payload = await getPayload({ config })
  const where = getCanchasWhere(filters)
  const [canchaPool, filterOptions, tableCanchas] = await Promise.all([
    payload.find({
      collection: 'canchas',
      depth: 0,
      limit: 1000,
      locale: 'es',
      page: 1,
      sort: 'title',
      ...(where ? { where } : {}),
    }),
    payload.find({
      collection: 'canchas',
      depth: 0,
      limit: 1000,
      locale: 'es',
      sort: 'title',
    }),
    view === 'table'
      ? payload.find({
          collection: 'canchas',
          depth: 0,
          limit: filters.pageSize,
          locale: 'es',
          page: filters.page,
          sort: getPayloadSort(filters.sort),
          ...(where ? { where } : {}),
        })
      : Promise.resolve(null),
  ])
  const optionDocs = filterOptions.docs as CanchaMapItem[]

  return (
    <section className="page-shell">
      <div className="page-kicker">Canchas</div>
      <h1 className="page-title">Donde jugar golf en Chile.</h1>
      <p className="page-lede">
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </p>
      <Suspense fallback={null}>
        <CanchasGeoProvider>
          <CanchasViewControls
            accessTypes={getUniqueValues(optionDocs, 'accessType')}
            cities={getUniqueValues(optionDocs, 'city')}
            regions={getUniqueValues(optionDocs, 'region')}
            view={view}
          />
          <CanchasFilteredResults
            canchaPool={canchaPool.docs as CanchaMapItem[]}
            filters={{
              page: filters.page,
              pageSize: filters.pageSize,
              sort: filters.sort,
            }}
            searchParams={params}
            serverTable={
              tableCanchas
                ? {
                    canchas: tableCanchas.docs as CanchaMapItem[],
                    page: tableCanchas.page ?? filters.page,
                    totalDocs: tableCanchas.totalDocs,
                    totalPages: tableCanchas.totalPages,
                  }
                : undefined
            }
            view={view}
          />
        </CanchasGeoProvider>
      </Suspense>
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
