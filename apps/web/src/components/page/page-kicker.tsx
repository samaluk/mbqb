import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type PageKickerProps = ComponentProps<'div'> & {
  tone?: 'default' | 'hero'
}

function PageKicker({ className, tone = 'default', ...props }: PageKickerProps) {
  return (
    <div
      className={cn(
        'text-[13px] font-[850] leading-none uppercase text-green max-[760px]:text-[11px]',
        tone === 'hero' && 'group-has-[data-slot=hero-video]/hero:text-lime',
        className,
      )}
      {...props}
    />
  )
}

export { PageKicker }
