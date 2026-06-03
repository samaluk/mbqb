"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"
import * as React from "react"

import {
  canchasGeoChangedEvent,
  readStoredUserGeo,
  writeStoredUserGeo,
  type StoredUserGeo,
} from "@/lib/canchasLocationStorage"

type CanchasGeoContextValue = {
  hasGeoFilter: boolean
  setUserGeo: (geo: StoredUserGeo | null) => void
  userGeo: StoredUserGeo | null
}

const CanchasGeoContext = React.createContext<CanchasGeoContextValue | null>(null)

function subscribeToStoredUserGeo(onStoreChange: () => void) {
  window.addEventListener(canchasGeoChangedEvent, onStoreChange)

  return () => window.removeEventListener(canchasGeoChangedEvent, onStoreChange)
}

function getStoredUserGeoSnapshot() {
  return readStoredUserGeo()
}

export function CanchasGeoProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const searchParams = useSearchParams()
  const userGeo = React.useSyncExternalStore(
    subscribeToStoredUserGeo,
    getStoredUserGeoSnapshot,
    () => null,
  )

  const setUserGeo = React.useCallback(
    (geo: StoredUserGeo | null) => {
      writeStoredUserGeo(geo)

      const params = new URLSearchParams(searchParams.toString())
      params.delete("page")
      const nextQuery = params.toString()
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname)
    },
    [pathname, router, searchParams],
  )

  const value = React.useMemo(
    () => ({
      hasGeoFilter: userGeo !== null,
      setUserGeo,
      userGeo,
    }),
    [setUserGeo, userGeo],
  )

  return <CanchasGeoContext value={value}>{children}</CanchasGeoContext>
}

export function useCanchasGeo() {
  const context = React.use(CanchasGeoContext)

  if (!context) {
    throw new Error("useCanchasGeo must be used within CanchasGeoProvider")
  }

  return context
}
