export type RutValidationError = 'empty' | 'invalid_format' | 'invalid_check_digit'

export type NormalizedRut = {
  body: string
  checkDigit: string
  value: string
  formatted: string
}

export type RutValidationResult =
  | {
      ok: true
      rut: NormalizedRut
    }
  | {
      ok: false
      reason: RutValidationError
    }

export const cleanRut = (input: string) => input.replace(/[.\-\s]/g, '').toUpperCase()

// Module scope: constructing an Intl formatter loads locale data, so build
// the es-CL formatter once instead of per call.
const rutBodyFormatter = new Intl.NumberFormat('es-CL')

const formatCheckSuffix = (check: string) => (check ? `-${check}` : '')

const splitRut = (value: string) => {
  const cleaned = cleanRut(value)

  return {
    body: cleaned.slice(0, -1).replace(/\D/g, ''),
    check: cleaned.slice(-1).replace(/[^0-9K]/g, ''),
  }
}

export const formatRutInput = (value: string): string => {
  const { body, check } = splitRut(value)

  if (!body && !check) return ''

  return body ? `${rutBodyFormatter.format(Number(body))}${formatCheckSuffix(check)}` : check
}

export const isRutCandidate = (value: string): boolean => {
  const cleaned = value.replace(/[.\-\s]/g, '')
  if (!cleaned) return false
  if (/[^0-9Kk]/.test(cleaned)) return false
  if (cleaned.slice(0, -1).toLowerCase().includes('k')) return false
  if (cleaned.length > 9) return false
  return true
}

export const formatIdentifierInput = (value: string): string => {
  if (isRutCandidate(value)) {
    return formatRutInput(value)
  }

  const cleaned = value.replace(/[.\-\s]/g, '')
  if (/^\d{10,}$/.test(cleaned)) {
    return cleaned
  }

  return value
}

const calculateCheckDigit = (body: string) => {
  let multiplier = 2
  let sum = 0

  for (let index = body.length - 1; index >= 0; index -= 1) {
    sum += Number(body[index]) * multiplier
    multiplier = multiplier === 7 ? 2 : multiplier + 1
  }

  const remainder = 11 - (sum % 11)

  if (remainder === 11) return '0'
  if (remainder === 10) return 'K'

  return String(remainder)
}

export const formatRut = (body: string, checkDigit: string) =>
  `${rutBodyFormatter.format(Number(body))}-${checkDigit}`

export const validateRut = (input: string): RutValidationResult => {
  const cleaned = cleanRut(input)

  if (!cleaned) {
    return { ok: false, reason: 'empty' }
  }

  const body = cleaned.slice(0, -1)
  const checkDigit = cleaned.slice(-1)

  if (!/^\d{1,8}$/.test(body) || !/^[0-9K]$/.test(checkDigit)) {
    return { ok: false, reason: 'invalid_format' }
  }

  const expectedCheckDigit = calculateCheckDigit(body)

  if (checkDigit !== expectedCheckDigit) {
    return { ok: false, reason: 'invalid_check_digit' }
  }

  return {
    ok: true,
    rut: {
      body,
      checkDigit,
      value: `${body}-${checkDigit}`,
      formatted: formatRut(body, checkDigit),
    },
  }
}

export const normalizeRut = (input: string) => {
  const result = validateRut(input)

  if (!result.ok) return null

  return result.rut.value
}
