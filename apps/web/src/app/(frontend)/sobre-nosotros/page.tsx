import { EditorialBody, PageKicker, PageShell, PageTitle } from '@/components/page'

export default function SobreNosotrosPage() {
  return (
    <PageShell className="grid content-start">
      <PageKicker>Sobre nosotros</PageKicker>
      <PageTitle>Una comunidad para jugar mas golf.</PageTitle>
      <EditorialBody>
        <p>
          MBQB nacio desde la experiencia de aprender golf sin venir de una familia de golf ni de un
          club tradicional. Entender donde jugar, que palos comprar, como federarse y como moverse en
          una cancha no era evidente.
        </p>
        <p>
          Primero fue un canal de YouTube para documentar ese proceso como aficionado. Despues se
          transformo en una comunidad para reunir datos utiles, experiencias reales y oportunidades
          para que mas personas puedan jugar.
        </p>
        <p>
          Hoy MBQB acerca el golf a personas que quieren aprender, jugar y sentirse parte sin las
          barreras tradicionales del deporte.
        </p>
      </EditorialBody>
    </PageShell>
  )
}
