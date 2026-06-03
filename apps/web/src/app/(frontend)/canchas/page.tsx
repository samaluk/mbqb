import config from '@payload-config'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import type { CanchaMapItem } from '@/lib/canchas'
import { annotateCanchasWithDistance, paginateCanchas, type CanchaWithDistance } from '@/lib/canchasGeo'
import { readCanchasUserGeoCookie } from '@/lib/canchasGeoCookie'
import { getCanchasWhere } from '@/lib/canchasQuery'

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
const geoFetchLimit = 1000
const sortableFields = new Set(['accessType', 'city', 'region', 'title'])

export default async function CanchasPage({ searchParams }: PageProps) {
  const params = await searchParams
  const filters = parseFilters(params)
  const view = filters.view === 'table' ? 'table' : 'cards'
  const userGeo = await readCanchasUserGeoCookie()
  const payload = await getPayload({ config })
  const where = getCanchasWhere(filters, userGeo)

  const [filterOptions, tableResult, poolResult] = await Promise.all([
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
          sort: userGeo ? undefined : getPayloadSort(filters.sort),
          ...(where ? { where } : {}),
        })
      : Promise.resolve(null),
    view === 'cards'
      ? payload.find({
          collection: 'canchas',
          depth: 0,
          limit: geoFetchLimit,
          locale: 'es',
          page: 1,
          sort: userGeo ? undefined : 'title',
          ...(where ? { where } : {}),
        })
      : Promise.resolve(null),
  ])

  const optionDocs = filterOptions.docs as CanchaMapItem[]
  const poolDocs = poolResult ? annotatePool(poolResult.docs as CanchaMapItem[], userGeo) : []
  const cardsPagination = poolResult
    ? paginateCanchas(poolDocs, filters.page, filters.pageSize)
    : null
  const tableDocs = tableResult ? annotatePool(tableResult.docs as CanchaMapItem[], userGeo) : []

  return (
    <section className="page-shell">
      <div className="page-kicker">Canchas</div>
      <h1 className="page-title">Donde jugar golf en Chile.</h1>
      <p className="page-lede">
        Guia editorial de canchas jugables, tipos de acceso, precios referenciales y datos utiles
        para planificar una salida.
      </p>
      <Suspense fallback={null}>
        <CanchasGeoProvider initialUserGeo={userGeo}>
          <CanchasViewControls
            accessTypes={getUniqueValues(optionDocs, 'accessType')}
            cities={getUniqueValues(optionDocs, 'city')}
            regions={getUniqueValues(optionDocs, 'region')}
            view={view}
          />
          <CanchasFilteredResults
            mapCanchas={userGeo && view === 'cards' ? poolDocs : undefined}
            pagination={
              view === 'table' && tableResult
                ? {
                    canchas: tableDocs,
                    page: tableResult.page ?? filters.page,
                    pageSize: filters.pageSize,
                    totalDocs: tableResult.totalDocs,
                    totalPages: tableResult.totalPages,
                  }
                : cardsPagination
                  ? {
                      canchas: cardsPagination.docs,
                      page: cardsPagination.page,
                      pageSize: filters.pageSize,
                      totalDocs: cardsPagination.totalDocs,
                      totalPages: cardsPagination.totalPages,
                    }
                  : {
                      canchas: [],
                      page: 1,
                      pageSize: filters.pageSize,
                      totalDocs: 0,
                      totalPages: 1,
                    }
            }
            searchParams={params}
            showDistance={userGeo !== null}
            sort={filters.sort}
            userGeo={userGeo}
            view={view}
          />
        </CanchasGeoProvider>
      </Suspense>
    </section>
  )
}

function annotatePool(docs: CanchaMapItem[], userGeo: Awaited<ReturnType<typeof readCanchasUserGeoCookie>>) {
  if (!userGeo) return docs

  return annotateCanchasWithDistance(docs, userGeo) as CanchaWithDistance[]
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

function getUniqueValues(docs: CanchaMapItem[], key: keyof CanchaMapItem): string[] {
  return Array.from(
    new Set(
      docs
        .map((doc) => doc[key])
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b, 'es'))
}
