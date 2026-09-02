import { createHmac } from 'node:crypto'

import { validateRut } from '@/lib/rut'

export type MembershipPrivacyFields = {
  lookupHash: string
  normalizedIdentifier: string
}

export type MembershipLookup =
  | {
      lookupHash: string
      ok: true
    }
  | {
      ok: false
    }

export function normalizeIdentifier(input: string): string | null {
  const trimmed = input.trim()
  if (!trimmed) return null

  const rutResult = validateRut(trimmed)
  if (rutResult.ok) {
    return `${rutResult.rut.body}${rutResult.rut.checkDigit}`.toLowerCase()
  }

  return trimmed.toLowerCase()
}

export function createLookupHash(normalizedIdentifier: string, secret: string): string {
  return createHmac('sha256', secret).update(normalizedIdentifier).digest('hex')
}

export function getMembershipPrivacyFields(
  identifierInput: string,
  hashSecret: string,
): MembershipPrivacyFields | null {
  const normalizedIdentifier = normalizeIdentifier(identifierInput)

  if (!normalizedIdentifier) return null

  return {
    lookupHash: createLookupHash(normalizedIdentifier, hashSecret),
    normalizedIdentifier,
  }
}

export function getMembershipLookup(identifierInput: string, hashSecret: string): MembershipLookup {
  const fields = getMembershipPrivacyFields(identifierInput, hashSecret)

  if (!fields) return { ok: false }

  return {
    lookupHash: fields.lookupHash,
    ok: true,
  }
}
