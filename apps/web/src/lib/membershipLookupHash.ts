import { createHash } from 'crypto'

export const createMembershipLookupHash = (normalizedRut: string, secret: string) =>
  createHash('sha256').update(`${secret}:${normalizedRut}`).digest('hex')
