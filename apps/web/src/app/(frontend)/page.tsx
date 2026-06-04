import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

import {
  HomeHeroContent,
  HomeHeroVideo,
  PageKicker,
  PageLede,
  PageShell,
  PageTitle,
} from '@/components/page'
import { Button } from '@/components/ui/button'
import { getCmsQueryOptions } from '@/lib/cmsQuery'
import type { HomePage as HomePageGlobal, Media } from '@/payload-types'

export const revalidate = 900

function getMediaUrl(media: number | Media | null | undefined) {
  if (!media || typeof media === 'number') {
    return undefined
  }

  return media.url ?? undefined
}

async function getHomePageContent(): Promise<HomePageGlobal | null> {
  try {
    const payload = await getPayload({ config })
    const cmsQuery = await getCmsQueryOptions()

    return await payload.findGlobal({
      slug: 'home-page',
      depth: 1,
      ...cmsQuery,
    })
  } catch (error) {
    if (!isMissingRelationError(error)) {
      console.error('Failed to load home page content', error)
    }

    return null
  }
}

function isMissingRelationError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybeError = error as { cause?: { code?: unknown }; code?: unknown }

  return maybeError.code === '42P01' || maybeError.cause?.code === '42P01'
}

export default async function HomePage() {
  const homePage = await getHomePageContent()
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
          <Button asChild className="min-h-10 px-4 font-bold">
            <Link href="/bogeyficador">Bogeyficador</Link>
          </Button>
          <Button asChild className="min-h-10 px-4 font-bold" variant="outline">
            <Link href="/canchas">Ver canchas</Link>
          </Button>
        </div>
      </HomeHeroContent>
    </PageShell>
  )
}
