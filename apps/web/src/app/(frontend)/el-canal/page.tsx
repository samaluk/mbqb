import { EditorialBody, PageKicker, PageShell, PageTitle } from '@/components/page'

export default function ElCanalPage() {
  return (
    <PageShell className="grid content-start">
      <PageKicker>El Canal</PageKicker>
      <PageTitle>Golf chileno contado desde la cancha.</PageTitle>
      <EditorialBody>
        <p>
          MBQB partio como un canal para documentar el progreso de un golfista aficionado y abrir
          una conversacion que faltaba entre clubes, jugadores, marcas y la gente que rodea el golf.
        </p>
        <p>
          En el canal mostramos canchas, datos utiles, historias y experiencias reales para quienes
          estan empezando o quieren jugar mas. La idea es simple: que el golf se entienda mejor y se
          sienta menos cerrado.
        </p>
        <p>
          Si estas partiendo, los videos son una forma practica de conocer donde jugar, que esperar
          en una cancha y como moverte con mas confianza dentro de la comunidad.
        </p>
      </EditorialBody>
    </PageShell>
  )
}
