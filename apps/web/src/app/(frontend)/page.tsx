import Link from 'next/link'

import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <section className="mx-auto grid min-h-[calc(100vh-86px)] w-[min(1120px,calc(100%_-_48px))] content-center py-16 pb-24 max-[760px]:min-h-[calc(100vh-67px)] max-[760px]:w-[min(calc(100%_-_24px),1120px)] max-[760px]:py-[34px] max-[760px]:pb-[52px]">
      <div className="text-sm font-extrabold uppercase text-green max-[760px]:text-xs">
        Neo Golf Club
      </div>
      <h1 className="my-3 mb-5 max-w-[780px] text-[clamp(44px,8vw,92px)] leading-[0.95] max-[760px]:my-2 max-[760px]:mb-3 max-[760px]:text-[clamp(34px,11vw,48px)] max-[760px]:leading-none">
        Mas Bogeys Que Birdies
      </h1>
      <p className="m-0 max-w-[640px] text-xl text-muted max-[760px]:text-base max-[760px]:leading-[1.45]">
        Comunidad chilena para jugar mas golf, encontrar canchas accesibles y aprender sin vueltas.
      </p>
      <div className="mt-8 flex flex-wrap gap-3 max-[760px]:mt-[22px] max-[760px]:gap-2">
        <Button asChild className="min-h-[46px] px-[18px] font-bold max-[760px]:min-h-[42px]">
          <Link href="/bogeyficador">Bogeyficador</Link>
        </Button>
        <Button
          asChild
          className="min-h-[46px] px-[18px] font-bold max-[760px]:min-h-[42px]"
          variant="outline"
        >
          <Link href="/canchas">Ver canchas</Link>
        </Button>
      </div>
    </section>
  )
}
