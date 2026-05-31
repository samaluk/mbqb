import Link from 'next/link'
import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Mas Bogeys Que Birdies, comunidad chilena para hacer el golf mas accesible.',
  title: 'MBQB',
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es-CL">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            MBQB
          </Link>
          <nav aria-label="Principal">
            <Link href="/canchas">Canchas</Link>
            <Link href="/la-biblia">La Biblia</Link>
            <Link href="/bogeyficador">Bogeyficador</Link>
            <Link href="/productos">Productos</Link>
            <Link href="/sobre-nosotros">Sobre nosotros</Link>
          </nav>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
