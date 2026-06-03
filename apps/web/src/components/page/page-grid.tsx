import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function PageGrid({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'mt-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,260px),1fr))] gap-3 max-[760px]:mt-4 max-[760px]:grid-cols-1 max-[760px]:gap-2',
        className,
      )}
      {...props}
    />
  )
}

export { PageGrid }
