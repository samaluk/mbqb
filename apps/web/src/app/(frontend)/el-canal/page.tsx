export default function ElCanalPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-86px)] w-[min(1120px,calc(100%_-_48px))] content-start py-14 pb-24 max-[760px]:min-h-[calc(100vh-67px)] max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        El Canal
      </div>
      <h1 className="my-3 max-w-[780px] text-[clamp(40px,6vw,72px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        Golf chileno contado desde la cancha.
      </h1>
      <div className="editorial-copy grid max-w-[760px] gap-[18px]">
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
      </div>
    </section>
  )
}
