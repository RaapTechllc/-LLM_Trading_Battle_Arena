// In-memory rate limiter (no Redis needed for hackathon)
const requests = new Map<string, number[]>()

const WINDOW_MS = 60 * 1000 // 1 minute
const MAX_REQUESTS = 10

export function rateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowStart = now - WINDOW_MS
  
  const timestamps = requests.get(ip) || []
  const recent = timestamps.filter(t => t > windowStart)
  
  if (recent.length >= MAX_REQUESTS) {
    const oldestInWindow = Math.min(...recent)
    const retryAfter = Math.ceil((oldestInWindow + WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfter }
  }
  
  recent.push(now)
  requests.set(ip, recent)
  
  // Cleanup old entries periodically
  if (requests.size > 1000) {
    for (const [key, times] of requests.entries()) {
      if (times.every(t => t < windowStart)) requests.delete(key)
    }
  }
  
  return { allowed: true }
}
