'use server'

import { revalidatePath } from 'next/cache'

import {
  clearCanchasUserGeoCookie,
  setCanchasUserGeoCookie,
} from '@/lib/canchasGeoCookie'
import { parseStoredUserGeo, type StoredUserGeo } from '@/lib/canchasUserGeo'

export async function setCanchasUserGeo(geo: StoredUserGeo) {
  const parsed = parseStoredUserGeo(geo)

  if (!parsed) {
    throw new Error('Invalid user geo')
  }

  await setCanchasUserGeoCookie(parsed)
  revalidatePath('/canchas')
}

export async function clearCanchasUserGeo() {
  await clearCanchasUserGeoCookie()
  revalidatePath('/canchas')
}
