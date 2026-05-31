import Link from 'next/link'

export default function HomePage() {
  return (
    <section className="home-shell">
      <div className="eyebrow">Neo Golf Club</div>
      <h1>Mas Bogeys Que Birdies</h1>
      <p>
        Comunidad chilena para jugar mas golf, encontrar canchas accesibles y aprender sin
        vueltas.
      </p>
      <div className="actions">
        <Link className="button primary" href="/bogeyficador">
          Bogeyficador
        </Link>
        <Link className="button secondary" href="/canchas">
          Ver canchas
        </Link>
      </div>
    </section>
  )
}
