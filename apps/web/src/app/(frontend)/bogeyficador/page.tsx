import { PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'

import { BogeyficadorForm } from './BogeyficadorForm'

export const metadata = { title: 'Bogeyficador' }

export default function BogeyficadorPage() {
  return (
    <PageShell className="grid grid-cols-bogeyficador items-start gap-8 max-[760px]:grid-cols-1 max-[760px]:gap-4">
      <div>
        <PageKicker>Bogeyficador</PageKicker>
        <PageTitle>Revisa tu membresia activa.</PageTitle>
        <PageLede>
          Ingresa un RUT para confirmar si aparece como membresia activa. El resultado publico no
          muestra nombres ni detalles internos.
        </PageLede>
      </div>
      <BogeyficadorForm />
    </PageShell>
  )
}
