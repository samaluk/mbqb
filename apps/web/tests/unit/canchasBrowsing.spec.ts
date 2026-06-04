import { describe, expect, it } from 'vitest'

import type { CanchaMapItem } from '@/lib/canchas'
import { loadCanchasBrowsing, parseCanchasFilters, type CanchasFinder } from '@/lib/canchasBrowsing'

const cancha = (overrides: Partial<CanchaMapItem> = {}): CanchaMapItem => ({
  accessType: 'pay-and-play',
  city: 'Santiago',
  id: 1,
  location: [-70.6, -33.4],
  region: 'Metropolitana',
  slug: 'sample',
  summary: 'Sample summary',
  title: 'Sample',
  ...overrides,
})

describe('parseCanchasFilters', () => {
  it('parses page, page size, sort, and first array param values', () => {
    expect(
      parseCanchasFilters({
        accessType: ['private', 'pay-and-play'],
        page: '3',
        pageSize: '99',
        sort: '-city',
        view: 'table',
      }),
    ).toMatchObject({
      accessType: 'private',
      page: 3,
      pageSize: 50,
      sort: {
        direction: 'desc',
        field: 'city',
      },
      view: 'table',
    })
  })

  it('falls back to title sorting for unknown fields', () => {
    expect(parseCanchasFilters({ sort: '-distance' }).sort).toEqual({
      direction: 'asc',
      field: 'title',
    })
  })
})

describe('loadCanchasBrowsing', () => {
  it('builds a page-ready cards model from filtered Canchas', async () => {
    const docs = [
      cancha({ id: 1, city: 'Santiago', title: 'B Cancha' }),
      cancha({ id: 2, city: 'Valdivia', region: 'Los Rios', title: 'A Cancha' }),
    ]
    const calls: Parameters<CanchasFinder>[0][] = []
    const findCanchas: CanchasFinder = async (args) => {
      calls.push(args)

      return {
        docs,
        page: args.page,
        totalDocs: docs.length,
        totalPages: 1,
      }
    }

    const model = await loadCanchasBrowsing({
      findCanchas,
      searchParams: {
        pageSize: '1',
        q: 'Cancha',
      },
      userGeo: null,
    })

    expect(model.view).toBe('cards')
    expect(model.filterOptions).toEqual({
      accessTypes: ['pay-and-play'],
      cities: ['Santiago', 'Valdivia'],
      regions: ['Los Rios', 'Metropolitana'],
    })
    expect(model.pagination).toMatchObject({
      page: 1,
      pageSize: 1,
      totalDocs: 2,
      totalPages: 2,
    })
    expect(model.pagination.canchas).toHaveLength(1)
    expect(calls).toHaveLength(2)
    expect(calls[1]).toMatchObject({
      limit: 1000,
      page: 1,
      sort: 'title',
      where: {
        or: [
          { title: { contains: 'Cancha' } },
          { summary: { contains: 'Cancha' } },
        ],
      },
    })
  })

  it('uses distance-ready table results when user geo is present', async () => {
    const docs = [
      cancha({ id: 1, location: [-70.6, -33.4] }),
      cancha({ id: 2, location: null, title: 'Sin coordenadas' }),
    ]
    const calls: Parameters<CanchasFinder>[0][] = []
    const findCanchas: CanchasFinder = async (args) => {
      calls.push(args)

      return {
        docs,
        page: args.page,
        totalDocs: docs.length,
        totalPages: 1,
      }
    }

    const model = await loadCanchasBrowsing({
      findCanchas,
      searchParams: {
        page: '2',
        sort: '-region',
        view: 'table',
      },
      userGeo: {
        latitude: -33.4489,
        longitude: -70.6693,
        maxKm: 50,
      },
    })

    expect(model.view).toBe('table')
    expect(model.showDistance).toBe(true)
    expect(model.pagination.canchas).toHaveLength(1)
    expect(model.pagination.canchas[0]).toHaveProperty('distanceKm')
    expect(calls[1]).toMatchObject({
      limit: 10,
      page: 2,
      sort: undefined,
      where: {
        location: {
          near: [-70.6693, -33.4489, 50_000],
        },
      },
    })
  })
})
