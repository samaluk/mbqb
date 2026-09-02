import { describe, expect, it } from 'vitest'

import { handleVerifyCheck } from '@/lib/verifyRoute'

describe('Verify check route handler', () => {
  it('returns a generic active response for active memberships', async () => {
    const response = await handleVerifyCheck(
      new Request('http://localhost/api/verify', {
        body: JSON.stringify({ identifier: 'MEMBER-123' }),
        method: 'POST',
      }),
      {
        checkMembership: async () => ({ status: 'active' }),
        clientKey: '127.0.0.1',
      },
    )

    await expect(response.json()).resolves.toEqual({
      message: 'Active membership verified.',
      status: 'active',
    })
    expect(response.status).toBe(200)
  })

  it('returns invalid identifier without treating bad input as a membership miss', async () => {
    const response = await handleVerifyCheck(
      new Request('http://localhost/api/verify', {
        body: JSON.stringify({ identifier: '   ' }),
        method: 'POST',
      }),
      {
        checkMembership: async () => ({ status: 'invalid_identifier' }),
        clientKey: '127.0.0.1',
      },
    )

    await expect(response.json()).resolves.toEqual({
      message: 'Please provide a valid member identifier.',
      status: 'invalid_identifier',
    })
    expect(response.status).toBe(400)
  })

  it('returns a generic not-found response for inactive or missing memberships', async () => {
    const response = await handleVerifyCheck(
      new Request('http://localhost/api/verify', {
        body: JSON.stringify({ identifier: 'UNKNOWN-ID' }),
        method: 'POST',
      }),
      {
        checkMembership: async () => ({ status: 'not_found' }),
        clientKey: '127.0.0.1',
      },
    )

    await expect(response.json()).resolves.toEqual({
      message: 'No active membership found for this identifier.',
      status: 'not_found',
    })
    expect(response.status).toBe(404)
  })

  it('rate-limits excessive public verification checks', async () => {
    const response = await handleVerifyCheck(
      new Request('http://localhost/api/verify', {
        body: JSON.stringify({ identifier: 'MEMBER-123' }),
        method: 'POST',
      }),
      {
        checkMembership: async () => ({ status: 'active' }),
        clientKey: '127.0.0.1',
        rateLimiter: {
          consume: () => false,
        },
      },
    )

    await expect(response.json()).resolves.toEqual({
      message: 'Too many attempts. Please try again in a few minutes.',
      status: 'rate_limited',
    })
    expect(response.status).toBe(429)
  })
})
