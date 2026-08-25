type MaybePayloadError = {
  cause?: { code?: unknown }
  code?: unknown
  payloadInitError?: unknown
}

const unavailableCodes = new Set(['42P01', 'ECONNREFUSED'])

function asMaybePayloadError(error: unknown): MaybePayloadError | null {
  if (!error || typeof error !== 'object') return null

  // oxlint-disable-next-line typescript/consistent-type-assertions
  return error
}

function hasUnavailableCode(code: unknown) {
  return typeof code === 'string' && unavailableCodes.has(code)
}

export function isPayloadUnavailableError(error: unknown) {
  const maybe = asMaybePayloadError(error)

  if (!maybe) return false

  return (
    maybe.payloadInitError === true ||
    [maybe.code, maybe.cause?.code].some((code) => hasUnavailableCode(code))
  )
}
