import { EditorialBody, PageKicker, PageShell, PageTitle } from '@/components/page'

export default function ConveniosPage() {
  return (
    <PageShell className="grid content-start">
      <PageKicker>Convenios</PageKicker>
      <PageTitle>Beneficios para jugar mas.</PageTitle>
      <EditorialBody>
        <p>
          MBQB es una comunidad de jugadores que quieren conocer mas, jugar mas y compartir mas. Por
          eso trabajamos con clubes amigos para abrir condiciones preferentes a miembros activos.
        </p>
        <p>
          Los convenios pueden incluir tarifas preferenciales, fechas especiales o accesos definidos
          por cada club. Su disponibilidad depende siempre de las condiciones vigentes de cada
          cancha.
        </p>
        <p>
          Para usarlos, la persona debe aparecer con membresia MBQB activa. El Bogeyficador permite
          revisar ese estado sin exponer datos personales ni detalles internos.
        </p>
      </EditorialBody>
    </PageShell>
  )
}
