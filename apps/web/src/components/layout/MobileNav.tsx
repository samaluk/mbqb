import Link from 'next/link'

type NavItem = {
  href: string
  label: string
}

export function MobileNav({ items }: { items: NavItem[] }) {
  return (
    <details className="hidden max-[760px]:block [&_summary::-webkit-details-marker]:hidden open:before:fixed open:before:inset-0 open:before:z-10 open:before:bg-ink/28 open:[&_summary_span:nth-child(1)]:translate-y-[7px] open:[&_summary_span:nth-child(1)]:rotate-45 open:[&_summary_span:nth-child(2)]:opacity-0 open:[&_summary_span:nth-child(3)]:-translate-y-[7px] open:[&_summary_span:nth-child(3)]:-rotate-45">
      <summary
        className="grid size-9 cursor-pointer list-none place-items-center rounded-md border border-line bg-white-soft open:fixed open:right-3 open:top-2 open:z-30"
        aria-label="Abrir navegacion"
      >
        <span className="block h-0.5 w-[18px] rounded-full bg-ink transition-[opacity,transform] duration-100" />
        <span className="block h-0.5 w-[18px] rounded-full bg-ink transition-[opacity,transform] duration-100" />
        <span className="block h-0.5 w-[18px] rounded-full bg-ink transition-[opacity,transform] duration-100" />
      </summary>
      <div className="fixed right-0 top-0 z-20 grid h-dvh w-[min(82vw,300px)] content-start gap-3 border-l border-line bg-white-soft px-4 pb-4 pt-12 shadow-[-16px_0_48px_rgb(16_20_17_/_18%)]">
        <div className="text-[13px] font-[850] uppercase text-green">Navegacion</div>
        <nav className="grid gap-1" aria-label="Principal movil">
          {items.map((item) => (
            <Link
              className="border-b border-line py-3 text-base font-extrabold no-underline"
              href={item.href}
              key={item.href}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </details>
  )
}
