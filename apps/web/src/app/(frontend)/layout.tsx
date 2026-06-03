import Link from 'next/link'
import React from 'react'

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
        <header className="mx-auto flex max-w-[1120px] items-center justify-between gap-5 px-6 py-4 max-[760px]:sticky max-[760px]:top-0 max-[760px]:z-[15] max-[760px]:gap-3 max-[760px]:border-b max-[760px]:border-line/70 max-[760px]:bg-paper/95 max-[760px]:px-3 max-[760px]:py-2 max-[760px]:backdrop-blur-[10px]">
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
