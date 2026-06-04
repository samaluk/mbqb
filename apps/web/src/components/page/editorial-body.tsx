import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function EditorialBody({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('editorial-body', className)} {...props} />
}

export { EditorialBody }
