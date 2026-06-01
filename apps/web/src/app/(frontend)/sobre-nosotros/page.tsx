export default function SobreNosotrosPage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-86px)] w-[min(1120px,calc(100%_-_48px))] content-start py-14 pb-24 max-[760px]:min-h-[calc(100vh-67px)] max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-7 max-[760px]:pb-14">
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        Sobre nosotros
      </div>
      <h1 className="my-3 max-w-[780px] text-[clamp(40px,6vw,72px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
        Una comunidad para jugar mas golf.
      </h1>
      <div className="editorial-copy grid max-w-[760px] gap-[18px]">
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
      </div>
    </section>
  )
}
