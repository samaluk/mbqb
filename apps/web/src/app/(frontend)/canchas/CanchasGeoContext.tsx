'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import * as React from 'react'

import type { StoredUserGeo } from '@/lib/canchasUserGeo'

import { clearCanchasUserGeo, setCanchasUserGeo } from './actions'

type CanchasGeoContextValue = {
  hasGeoFilter: boolean
  isGeoPending: boolean
  setUserGeo: (geo: StoredUserGeo | null) => void
  userGeo: StoredUserGeo | null
}

const CanchasGeoContext = React.createContext<CanchasGeoContextValue | null>(null)

export function CanchasGeoProvider({
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
        await setCanchasUserGeo(geo)
      } else {
        await clearCanchasUserGeo()
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

  return <CanchasGeoContext value={value}>{children}</CanchasGeoContext>
}

export function useCanchasGeo() {
  const context = React.use(CanchasGeoContext)

  if (!context) {
    throw new Error('useCanchasGeo must be used within CanchasGeoProvider')
  }

  return context
}
