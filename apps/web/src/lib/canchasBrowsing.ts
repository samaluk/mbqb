import type { Where } from 'payload'

import type { CanchaMapItem } from '@/lib/canchas'
import {
  annotateCanchasWithDistance,
  paginateCanchas,
  type CanchaWithDistance,
} from '@/lib/canchasGeo'
import { getCanchasNearWhere } from '@/lib/canchasLocation'
import type { StoredUserGeo } from '@/lib/canchasUserGeo'

export type CanchasSort = {
  direction: 'asc' | 'desc'
  field: 'accessType' | 'city' | 'region' | 'title'
}

export type CanchasView = 'cards' | 'table'

export type CanchasFilters = {
  accessType: string
  city: string
  page: number
  pageSize: number
  q: string
  region: string
  sort: CanchasSort
  view: string
}

export type CanchasPaginationModel = {
  canchas: CanchaMapItem[]
  page: number
  pageSize: number
  totalDocs: number
  totalPages: number
}

export type CanchasBrowsingModel = {
  filterOptions: {
    accessTypes: string[]
    cities: string[]
    regions: string[]
  }
  mapCanchas?: CanchaMapItem[]
  pagination: CanchasPaginationModel
  showDistance: boolean
  sort: CanchasSort
  userGeo: StoredUserGeo | null
  view: CanchasView
}

type FindCanchasArgs = {
  depth: 0
  limit: number
  locale: 'es'
  page?: number
  pagination?: false
  sort?: string
  where?: Where
}

type FindCanchasResult = {
  docs: CanchaMapItem[]
  page?: number
  totalDocs: number
  totalPages: number
}

export type CanchasFinder = (args: FindCanchasArgs) => Promise<FindCanchasResult>

type LoadCanchasBrowsingArgs = {
  findCanchas: CanchasFinder
  searchParams: Record<string, string | string[] | undefined>
  userGeo: StoredUserGeo | null
}

const defaultPageSize = 10
const maxPageSize = 50
const geoFetchLimit = 1000
const sortableFields = new Set(['accessType', 'city', 'region', 'title'])

export async function loadCanchasBrowsing({
  findCanchas,
  searchParams,
  userGeo,
}: LoadCanchasBrowsingArgs): Promise<CanchasBrowsingModel> {
  const filters = parseCanchasFilters(searchParams)
  const view = filters.view === 'table' ? 'table' : 'cards'
  const where = getCanchasWhere(filters, userGeo)

  const [filterOptionsResult, tableResult, poolResult] = await Promise.all([
    findCanchas({
      depth: 0,
      limit: 1000,
      locale: 'es',
      sort: 'title',
    }),
    view === 'table'
      ? findCanchas({
          depth: 0,
          limit: filters.pageSize,
          locale: 'es',
          page: filters.page,
          sort: userGeo ? undefined : getPayloadSort(filters.sort),
          ...(where ? { where } : {}),
        })
      : Promise.resolve(null),
    view === 'cards'
      ? findCanchas({
          depth: 0,
          limit: geoFetchLimit,
          locale: 'es',
          page: 1,
          sort: userGeo ? undefined : 'title',
          ...(where ? { where } : {}),
        })
      : Promise.resolve(null),
  ])

  const poolDocs = poolResult ? annotatePool(poolResult.docs, userGeo) : []
  const cardsPagination = poolResult
    ? paginateCanchas(poolDocs, filters.page, filters.pageSize)
    : null
  const tableDocs = tableResult ? annotatePool(tableResult.docs, userGeo) : []

  return {
    filterOptions: {
      accessTypes: getUniqueValues(filterOptionsResult.docs, 'accessType'),
      cities: getUniqueValues(filterOptionsResult.docs, 'city'),
      regions: getUniqueValues(filterOptionsResult.docs, 'region'),
    },
    mapCanchas: userGeo && view === 'cards' ? poolDocs : undefined,
    pagination:
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
            },
    showDistance: userGeo !== null,
    sort: filters.sort,
    userGeo,
    view,
  }
}

export function parseCanchasFilters(
  params: Record<string, string | string[] | undefined>,
): CanchasFilters {
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

export function clampNumber(value: string, min: number, max: number, fallback: number) {
  if (!value.trim()) return fallback

  const number = Number(value)

  if (!Number.isInteger(number)) return fallback

  return Math.min(Math.max(number, min), max)
}

function getCanchasWhere(filters: CanchasFilters, userGeo?: StoredUserGeo | null) {
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

  if (userGeo) {
    and.push(getCanchasNearWhere(userGeo, userGeo.maxKm))
  }

  if (and.length === 0) return undefined
  if (and.length === 1) return and[0]

  return { and }
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

function annotatePool(docs: CanchaMapItem[], userGeo: StoredUserGeo | null) {
  if (!userGeo) return docs

  return annotateCanchasWithDistance(docs, userGeo) as CanchaWithDistance[]
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
