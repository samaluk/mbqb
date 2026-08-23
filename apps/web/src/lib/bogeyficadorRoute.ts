import type { BogeyficadorResult } from './bogeyficador'
import type { RateLimiter } from './rateLimit'

export type CheckMembership = (rut: string) => Promise<BogeyficadorResult>

export type BogeyficadorCheckDependencies = {
  checkMembership: CheckMembership
  clientKey: string
  rateLimiter?: RateLimiter
}

const json = (body: Record<string, string>, status: number) =>
  Response.json(body, {
    status,
  })

async function readRutFromRequest(request: Request): Promise<string> {
  let raw: unknown

  try {
    raw = await request.json()
  } catch {
    return ''
  }

  if (typeof raw !== 'object' || raw === null || !('rut' in raw)) {
    return ''
  }

  const { rut } = raw

  return typeof rut === 'string' ? rut : ''
}

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

  const rut = await readRutFromRequest(request)
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
