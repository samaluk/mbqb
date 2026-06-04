'use client'

import { RefreshRouteOnSave as PayloadRefreshRouteOnSave } from '@payloadcms/live-preview-react'
import { useRouter } from 'next/navigation'

import { env } from '@/env'

export function RefreshRouteOnSave() {
  const router = useRouter()

  return (
    <PayloadRefreshRouteOnSave
      refresh={() => router.refresh()}
      serverURL={env.NEXT_PUBLIC_SERVER_URL}
    />
  )
}
