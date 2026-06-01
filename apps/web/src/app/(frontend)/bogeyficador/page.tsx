import { BogeyficadorForm } from './BogeyficadorForm'

export default function BogeyficadorPage() {
  return (
    <section className="mx-auto grid w-[min(1120px,calc(100%_-_48px))] grid-cols-[minmax(0,1fr)_minmax(320px,420px)] items-start gap-12 py-14 pb-24 max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:grid-cols-1 max-[760px]:gap-[18px] max-[760px]:py-7 max-[760px]:pb-14">
      <div>
        <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
          Bogeyficador
        </div>
        <h1 className="my-3 max-w-[780px] text-[clamp(40px,6vw,72px)] leading-none max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)]">
          Revisa tu membresia MBQB activa.
        </h1>
        <p className="m-0 max-w-[640px] text-xl text-muted max-[760px]:text-base max-[760px]:leading-[1.45]">
          Ingresa un RUT para confirmar si aparece como membresia activa en MBQB. El resultado
          publico no muestra nombres ni detalles internos.
        </p>
      </div>
      <BogeyficadorForm />
    </section>
  )
}
