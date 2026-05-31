import { BogeyficadorForm } from './BogeyficadorForm'

export default function BogeyficadorPage() {
  return (
    <section className="page-shell bogeyficador">
      <div>
        <div className="eyebrow">Bogeyficador</div>
        <h1>Revisa tu membresia MBQB activa.</h1>
        <p>
          Ingresa un RUT para confirmar si aparece como membresia activa en MBQB. El resultado
          publico no muestra nombres ni detalles internos.
        </p>
      </div>
      <BogeyficadorForm />
    </section>
  )
}
