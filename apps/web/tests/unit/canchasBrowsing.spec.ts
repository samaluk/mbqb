import { describe, expect, it } from 'vitest'

import type { CanchaMapItem } from '@/lib/canchas'
import { loadCanchasBrowsing, type CanchasAdapter } from '@/lib/canchasBrowsing'

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

describe('loadCanchasBrowsing', () => {
  it('builds a page-ready cards model from filtered Canchas', async () => {
    const docs = [
      cancha({ id: 1, city: 'Santiago', title: 'B Cancha' }),
      cancha({ id: 2, city: 'Valdivia', region: 'Los Rios', title: 'A Cancha' }),
    ]
    const calls: Parameters<CanchasAdapter['find']>[0][] = []
    const canchas: CanchasAdapter = {
      find: async (args) => {
        calls.push(args)

        return {
          docs,
          page: args.page,
          totalDocs: docs.length,
          totalPages: 1,
        }
      },
    }

    const model = await loadCanchasBrowsing({
      canchas,
      searchParams: {
        pageSize: '1',
        q: 'Cancha',
      },
      userGeo: null,
    })

    expect(model.controls.view).toBe('cards')
    expect(model.controls.filterOptions).toEqual({
      accessTypes: ['pay-and-play'],
      cities: ['Santiago', 'Valdivia'],
      regions: ['Los Rios', 'Metropolitana'],
    })
    expect(model.results.pagination).toMatchObject({
      label: '1-1 de 2 canchas',
      page: 1,
      pageLabel: 'Pagina 1 de 2',
      pageSize: 1,
      totalDocs: 2,
      totalPages: 2,
    })
    expect(model.results.pagination.canchas).toHaveLength(1)
    expect(model.results.pagination.links.next).toEqual({
      disabled: false,
      href: '/canchas?q=Cancha&pageSize=1&page=2',
    })
    expect(model.results.pagination.pageSizeOptions).toContainEqual({
      href: '/canchas?q=Cancha&pageSize=20',
      value: 20,
    })
    expect(model.results.navigation.sortLinks.city).toMatchObject({
      active: false,
      disabled: false,
      direction: 'asc',
      href: '/canchas?q=Cancha&pageSize=1&view=table&sort=city',
    })
    expect(calls).toHaveLength(2)
    expect(calls[1]).toMatchObject({
      limit: 1000,
      page: 1,
      sort: 'title',
      where: {
        or: [{ title: { contains: 'Cancha' } }, { summary: { contains: 'Cancha' } }],
      },
    })
  })

  it('uses distance-ready table results when user geo is present', async () => {
    const docs = [
      cancha({ id: 1, location: [-70.6, -33.4] }),
      cancha({ id: 2, location: null, title: 'Sin coordenadas' }),
    ]
    const calls: Parameters<CanchasAdapter['find']>[0][] = []
    const canchas: CanchasAdapter = {
      find: async (args) => {
        calls.push(args)

        return {
          docs,
          page: args.page,
          totalDocs: docs.length,
          totalPages: 1,
        }
      },
    }

    const model = await loadCanchasBrowsing({
      canchas,
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

    expect(model.results.view).toBe('table')
    expect(model.results.showDistance).toBe(true)
    expect(model.results.navigation.sortLinks.region).toMatchObject({
      active: true,
      disabled: true,
      href: '/canchas?view=table&sort=region',
    })
    expect(model.results.pagination.canchas).toHaveLength(1)
    expect(model.results.pagination.canchas[0]).toHaveProperty('distanceKm')
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

  it('normalizes malformed page, page size, sort, and repeated query values internally', async () => {
    const docs = [cancha()]
    const calls: Parameters<CanchasAdapter['find']>[0][] = []
    const canchas: CanchasAdapter = {
      find: async (args) => {
        calls.push(args)

        return {
          docs,
          page: args.page,
          totalDocs: docs.length,
          totalPages: 1,
        }
      },
    }

    const model = await loadCanchasBrowsing({
      canchas,
      searchParams: {
        accessType: ['private', 'pay-and-play'],
        page: 'nope',
        pageSize: '99',
        q: ['club', 'ignored'],
        sort: '-distance',
        view: 'table',
      },
      userGeo: null,
    })

    expect(model.results.pagination.page).toBe(1)
    expect(model.results.pagination.pageSize).toBe(50)
    expect(model.results.sort).toEqual({
      direction: 'asc',
      field: 'title',
    })
    expect(model.results.navigation.sortLinks.city.href).toBe(
      '/canchas?accessType=private&q=club&view=table&pageSize=50&sort=city',
    )
    expect(calls[1]).toMatchObject({
      limit: 50,
      page: 1,
      sort: 'title',
      where: {
        and: [
          {
            or: [{ title: { contains: 'club' } }, { summary: { contains: 'club' } }],
          },
          {
            accessType: {
              equals: 'private',
            },
          },
        ],
      },
    })
  })
})
