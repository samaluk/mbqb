type Bucket = {
  count: number
  resetAt: number
}

export type RateLimiter = {
  consume: (key: string) => boolean
}

export const createFixedWindowRateLimiter = ({
  limit,
  windowMs,
}: {
  limit: number
  windowMs: number
}): RateLimiter => {
  const buckets = new Map<string, Bucket>()

  return {
    consume: (key) => {
      const now = Date.now()
      const bucket = buckets.get(key)

      if (!bucket || bucket.resetAt <= now) {
        buckets.set(key, {
          count: 1,
          resetAt: now + windowMs,
        })
        return true
      }

      if (bucket.count >= limit) {
        return false
      }

      bucket.count += 1
      return true
    },
  }
}
