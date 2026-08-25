import { env } from '@/env'
import config from '@payload-config'
import { draftMode } from 'next/headers'
import { redirect } from 'next/navigation'
import { getPayload } from 'payload'

type PreviewRequest = {
  collection: string
  path: string
  slug: string
}

const notAllowed = () => new Response('You are not allowed to preview this page', { status: 403 })

export async function GET(req: Request) {
  const payload = await getPayload({ config })
  const parsed = parsePreviewRequest(req)

  if ('error' in parsed) return parsed.error

  const authError = await enableDraftForAuthenticatedUser(req, payload)

  if (authError) return authError

  return redirect(parsed.request.path)
}

/** Outcome of preview param validation and secret check. */
type ParsedPreviewRequest = { error: Response } | { request: PreviewRequest }

/** Validates preview params and the shared secret; exactly one channel is set. */
function parsePreviewRequest(req: Request): ParsedPreviewRequest {
  const { searchParams } = new URL(req.url)
  const request = asPreviewRequest({
    path: searchParams.get('path'),
    collection: searchParams.get('collection'),
    slug: searchParams.get('slug'),
  })

  if (!request) return { error: new Response('Insufficient search params', { status: 404 }) }

  if (searchParams.get('previewSecret') !== env.PREVIEW_SECRET) return { error: notAllowed() }

  if (!request.path.startsWith('/')) {
    return {
      error: new Response('This endpoint can only be used for relative previews', { status: 500 }),
    }
  }

  return { request }
}

function asPreviewRequest(raw: {
  collection: string | null
  path: string | null
  slug: string | null
}): PreviewRequest | null {
  const { collection, path, slug } = raw

  if (!path || !collection || !slug) return null

  return { collection, path, slug }
}

async function enableDraftForAuthenticatedUser(
  req: Request,
  payload: Awaited<ReturnType<typeof getPayload>>,
): Promise<Response | null> {
  try {
    const user = await payload.auth({
      headers: req.headers,
    })

    const draft = await draftMode()

    if (!user) {
      draft.disable()
      return notAllowed()
    }

    draft.enable()
    return null
  } catch (error) {
    payload.logger.error({ err: error }, 'Error verifying token for live preview')
    return notAllowed()
  }
}
