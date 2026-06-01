'use client'

import dynamic from 'next/dynamic'

import type { CanchaMapItem } from '@/lib/canchas'

const CanchasMap = dynamic(() => import('./CanchasMap'), {
  loading: () => (
    <div className="sticky top-6 z-0 grid min-h-[680px] place-items-center overflow-hidden rounded-lg border border-line bg-white-soft text-base font-bold text-muted max-[760px]:relative max-[760px]:top-auto max-[760px]:min-h-[220px]">
      Cargando mapa
    </div>
  ),
  ssr: false,
})

export function CanchasMapLoader({ canchas }: { canchas: CanchaMapItem[] }) {
  return <CanchasMap canchas={canchas} />
}
