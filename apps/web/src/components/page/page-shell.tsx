import type { ComponentProps } from 'react'

import { cn } from '@/lib/utils'

type PageShellProps = ComponentProps<'section'> & {
  variant?: 'default' | 'hero'
}

function PageShell({
  className,
  variant = 'default',
  ...props
}: PageShellProps) {
  return (
    <section
      className={cn(
        variant === 'default' &&
          'mx-auto w-[min(1120px,calc(100%-48px))] py-11 pb-20 max-[760px]:w-[min(calc(100%-24px),1120px)] max-[760px]:py-[22px] max-[760px]:pb-11',
        variant === 'hero' &&
          'group/hero relative grid w-full min-h-[calc(100vh-86px)] content-center overflow-hidden py-12 pb-[72px] px-[max(24px,calc((100vw-1120px)/2))] has-[data-slot=hero-video]:min-h-[calc(100svh-86px)] has-[data-slot=hero-video]:isolate has-[data-slot=hero-video]:text-white-soft has-[data-slot=hero-video]:after:pointer-events-none has-[data-slot=hero-video]:after:absolute has-[data-slot=hero-video]:after:inset-0 has-[data-slot=hero-video]:after:-z-10 has-[data-slot=hero-video]:after:content-[""] has-[data-slot=hero-video]:after:bg-[linear-gradient(90deg,rgb(16_20_17/72%)_0%,rgb(16_20_17/46%)_45%,rgb(16_20_17/18%)_100%),linear-gradient(0deg,rgb(16_20_17/34%)_0%,rgb(16_20_17/0%)_42%)] max-[760px]:min-h-[calc(100vh-67px)] max-[760px]:px-3 max-[760px]:py-6 max-[760px]:pb-10 max-[760px]:has-[data-slot=hero-video]:min-h-[calc(100svh-67px)] max-[760px]:has-[data-slot=hero-video]:after:bg-[linear-gradient(0deg,rgb(16_20_17/72%)_0%,rgb(16_20_17/50%)_54%,rgb(16_20_17/26%)_100%),linear-gradient(90deg,rgb(16_20_17/48%)_0%,rgb(16_20_17/20%)_100%)]',
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
  return (
    <article
      className={cn(
        'mx-auto w-[min(1120px,calc(100%-48px))] py-11 pb-20 max-[760px]:w-[min(calc(100%-24px),1120px)] max-[760px]:py-[22px] max-[760px]:pb-11',
        'grid gap-3 max-[760px]:gap-[9px]',
        className,
      )}
      {...props}
    />
  )
}

function HomeHeroContent({ className, ...props }: ComponentProps<'div'>) {
  return (
    <div className={cn('max-w-[760px] max-[760px]:self-end', className)} {...props} />
  )
}

export { PageShell, PageDetail, HomeHeroContent }
