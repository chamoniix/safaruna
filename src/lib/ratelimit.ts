import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

function makeRatelimit(requests: number, window: `${number} s` | `${number} m` | `${number} h`) {
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    return null
  }
  return new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix: 'safaruma:rl',
  })
}

// 5 requests / 15 minutes for auth endpoints
export const authRatelimit = makeRatelimit(5, '15 m')
// 30 requests / minute for conversation/message endpoints
export const apiRatelimit = makeRatelimit(30, '1 m')

/**
 * Returns a 429 response if rate-limited, null otherwise.
 * Falls back to allowing the request if Upstash is not configured.
 */
export async function checkRateLimit(
  req: NextRequest,
  limiter: Ratelimit | null
): Promise<NextResponse | null> {
  if (!limiter) return null

  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  const { success, limit, remaining, reset } = await limiter.limit(ip)

  if (!success) {
    return NextResponse.json(
      { error: 'Trop de requêtes — réessayez dans quelques instants.' },
      {
        status: 429,
        headers: {
          'X-RateLimit-Limit': String(limit),
          'X-RateLimit-Remaining': String(remaining),
          'X-RateLimit-Reset': String(reset),
          'Retry-After': String(Math.ceil((reset - Date.now()) / 1000)),
        },
      }
    )
  }

  return null
}
