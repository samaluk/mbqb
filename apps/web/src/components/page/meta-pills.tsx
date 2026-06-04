import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type MetaPillsProps = Omit<ComponentProps<'div'>, 'children'> & {
  items: string[]
}

function MetaPills({ className, items, ...props }: MetaPillsProps) {
  return (
    <div className={cn('meta-pills', className)} {...props}>
      {items.map((item, index) => (
        <span
          className="rounded-full border border-green/20 px-2 py-0.5 max-[760px]:px-1.75"
          key={`${item}-${index}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export { MetaPills }
