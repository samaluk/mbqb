import configPromise from '@payload-config'
import { headers } from 'next/headers'
import { getPayload } from 'payload'

import { env } from '@/env'
import { checkMembership, findMembershipByLookupHash } from '@/lib/memberships'
import { handleVerifyCheck } from '@/lib/verifyRoute'
import { createFixedWindowRateLimiter } from '@/lib/rateLimit'

const verifyRateLimiter = createFixedWindowRateLimiter({
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

  return handleVerifyCheck(request, {
    checkMembership: (identifier) =>
      checkMembership(identifier, {
        findByLookupHash: (lookupHash) => findMembershipByLookupHash(payload, lookupHash),
        hashSecret: env.PAYLOAD_SECRET,
      }),
    clientKey: await getClientKey(),
    rateLimiter: verifyRateLimiter,
  })
}
