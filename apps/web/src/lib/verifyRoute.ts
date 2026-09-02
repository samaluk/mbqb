import type { VerificationResult } from './memberships'
import type { RateLimiter } from './rateLimit'

export type CheckMembershipFunction = (identifier: string) => Promise<VerificationResult>

export type VerifyCheckDependencies = {
  checkMembership: CheckMembershipFunction
  clientKey: string
  rateLimiter?: RateLimiter
}

const json = (body: Record<string, string>, status: number) =>
  Response.json(body, {
    status,
  })

async function readIdentifierFromRequest(request: Request): Promise<string> {
  let raw: unknown

  try {
    raw = await request.json()
  } catch {
    return ''
  }

  if (typeof raw !== 'object' || raw === null) {
    return ''
  }

  if ('identifier' in raw && typeof raw.identifier === 'string') {
    return raw.identifier
  }

  return ''
}

export const handleVerifyCheck = async (
  request: Request,
  { checkMembership, clientKey, rateLimiter }: VerifyCheckDependencies,
) => {
  if (rateLimiter && !rateLimiter.consume(clientKey)) {
    return json(
      {
        message: 'Too many attempts. Please try again in a few minutes.',
        status: 'rate_limited',
      },
      429,
    )
  }

  const identifier = await readIdentifierFromRequest(request)
  const result = await checkMembership(identifier)

  if (result.status === 'invalid_identifier') {
    return json(
      {
        message: 'Please provide a valid member identifier.',
        status: 'invalid_identifier',
      },
      400,
    )
  }

  if (result.status === 'not_found') {
    return json(
      {
        message: 'No active membership found for this identifier.',
        status: 'not_found',
      },
      404,
    )
  }

  return json(
    {
      message: 'Active membership verified.',
      status: 'active',
    },
    200,
  )
}
