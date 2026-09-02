import 'server-only'

import { cookies } from 'next/headers'

import { env } from '@/env'

import { parseStoredUserGeo, type StoredUserGeo } from '@/lib/placesUserGeo'

const placesUserGeoCookieName = 'community.places.userGeo'

const cookiePath = '/places'
const maxAgeSeconds = 8 * 60 * 60

const cookieOptions = {
  httpOnly: true,
  path: cookiePath,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
}

export async function readPlacesUserGeoCookie(): Promise<StoredUserGeo | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(placesUserGeoCookieName)?.value

  if (!raw) return null

  try {
    return parseStoredUserGeo(JSON.parse(raw))
  } catch {
    return null
  }
}

export async function setPlacesUserGeoCookie(geo: StoredUserGeo) {
  const parsed = parseStoredUserGeo(geo)

  if (!parsed) {
    throw new Error('Invalid user geo')
  }

  const cookieStore = await cookies()
  cookieStore.set(placesUserGeoCookieName, JSON.stringify(parsed), {
    ...cookieOptions,
    maxAge: maxAgeSeconds,
  })
}

export async function clearPlacesUserGeoCookie() {
  const cookieStore = await cookies()
  cookieStore.delete({
    name: placesUserGeoCookieName,
    path: cookiePath,
  })
}
