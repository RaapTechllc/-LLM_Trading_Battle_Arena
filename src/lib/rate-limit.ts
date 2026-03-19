// Rate limiter with Upstash Redis support (falls back to in-memory for local dev)
// To enable distributed rate limiting: set UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10

// In-memory fallback for local development
const localRequests = new Map<string, number[]>()

// Periodic cleanup every 60s to prevent memory leaks
if (typeof globalThis !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    const windowStart = now - WINDOW_MS
    for (const [key, times] of localRequests.entries()) {
      const recent = times.filter(t => t > windowStart)
      if (recent.length === 0) {
        localRequests.delete(key)
      } else {
        localRequests.set(key, recent)
      }
    }
  }, 60_000)
}

interface RateLimitResult {
  allowed: boolean
  retryAfter?: number
  remaining?: number
}

// Check if Upstash is configured
const hasUpstash = !!(process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN)

async function upstashRateLimit(ip: string): Promise<RateLimitResult> {
  const key = `ratelimit:${ip}`
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  try {
    // Use Upstash REST API directly (no SDK needed)
    const baseUrl = process.env.UPSTASH_REDIS_REST_URL!
    const token = process.env.UPSTASH_REDIS_REST_TOKEN!

    // ZRANGEBYSCORE to get recent requests, ZADD to add new one, ZREMRANGEBYSCORE to cleanup
    // Using pipeline for efficiency
    const pipeline = [
      ["ZREMRANGEBYSCORE", key, "0", String(windowStart)],
      ["ZCARD", key],
      ["ZADD", key, String(now), String(now)],
      ["EXPIRE", key, "120"] // 2 min TTL
    ]

    const response = await fetch(`${baseUrl}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(pipeline),
      signal: AbortSignal.timeout(5000)
    })

    if (!response.ok) {
      console.error("Upstash rate limit error:", response.status)
      return inMemoryRateLimit(ip) // Fallback
    }

    const results = await response.json()
    const count = results[1]?.result || 0

    if (count >= MAX_REQUESTS) {
      return {
        allowed: false,
        retryAfter: Math.ceil(WINDOW_MS / 1000),
        remaining: 0
      }
    }

    return {
      allowed: true,
      remaining: MAX_REQUESTS - count - 1
    }
  } catch (error) {
    console.error("Upstash rate limit error:", error)
    return inMemoryRateLimit(ip) // Fallback on error
  }
}

function inMemoryRateLimit(ip: string): RateLimitResult {
  const now = Date.now()
  const windowStart = now - WINDOW_MS

  const timestamps = localRequests.get(ip) || []
  const recent = timestamps.filter(t => t > windowStart)

  if (recent.length >= MAX_REQUESTS) {
    const oldestInWindow = Math.min(...recent)
    const retryAfter = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfter, remaining: 0 }
  }

  recent.push(now)
  localRequests.set(ip, recent)

  // Cleanup old entries periodically
  if (localRequests.size > 1000) {
    for (const [key, times] of localRequests.entries()) {
      if (times.every(t => t < windowStart)) localRequests.delete(key)
    }
  }

  return { allowed: true, remaining: MAX_REQUESTS - recent.length }
}

// Synchronous wrapper for backward compatibility
// Note: For production with Upstash, use rateLimitAsync instead
export function rateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  // In serverless, we can't easily make this async without changing all callers
  // So we use in-memory for the sync version
  return inMemoryRateLimit(ip)
}

// Async version with Upstash support
export async function rateLimitAsync(ip: string): Promise<RateLimitResult> {
  if (hasUpstash) {
    return upstashRateLimit(ip)
  }
  return inMemoryRateLimit(ip)
}

// Export config for testing
export const RATE_LIMIT_CONFIG = {
  windowMs: WINDOW_MS,
  maxRequests: MAX_REQUESTS,
  hasUpstash
}
