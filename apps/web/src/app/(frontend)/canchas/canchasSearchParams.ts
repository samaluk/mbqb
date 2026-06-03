export function getCanchasHref(
  searchParams: Record<string, string | string[] | undefined>,
  updates: Record<string, null | string>,
  options?: { view?: 'table' },
) {
  const params = new URLSearchParams()

  for (const [key, value] of Object.entries(searchParams)) {
    const paramValue = Array.isArray(value) ? value[0] : value
    if (paramValue) params.set(key, paramValue)
  }

  if (options?.view === 'table') {
    params.set('view', 'table')
  }

  for (const [key, value] of Object.entries(updates)) {
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
  }

  const query = params.toString()

  return query ? `/canchas?${query}` : '/canchas'
}

export function clampNumber(value: string, min: number, max: number, fallback: number) {
  if (!value.trim()) return fallback

  const number = Number(value)

  if (!Number.isInteger(number)) return fallback

  return Math.min(Math.max(number, min), max)
}
