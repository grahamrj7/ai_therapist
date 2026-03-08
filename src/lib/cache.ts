const cache = new Map<string, { data: unknown; timestamp: number }>()

const DEFAULT_TTL = 5 * 60 * 1000 // 5 minutes

export function getCached<T>(key: string, ttl: number = DEFAULT_TTL): T | null {
  const entry = cache.get(key)
  if (!entry) return null
  
  if (Date.now() - entry.timestamp > ttl) {
    cache.delete(key)
    return null
  }
  
  return entry.data as T
}

export function setCache<T>(key: string, data: T): void {
  cache.set(key, { data, timestamp: Date.now() })
}

export function invalidateCache(key: string): void {
  cache.delete(key)
}

export function clearCache(): void {
  cache.clear()
}
