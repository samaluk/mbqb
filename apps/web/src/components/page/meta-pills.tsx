import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type MetaPillsProps = Omit<ComponentProps<'div'>, 'children'> & {
  items: string[]
}

function MetaPills({ className, items, ...props }: MetaPillsProps) {
  return (
    <div
      className={cn(
        'flex flex-wrap gap-1.5 text-xs font-[850] leading-[1.15] uppercase text-green max-[760px]:gap-[5px] max-[760px]:text-[11px]',
        className,
      )}
      {...props}
    >
      {items.map((item, index) => (
        <span
          className="rounded-full border border-green/20 px-2 py-0.5 max-[760px]:px-[7px] max-[760px]:py-0.5"
          key={`${item}-${index}`}
        >
          {item}
        </span>
      ))}
    </div>
  )
}

export { MetaPills }
