import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function PageLede({ className, ...props }: ComponentProps<'p'>) {
  return <p className={cn('page-lede', className)} {...props} />
}

export { PageLede }
