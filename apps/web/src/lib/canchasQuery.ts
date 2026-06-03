import type { Where } from 'payload'

import { getCanchasNearWhere } from '@/lib/canchasLocation'
import type { StoredUserGeo } from '@/lib/canchasUserGeo'

type CanchasTextFilters = {
  accessType: string
  city: string
  q: string
  region: string
}

export function getCanchasWhere(filters: CanchasTextFilters, userGeo?: StoredUserGeo | null) {
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
