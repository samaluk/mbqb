'use client'

import dynamic from 'next/dynamic'

import type { CanchaMapItem } from '@/lib/canchas'
import type { GeoPoint } from '@/lib/canchasGeo'

const CanchasMap = dynamic(() => import('./CanchasMap'), {
  loading: () => (
    <div className="sticky top-6 z-0 grid min-h-170 place-items-center overflow-hidden rounded-lg border border-line bg-white-soft text-base font-bold text-muted max-[760px]:relative max-[760px]:top-auto max-[760px]:min-h-55">
      Cargando mapa
    </div>
  ),
  ssr: false,
})

export function CanchasMapLoader({
  canchas,
  userLocation,
}: {
  canchas: CanchaMapItem[]
  userLocation?: GeoPoint | null
}) {
  return <CanchasMap canchas={canchas} userLocation={userLocation ?? null} />
}
