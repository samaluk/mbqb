import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <section className="page-shell page-shell--hero">
      <div className="page-kicker">Neo Golf Club</div>
      <h1 className="page-title page-title--hero">Mas Bogeys Que Birdies</h1>
      <p className="page-lede">
        Comunidad chilena para jugar mas golf, encontrar canchas accesibles y aprender sin vueltas.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild className="min-h-10 px-4 font-bold">
          <Link href="/bogeyficador">Bogeyficador</Link>
        </Button>
        <Button asChild className="min-h-10 px-4 font-bold" variant="outline">
          <Link href="/canchas">Ver canchas</Link>
        </Button>
      </div>
    </section>
  )
}
