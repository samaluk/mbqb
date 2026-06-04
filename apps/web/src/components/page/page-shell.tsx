import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type PageShellProps = ComponentProps<'section'> & {
  variant?: 'default' | 'hero'
}

function PageShell({ className, variant = 'default', ...props }: PageShellProps) {
  return (
    <section
      className={cn(
        variant === 'default' && 'page-shell-default',
        variant === 'hero' && 'group/hero page-shell-hero',
        className,
      )}
      {...props}
    />
  )
}

function PageDetail({
  className,
  ...props
}: ComponentProps<'article'> & { layout?: 'default' | 'detail' }) {
  return <article className={cn('page-detail-shell', className)} {...props} />
}

function HomeHeroContent({ className, ...props }: ComponentProps<'div'>) {
  return <div className={cn('max-w-190 max-[760px]:self-end', className)} {...props} />
}

export { PageShell, PageDetail, HomeHeroContent }
