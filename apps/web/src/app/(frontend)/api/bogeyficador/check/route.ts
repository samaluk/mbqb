import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import {
  checkActiveMembership,
  findActiveMembershipByLookupHash,
} from '@/lib/bogeyficador'
import { handleBogeyficadorCheck } from '@/lib/bogeyficadorRoute'
import { createFixedWindowRateLimiter } from '@/lib/rateLimit'

const bogeyficadorRateLimiter = createFixedWindowRateLimiter({
  limit: 10,
  windowMs: 60_000,
})

const getClientKey = async () => {
  const headerList = await headers()
  const forwardedFor = headerList.get('x-forwarded-for')?.split(',')[0]?.trim()

  return forwardedFor || headerList.get('x-real-ip') || 'unknown'
}

export const POST = async (request: Request) => {
  const payloadConfig = await configPromise
  const payload = await getPayload({ config: payloadConfig })

  return handleBogeyficadorCheck(request, {
    checkMembership: (rut) =>
      checkActiveMembership(rut, {
        findByLookupHash: (lookupHash) => findActiveMembershipByLookupHash(payload, lookupHash),
        hashSecret: process.env.PAYLOAD_SECRET ?? 'development-secret',
      }),
    clientKey: await getClientKey(),
    rateLimiter: bogeyficadorRateLimiter,
  })
}
