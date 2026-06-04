import { createHash } from 'crypto'

import { normalizeRut } from '@/lib/rut'

type ActiveMembershipPrivacyFields = {
  normalizedRut: string
  rutLookupHash: string
}

type ActiveMembershipLookup =
  | {
      ok: true
      lookupHash: string
    }
  | {
      ok: false
    }

export function getActiveMembershipPrivacyFields(
  rutInput: string,
  hashSecret: string,
): ActiveMembershipPrivacyFields | null {
  const normalizedRut = normalizeRut(rutInput)

  if (!normalizedRut) return null

  return {
    normalizedRut,
    rutLookupHash: createRutLookupHash(normalizedRut, hashSecret),
  }
}

export function getActiveMembershipLookup(
  rutInput: string,
  hashSecret: string,
): ActiveMembershipLookup {
  const fields = getActiveMembershipPrivacyFields(rutInput, hashSecret)

  if (!fields) return { ok: false }

  return {
    lookupHash: fields.rutLookupHash,
    ok: true,
  }
}

function createRutLookupHash(normalizedRut: string, secret: string) {
  return createHash('sha256').update(`${secret}:${normalizedRut}`).digest('hex')
}
