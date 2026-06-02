import Link from 'next/link'
import config from '@payload-config'
import { getPayload } from 'payload'

import { Button } from '@/components/ui/button'
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

    return await payload.findGlobal({
      slug: 'home-page',
      depth: 1,
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
    <section className="page-shell page-shell--hero">
      {heroVideoUrl ? (
        <div className="homepage-video">
          <video
            aria-label={homePage?.heroVideoAlt ?? 'Video destacado de Mas Bogeys Que Birdies'}
            autoPlay
            className="homepage-video__media"
            loop
            muted
            playsInline
            preload="metadata"
            src={heroVideoUrl}
          />
        </div>
      ) : null}
      <div className="page-kicker">Neo Golf Club</div>
      <h1 className="page-title page-title--hero">Mas Bogeys Que Birdies</h1>
      <p className="page-lede">
        Comunidad chilena para jugar mas golf, encontrar canchas accesibles y aprender sin vueltas.
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Button asChild className="min-h-10 px-4 font-bold">
          <Link href="/bogeyficador">Bogeyficador</Link>
        </Button>
        <Button asChild className="min-h-10 px-4 font-bold" variant="outline">
          <Link href="/canchas">Ver canchas</Link>
        </Button>
      </div>
    </section>
  )
}
