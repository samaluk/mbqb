'use client'

import dynamic from 'next/dynamic'

import type { CanchaMapItem } from '@/lib/canchas'

const CanchasMap = dynamic(() => import('./CanchasMap'), {
  loading: () => <div className="canchas-map map-loading">Cargando mapa</div>,
  ssr: false,
})

export function CanchasMapLoader({ canchas }: { canchas: CanchaMapItem[] }) {
  return <CanchasMap canchas={canchas} />
}
