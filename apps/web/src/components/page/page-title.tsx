import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type PageTitleProps = ComponentProps<'h1'> & {
  size?: 'default' | 'hero'
}

function PageTitle({ className, size = 'default', children, ...props }: PageTitleProps) {
  return (
    <h1
      className={cn(
        'page-title-base',
        size === 'default' && 'page-title-default',
        size === 'hero' && 'page-title-hero',
        'page-title-hero-video',
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  )
}

export { PageTitle }
