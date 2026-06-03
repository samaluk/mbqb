import { PageKicker, PageLede, PageShell, PageTitle } from '@/components/page'

import { BogeyficadorForm } from './BogeyficadorForm'

export default function BogeyficadorPage() {
  return (
    <PageShell className="grid grid-cols-[minmax(0,1fr)_minmax(320px,400px)] items-start gap-8 max-[760px]:grid-cols-1 max-[760px]:gap-4">
      <div>
        <PageKicker>Bogeyficador</PageKicker>
        <PageTitle>Revisa tu membresia MBQB activa.</PageTitle>
        <PageLede>
          Ingresa un RUT para confirmar si aparece como membresia activa en MBQB. El resultado
          publico no muestra nombres ni detalles internos.
        </PageLede>
      </div>
      <BogeyficadorForm />
    </PageShell>
  )
}
