import 'server-only'

import { cookies } from 'next/headers'

import { env } from '@/env'

import { parseStoredUserGeo, type StoredUserGeo } from '@/lib/canchasUserGeo'

export const canchasUserGeoCookieName = 'mbqb.canchas.userGeo'

const cookiePath = '/canchas'
const maxAgeSeconds = 8 * 60 * 60

const cookieOptions = {
  httpOnly: true,
  path: cookiePath,
  sameSite: 'lax' as const,
  secure: env.NODE_ENV === 'production',
}

export async function readCanchasUserGeoCookie(): Promise<StoredUserGeo | null> {
  const cookieStore = await cookies()
  const raw = cookieStore.get(canchasUserGeoCookieName)?.value

  if (!raw) return null

  try {
    return parseStoredUserGeo(JSON.parse(raw))
  } catch {
    return null
  }
}

export async function setCanchasUserGeoCookie(geo: StoredUserGeo) {
  const parsed = parseStoredUserGeo(geo)

  if (!parsed) {
    throw new Error('Invalid user geo')
  }

  const cookieStore = await cookies()
  cookieStore.set(canchasUserGeoCookieName, JSON.stringify(parsed), {
    ...cookieOptions,
    maxAge: maxAgeSeconds,
  })
}

export async function clearCanchasUserGeoCookie() {
  const cookieStore = await cookies()
  cookieStore.delete({
    name: canchasUserGeoCookieName,
    path: cookiePath,
  })
}
