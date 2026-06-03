import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function PageLede({ className, ...props }: ComponentProps<'p'>) {
  return (
    <p
      className={cn(
        'm-0 max-w-[680px] text-lg leading-[1.42] text-muted max-[760px]:text-[15px] max-[760px]:leading-[1.38]',
        'group-has-[data-slot=hero-video]/hero:max-w-[620px] group-has-[data-slot=hero-video]/hero:text-white-soft/88 group-has-[data-slot=hero-video]/hero:[text-shadow:0_2px_20px_rgb(16_20_17/42%)]',
        className,
      )}
      {...props}
    />
  )
}

export { PageLede }
