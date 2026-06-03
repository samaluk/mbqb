import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

function EditorialBody({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div
      className={cn(
        'grid max-w-[760px] gap-3 text-[17px] leading-[1.48] [&_p]:max-w-none max-[760px]:text-[15px] max-[760px]:leading-[1.42]',
        className,
      )}
      {...props}
    />
  )
}

export { EditorialBody }
