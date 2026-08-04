import Link from 'next/link'
import config from '@payload-config'
import { cacheLife } from 'next/cache'
import { draftMode } from 'next/headers'
import { Suspense } from 'react'
import { getPayload } from 'payload'

import {
  HomeHeroContent,
  HomeHeroVideo,
  PageKicker,
  PageLede,
  PageShell,
  PageTitle,
} from '@/components/page'
import { buttonVariants } from '@/components/ui/button'
import { getCmsQueryOptions } from '@/lib/cmsQuery'
import { cn } from '@/lib/utils'
import { isPayloadUnavailableError } from '@/lib/payloadUnavailableError'
import type { HomePage as HomePageGlobal, Media } from '@/payload-types'

function getMediaUrl(media: number | Media | null | undefined) {
  if (!media || typeof media === 'number') {
    return undefined
  }

  return media.url ?? undefined
}

async function getPublishedHomePageContent(): Promise<HomePageGlobal | null> {
  'use cache'
  cacheLife('publicContent')

  try {
    const payload = await getPayload({ config })

    return await payload.findGlobal({
      slug: 'home-page',
      depth: 1,
      draft: false,
      overrideAccess: false,
    })
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error('Failed to load home page content', error)
    }

    return null
  }
}

async function getDraftHomePageContent(): Promise<HomePageGlobal | null> {
  try {
    const payload = await getPayload({ config })
    const cmsQuery = await getCmsQueryOptions()

    return await payload.findGlobal({
      slug: 'home-page',
      depth: 1,
      ...cmsQuery,
    })
  } catch (error) {
    if (!isPayloadUnavailableError(error)) {
      console.error('Failed to load home page content', error)
    }

    return null
  }
}

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <HomePageContent />
    </Suspense>
  )
}

async function HomePageContent() {
  const { isEnabled: draft } = await draftMode()
  const homePage = draft ? await getDraftHomePageContent() : await getPublishedHomePageContent()

  return <HomePageView homePage={homePage} />
}

function HomePageView({ homePage }: { homePage: HomePageGlobal | null }) {
  const heroVideoUrl = getMediaUrl(homePage?.heroVideo)

  return (
    <PageShell variant="hero">
      {heroVideoUrl ? <HomeHeroVideo src={heroVideoUrl} /> : null}
      <HomeHeroContent>
        <PageKicker tone="hero">Neo Golf Club</PageKicker>
        <PageTitle size="hero">Mas Bogeys Que Birdies</PageTitle>
        <PageLede>
          Comunidad chilena para jugar mas golf, encontrar canchas accesibles y aprender sin
          vueltas.
        </PageLede>
        <div className="mt-5 flex flex-wrap gap-2">
          <Link className={cn(buttonVariants(), 'min-h-10 px-4 font-bold')} href="/bogeyficador">
            Bogeyficador
          </Link>
          <Link
            className={cn(buttonVariants({ variant: 'outline' }), 'min-h-10 px-4 font-bold')}
            href="/canchas"
          >
            Ver canchas
          </Link>
        </div>
      </HomeHeroContent>
    </PageShell>
  )
}
