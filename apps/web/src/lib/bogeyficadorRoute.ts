import type { BogeyficadorResult } from './bogeyficador'
import type { RateLimiter } from './rateLimit'

type CheckMembership = (rut: string) => Promise<BogeyficadorResult>

type BogeyficadorCheckDependencies = {
  checkMembership: CheckMembership
  clientKey: string
  rateLimiter?: RateLimiter
}

const json = (body: Record<string, string>, status: number) =>
  Response.json(body, {
    status,
  })

export const handleBogeyficadorCheck = async (
  request: Request,
  { checkMembership, clientKey, rateLimiter }: BogeyficadorCheckDependencies,
) => {
  if (rateLimiter && !rateLimiter.consume(clientKey)) {
    return json(
      {
        message: 'Demasiados intentos. Prueba de nuevo en unos minutos.',
        status: 'rate_limited',
      },
      429,
    )
  }

  const body = (await request.json().catch(() => null)) as { rut?: unknown } | null
  const rut = typeof body?.rut === 'string' ? body.rut : ''
  const result = await checkMembership(rut)

  if (result.status === 'invalid_rut') {
    return json(
      {
        message: 'Revisa el RUT ingresado.',
        status: 'invalid_rut',
      },
      400,
    )
  }

  if (result.status === 'not_found') {
    return json(
      {
        message: 'No encontramos una membresia MBQB activa para este RUT.',
        status: 'not_found',
      },
      404,
    )
  }

  return json(
    {
      message: 'Membresia MBQB activa.',
      status: 'active',
    },
    200,
  )
}
