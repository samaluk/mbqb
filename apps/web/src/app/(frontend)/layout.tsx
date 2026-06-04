import Link from 'next/link'
import React from 'react'

import { RefreshRouteOnSave } from '@/components/cms/RefreshRouteOnSave'
import { MobileNav } from '@/components/layout/MobileNav'
import { Toaster } from '@/components/ui/sonner'

import './styles.css'

export const metadata = {
  description: 'Mas Bogeys Que Birdies, comunidad chilena para hacer el golf mas accesible.',
  title: 'MBQB',
}

const navItems = [
  { href: '/canchas', label: 'Canchas' },
  { href: '/la-biblia', label: 'La Biblia' },
  { href: '/bogeyficador', label: 'Bogeyficador' },
  { href: '/el-canal', label: 'El Canal' },
  { href: '/convenios', label: 'Convenios' },
  { href: '/productos', label: 'Productos' },
  { href: '/sobre-nosotros', label: 'Sobre nosotros' },
]

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <html lang="es-CL">
      <body>
        <RefreshRouteOnSave />
        <header className="site-header">
          <Link className="font-extrabold no-underline max-[760px]:text-lg" href="/">
            MBQB
          </Link>
          <nav
            className="flex flex-wrap justify-end gap-4 text-sm text-muted max-[760px]:hidden"
            aria-label="Principal"
          >
            {navItems.map((item) => (
              <Link className="no-underline" href={item.href} key={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <MobileNav items={navItems} />
        </header>
        <main>{children}</main>
        <Toaster />
      </body>
    </html>
  )
}
