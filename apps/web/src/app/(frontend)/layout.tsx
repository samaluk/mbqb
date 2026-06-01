import Link from 'next/link'
import React from 'react'
import './styles.css'

export const metadata = {
  description: 'Mas Bogeys Que Birdies, comunidad chilena para hacer el golf mas accesible.',
  title: 'MBQB',
}

const navItems = [
  { href: '/canchas', label: 'Canchas' },
  { href: '/la-biblia', label: 'La Biblia' },
  { href: '/bogeyficador', label: 'Bogeyficador' },
  { href: '/productos', label: 'Productos' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
]

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es-CL">
      <body>
        <header className="site-header">
          <Link className="brand" href="/">
            MBQB
          </Link>
          <nav className="desktop-nav" aria-label="Principal">
            {navItems.map((item) => (
              <Link href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <details className="mobile-menu">
            <summary aria-label="Abrir navegacion">
              <span></span>
              <span></span>
              <span></span>
            </summary>
            <div className="mobile-menu-panel">
              <div className="mobile-menu-heading">Navegacion</div>
              <nav aria-label="Principal movil">
                {navItems.map((item) => (
                  <Link href={item.href} key={item.href}>
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </details>
        </header>
        <main>{children}</main>
      </body>
    </html>
  )
}
