export function isPayloadUnavailableError(error: unknown) {
  if (!error || typeof error !== 'object') {
    return false
  }

  const maybeError = error as {
    cause?: { code?: unknown }
    code?: unknown
    payloadInitError?: unknown
  }

  return (
    maybeError.payloadInitError === true ||
    maybeError.code === '42P01' ||
    maybeError.code === 'ECONNREFUSED' ||
    maybeError.cause?.code === '42P01' ||
    maybeError.cause?.code === 'ECONNREFUSED'
  )
}
