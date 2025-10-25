const DEFAULT_TTL = 1000 * 60 * 5 // 5 minutes

interface CacheEntry<T> {
  data: T
  expiresAt: number
}

const cacheStore = new Map<string, CacheEntry<unknown>>()
const pendingFetches = new Map<string, Promise<unknown>>()

function isExpired(entry: CacheEntry<unknown>, now: number): boolean {
  return entry.expiresAt <= now
}

export async function fetchWithCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = DEFAULT_TTL,
): Promise<T> {
  const now = Date.now()
  const cached = cacheStore.get(key)

  if (cached && !isExpired(cached, now)) {
    return cached.data as T
  }

  if (pendingFetches.has(key)) {
    return (await pendingFetches.get(key)) as T
  }

  const fetchPromise = (async () => {
    try {
      const data = await fetcher()
      cacheStore.set(key, { data, expiresAt: now + ttl })
      return data
    } finally {
      pendingFetches.delete(key)
    }
  })()

  pendingFetches.set(key, fetchPromise as Promise<unknown>)

  return fetchPromise
}

export function invalidateCache(key: string): void {
  cacheStore.delete(key)
  pendingFetches.delete(key)
}

export function clearCache(): void {
  cacheStore.clear()
  pendingFetches.clear()
}

