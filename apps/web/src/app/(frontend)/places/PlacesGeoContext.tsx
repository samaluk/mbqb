'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

import type { StoredUserGeo } from '@/lib/placesUserGeo'

import { clearPlacesUserGeo, setPlacesUserGeo } from './actions'

type PlacesGeoContextValue = {
  hasGeoFilter: boolean
  isGeoPending: boolean
  setUserGeo: (geo: StoredUserGeo | null) => void
  userGeo: StoredUserGeo | null
}

const PlacesGeoContext = React.createContext<PlacesGeoContextValue | null>(null)

export function PlacesGeoProvider({
  children,
  initialUserGeo,
}: {
  children: React.ReactNode
  initialUserGeo: StoredUserGeo | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isGeoPending, startTransition] = React.useTransition()
  const [userGeo, setUserGeoState] = React.useState(initialUserGeo)
  const [syncedInitialUserGeo, setSyncedInitialUserGeo] = React.useState(initialUserGeo)

  if (initialUserGeo !== syncedInitialUserGeo) {
    setSyncedInitialUserGeo(initialUserGeo)
    setUserGeoState(initialUserGeo)
  }

  const resetPageAndRefresh = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('page')
    const nextQuery = params.toString()
    router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
    router.refresh()
  }

  const setUserGeo = (geo: StoredUserGeo | null) => {
    setUserGeoState(geo)

    startTransition(async () => {
      if (geo) {
        await setPlacesUserGeo(geo)
      } else {
        await clearPlacesUserGeo()
      }

      resetPageAndRefresh()
    })
  }

  // React Compiler caches this value automatically.
  const value = {
    hasGeoFilter: userGeo !== null,
    isGeoPending,
    setUserGeo,
    userGeo,
  }

  return <PlacesGeoContext value={value}>{children}</PlacesGeoContext>
}

export function usePlacesGeo() {
  const context = React.use(PlacesGeoContext)

  if (!context) {
    throw new Error('usePlacesGeo must be used within PlacesGeoProvider')
  }

  return context
}
