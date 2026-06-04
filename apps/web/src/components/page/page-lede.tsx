import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function PageLede({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('page-lede', 'page-lede-hero-video', className)} {...props} />
}

export { PageLede }
