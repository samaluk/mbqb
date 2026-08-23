import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

export type PageKickerProps = ComponentProps<'div'> & {
  tone?: 'default' | 'hero'
}

function PageKicker({ className, tone = 'default', ...props }: PageKickerProps) {
  return (
    <div
      className={cn('page-kicker', tone === 'hero' && 'page-kicker-hero', className)}
      {...props}
    />
  )
}

export { PageKicker }
