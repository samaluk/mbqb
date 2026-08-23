import type { Payload, Where } from 'payload'

import type { CanchaMapItem } from '@/lib/canchas'
import { annotateCanchasWithDistance, paginateCanchas } from '@/lib/canchasGeo'
import { getCanchasNearWhere } from '@/lib/canchasLocation'
import type { StoredUserGeo } from '@/lib/canchasUserGeo'

export type CanchasSort = {
  direction: 'asc' | 'desc'
  field: 'accessType' | 'city' | 'region' | 'title'
}

export type CanchasView = 'cards' | 'table'

type CanchasFilters = {
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
  firstRow: number
  label: string
  page: number
  pageLabel: string
  pageSize: number
  pageSizeOptions: CanchasPageSizeOption[]
  links: {
    first: CanchasPaginationLink
    last: CanchasPaginationLink
    next: CanchasPaginationLink
    previous: CanchasPaginationLink
  }
  totalDocs: number
  totalPages: number
}

export type CanchasPaginationLink = {
  disabled: boolean
  href: string
}

export type CanchasPageSizeOption = {
  href: string
  value: number
}

export type CanchasSortLink = {
  active: boolean
  direction: CanchasSort['direction']
  disabled: boolean
  href: string
}

export type CanchasNavigationModel = {
  sortLinks: Record<CanchasSort['field'], CanchasSortLink>
}

export type CanchasControlsModel = {
  filterOptions: {
    accessTypes: string[]
    cities: string[]
    regions: string[]
  }
  view: CanchasView
}

export type CanchasResultsModel = {
  mapCanchas?: CanchaMapItem[]
  navigation: CanchasNavigationModel
  pagination: CanchasPaginationModel
  showDistance: boolean
  sort: CanchasSort
  userGeo: StoredUserGeo | null
  view: CanchasView
}

export type CanchasBrowsingModel = {
  controls: CanchasControlsModel
  results: CanchasResultsModel
}

export type FindCanchasArgs = {
  depth: 0
  limit: number
  locale: 'es'
  page?: number
  pagination?: false
  sort?: string
  where?: Where
}

export type FindCanchasResult = {
  docs: CanchaMapItem[]
  page?: number
  totalDocs: number
  totalPages: number
}

export type CanchasFinder = (args: FindCanchasArgs) => Promise<FindCanchasResult>

export type CanchasAdapter = {
  find: CanchasFinder
}

export type CanchasCmsQueryOptions = {
  draft: boolean
  overrideAccess: boolean
}

export type LoadCanchasBrowsingArgs = {
  canchas: CanchasAdapter
  searchParams: Record<string, string | string[] | undefined>
  userGeo: StoredUserGeo | null
}

const defaultPageSize = 10
const maxPageSize = 50
const geoFetchLimit = 1000
function isSortField(field: string): field is CanchasSort['field'] {
  switch (field) {
    case 'accessType':
    case 'city':
    case 'region':
    case 'title':
      return true
    default:
      return false
  }
}

export function createPayloadCanchasAdapter({
  cmsQuery,
  payload,
}: {
  cmsQuery: CanchasCmsQueryOptions
  payload: Pick<Payload, 'find'>
}): CanchasAdapter {
  return {
    find: async (args) => {
      const result = await payload.find({
        collection: 'canchas',
        ...args,
        ...cmsQuery,
      })

      return {
        // oxlint-disable-next-line typescript/consistent-type-assertions, typescript/no-unnecessary-type-assertion
        docs: result.docs as CanchaMapItem[],
        page: result.page ?? undefined,
        totalDocs: result.totalDocs,
        totalPages: result.totalPages,
      }
    },
  }
}

export async function loadCanchasBrowsing({
  canchas,
  searchParams,
  userGeo,
}: LoadCanchasBrowsingArgs): Promise<CanchasBrowsingModel> {
  const filters = parseCanchasFilters(searchParams)
  const view = filters.view === 'table' ? 'table' : 'cards'
  const hrefSearchParams = normalizeCanchasSearchParams(searchParams, filters)
  const where = getCanchasWhere(filters, userGeo)

  const [filterOptionsResult, tableResult, poolResult] = await Promise.all([
    canchas.find({
      depth: 0,
      limit: 1000,
      locale: 'es',
      sort: 'title',
    }),
    view === 'table'
      ? canchas.find({
          depth: 0,
          limit: filters.pageSize,
          locale: 'es',
          page: filters.page,
          sort: userGeo ? undefined : getPayloadSort(filters.sort),
          ...(where ? { where } : {}),
        })
      : Promise.resolve(null),
    view === 'cards'
      ? canchas.find({
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
  const pagination =
    view === 'table' && tableResult
      ? buildPaginationModel({
          docs: tableDocs,
          page: tableResult.page ?? filters.page,
          pageSize: filters.pageSize,
          searchParams: hrefSearchParams,
          totalDocs: tableResult.totalDocs,
          totalPages: tableResult.totalPages,
          view,
        })
      : cardsPagination
        ? buildPaginationModel({
            docs: cardsPagination.docs,
            page: cardsPagination.page,
            pageSize: filters.pageSize,
            searchParams: hrefSearchParams,
            totalDocs: cardsPagination.totalDocs,
            totalPages: cardsPagination.totalPages,
            view,
          })
        : buildPaginationModel({
            docs: [],
            page: 1,
            pageSize: filters.pageSize,
            searchParams: hrefSearchParams,
            totalDocs: 0,
            totalPages: 1,
            view,
          })
  const filterOptions = {
    accessTypes: getUniqueValues(filterOptionsResult.docs, 'accessType'),
    cities: getUniqueValues(filterOptionsResult.docs, 'city'),
    regions: getUniqueValues(filterOptionsResult.docs, 'region'),
  }
  const controls: CanchasControlsModel = {
    filterOptions,
    view,
  }
  const results: CanchasResultsModel = {
    mapCanchas: userGeo && view === 'cards' ? poolDocs : undefined,
    navigation: {
      sortLinks: buildSortLinks(hrefSearchParams, filters.sort, userGeo !== null),
    },
    pagination,
    showDistance: userGeo !== null,
    sort: filters.sort,
    userGeo,
    view,
  }

  return {
    controls,
    results,
  }
}

function parseCanchasFilters(
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

function clampNumber(value: string, min: number, max: number, fallback: number) {
  if (!value.trim()) return fallback

  const number = Number(value)

  if (!Number.isInteger(number)) return fallback

  return Math.min(Math.max(number, min), max)
}

function getCanchasHref(
  searchParams: Record<string, string | string[] | undefined>,
  updates: Record<string, null | string>,
  options?: { view?: CanchasView },
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    const paramValue = Array.isArray(value) ? value[0] : value
    if (paramValue) params.set(key, paramValue)
  }

  if (options?.view === 'table') {
    params.set('view', 'table')
  }

  if (options?.view === 'cards') {
    params.delete('view')
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
  }

  const query = params.toString()

  return query ? `/canchas?${query}` : '/canchas'
}

function normalizeCanchasSearchParams(
  searchParams: Record<string, string | string[] | undefined>,
  filters: CanchasFilters,
) {
  const normalized: Record<string, string> = {}

  for (const key of ['accessType', 'city', 'q', 'region', 'view'] as const) {
    const value = filters[key]
    if (value) normalized[key] = value
  }

  if (hasParam(searchParams.page)) normalized.page = `${filters.page}`
  if (hasParam(searchParams.pageSize)) normalized.pageSize = `${filters.pageSize}`
  if (hasParam(searchParams.sort)) {
    normalized.sort = `${filters.sort.direction === 'desc' ? '-' : ''}${filters.sort.field}`
  }

  return normalized
}

function hasParam(value: string | string[] | undefined) {
  return getParam(value).trim().length > 0
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

  if (isSortField(field)) {
    return {
      direction,
      field,
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

function buildPaginationModel({
  docs,
  page,
  pageSize,
  searchParams,
  totalDocs,
  totalPages,
  view,
}: {
  docs: CanchaMapItem[]
  page: number
  pageSize: number
  searchParams: Record<string, string | string[] | undefined>
  totalDocs: number
  totalPages: number
  view: CanchasView
}): CanchasPaginationModel {
  const firstRow = totalDocs === 0 ? 0 : (page - 1) * pageSize + 1
  const lastRow = Math.min(page * pageSize, totalDocs)
  const hrefOptions = { view }

  return {
    canchas: docs,
    firstRow,
    label: `${firstRow}-${lastRow} de ${totalDocs} canchas`,
    links: {
      first: {
        disabled: page <= 1,
        href: getCanchasHref(searchParams, { page: '1' }, hrefOptions),
      },
      last: {
        disabled: page >= totalPages,
        href: getCanchasHref(searchParams, { page: `${totalPages}` }, hrefOptions),
      },
      next: {
        disabled: page >= totalPages,
        href: getCanchasHref(searchParams, { page: `${page + 1}` }, hrefOptions),
      },
      previous: {
        disabled: page <= 1,
        href: getCanchasHref(searchParams, { page: `${page - 1}` }, hrefOptions),
      },
    },
    page,
    pageLabel: `Pagina ${page} de ${Math.max(totalPages, 1)}`,
    pageSize,
    pageSizeOptions: [10, 20, 50].map((value) => ({
      href: getCanchasHref(searchParams, { page: null, pageSize: `${value}` }, hrefOptions),
      value,
    })),
    totalDocs,
    totalPages,
  }
}

function buildSortLinks(
  searchParams: Record<string, string | string[] | undefined>,
  sort: CanchasSort,
  disabled: boolean,
): Record<CanchasSort['field'], CanchasSortLink> {
  return {
    accessType: buildSortLink(searchParams, sort, 'accessType', disabled),
    city: buildSortLink(searchParams, sort, 'city', disabled),
    region: buildSortLink(searchParams, sort, 'region', disabled),
    title: buildSortLink(searchParams, sort, 'title', disabled),
  }
}

function buildSortLink(
  searchParams: Record<string, string | string[] | undefined>,
  sort: CanchasSort,
  field: CanchasSort['field'],
  disabled: boolean,
): CanchasSortLink {
  const active = sort.field === field
  const direction = active && sort.direction === 'asc' ? 'desc' : 'asc'

  return {
    active,
    direction,
    disabled,
    href: getCanchasHref(
      searchParams,
      {
        page: null,
        sort: `${direction === 'desc' ? '-' : ''}${field}`,
      },
      { view: 'table' },
    ),
  }
}

function annotatePool(docs: CanchaMapItem[], userGeo: StoredUserGeo | null) {
  if (!userGeo) return docs

  return annotateCanchasWithDistance(docs, userGeo)
}

function getUniqueValues(docs: CanchaMapItem[], key: keyof CanchaMapItem): string[] {
  return Array.from(
    new Set(
      docs
        .map((doc) => doc[key])
        .filter((value): value is string => typeof value === 'string' && value.length > 0),
    ),
  ).toSorted((a, b) => a.localeCompare(b, 'es'))
}
