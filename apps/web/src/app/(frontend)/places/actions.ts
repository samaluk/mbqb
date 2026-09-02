'use server'

import { revalidatePath } from 'next/cache'

import { clearPlacesUserGeoCookie, setPlacesUserGeoCookie } from '@/lib/placesGeoCookie'
import { parseStoredUserGeo, type StoredUserGeo } from '@/lib/placesUserGeo'

export async function setPlacesUserGeo(geo: StoredUserGeo) {
  const parsed = parseStoredUserGeo(geo)

  if (!parsed) {
    throw new Error('Invalid user geo')
  }

  await setPlacesUserGeoCookie(parsed)
  revalidatePath('/places')
}

export async function clearPlacesUserGeo() {
  await clearPlacesUserGeoCookie()
  revalidatePath('/places')
}
