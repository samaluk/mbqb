import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type HomeHeroVideoProps = ComponentProps<'video'> & {
  src: string
}

function HomeHeroVideo({ className, src, ...props }: HomeHeroVideoProps) {
  return (
    <div
      aria-hidden
      className="absolute inset-0 -z-[2] size-full overflow-hidden bg-ink"
      data-slot="hero-video"
    >
      <video
        autoPlay
        className={cn('block size-full object-cover', className)}
        loop
        muted
        playsInline
        preload="metadata"
        src={src}
        {...props}
      />
    </div>
  )
}

export { HomeHeroVideo }
