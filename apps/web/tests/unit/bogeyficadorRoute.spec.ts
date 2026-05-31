import { describe, expect, it } from 'vitest'

import { handleBogeyficadorCheck } from '@/lib/bogeyficadorRoute'

describe('Bogeyficador check route handler', () => {
  it('returns a generic active response for active memberships', async () => {
    const response = await handleBogeyficadorCheck(
      new Request('http://localhost/api/bogeyficador/check', {
        body: JSON.stringify({ rut: '12.345.678-5' }),
        method: 'POST',
      }),
      {
        checkMembership: async () => ({ status: 'active' }),
        clientKey: '127.0.0.1',
      },
    )

    await expect(response.json()).resolves.toEqual({
      message: 'Membresia MBQB activa.',
      status: 'active',
    })
    expect(response.status).toBe(200)
  })

  it('returns invalid RUT without treating bad input as a membership miss', async () => {
    const response = await handleBogeyficadorCheck(
      new Request('http://localhost/api/bogeyficador/check', {
        body: JSON.stringify({ rut: '12.345.678-9' }),
        method: 'POST',
      }),
      {
        checkMembership: async () => ({ status: 'invalid_rut' }),
        clientKey: '127.0.0.1',
      },
    )

    await expect(response.json()).resolves.toEqual({
      message: 'Revisa el RUT ingresado.',
      status: 'invalid_rut',
    })
    expect(response.status).toBe(400)
  })

  it('returns a generic not-found response for inactive or missing memberships', async () => {
    const response = await handleBogeyficadorCheck(
      new Request('http://localhost/api/bogeyficador/check', {
        body: JSON.stringify({ rut: '12.345.678-5' }),
        method: 'POST',
      }),
      {
        checkMembership: async () => ({ status: 'not_found' }),
        clientKey: '127.0.0.1',
      },
    )

    await expect(response.json()).resolves.toEqual({
      message: 'No encontramos una membresia MBQB activa para este RUT.',
      status: 'not_found',
    })
    expect(response.status).toBe(404)
  })

  it('rate-limits excessive public checks', async () => {
    const response = await handleBogeyficadorCheck(
      new Request('http://localhost/api/bogeyficador/check', {
        body: JSON.stringify({ rut: '12.345.678-5' }),
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
      message: 'Demasiados intentos. Prueba de nuevo en unos minutos.',
      status: 'rate_limited',
    })
    expect(response.status).toBe(429)
  })
})
