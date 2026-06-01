export default function ConveniosPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-86px)] w-[min(1120px,calc(100%_-_48px))] content-start py-14 pb-24 max-[760px]:min-h-[calc(100vh-67px)] max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        Convenios
      </div>
      <h1 className="my-3 max-w-[780px] text-[clamp(40px,6vw,72px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        Beneficios para jugar mas.
      </h1>
      <div className="editorial-copy grid max-w-[760px] gap-[18px]">
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
      </div>
    </section>
  )
}
