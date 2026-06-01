import { BogeyficadorForm } from './BogeyficadorForm'

export default function BogeyficadorPage() {
  return (
    <section className="page-shell grid grid-cols-[minmax(0,1fr)_minmax(320px,400px)] items-start gap-8 max-[760px]:grid-cols-1 max-[760px]:gap-4">
      <div>
        <div className="page-kicker">Bogeyficador</div>
        <h1 className="page-title">Revisa tu membresia MBQB activa.</h1>
        <p className="page-lede">
          Ingresa un RUT para confirmar si aparece como membresia activa en MBQB. El resultado
          publico no muestra nombres ni detalles internos.
        </p>
      </div>
      <BogeyficadorForm />
    </section>
  )
}
