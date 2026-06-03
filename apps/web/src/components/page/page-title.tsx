import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type PageTitleProps = ComponentProps<'h1'> & {
  size?: 'default' | 'hero'
}

function PageTitle({ className, size = 'default', ...props }: PageTitleProps) {
  return (
    <h1
      className={cn(
        'max-w-[820px] leading-[0.98] max-[760px]:max-w-full',
        size === 'default' &&
          'my-2 mb-2.5 text-[clamp(36px,5vw,62px)] max-[760px]:my-1.5 max-[760px]:mb-2 max-[760px]:text-[clamp(28px,9vw,40px)]',
        size === 'hero' &&
          'text-[clamp(44px,7vw,82px)] max-[760px]:text-[clamp(34px,11vw,46px)]',
        'group-has-[data-slot=hero-video]/hero:text-white-soft group-has-[data-slot=hero-video]/hero:[text-shadow:0_2px_20px_rgb(16_20_17/42%)]',
        className,
      )}
      {...props}
    />
  )
}

export { PageTitle }
