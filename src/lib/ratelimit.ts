import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { NextRequest, NextResponse } from 'next/server'

function makeRatelimit(
  requests: number,
  window: `${number} s` | `${number} m` | `${number} h`,
  prefix = 'safaruma:rl'
) {
  const url = process.env.RATE_LIMIT_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.RATE_LIMIT_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  if (!url || !token) {
    return null
  }
  return new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(requests, window),
    prefix,
  })
}

// 5 requests / 15 minutes for auth endpoints
export const authRatelimit = makeRatelimit(5, '15 m')
export const adminAuthRatelimit = makeRatelimit(5, '15 m', 'safaruma:rl:admin-auth')
export const guideAuthRatelimit = makeRatelimit(5, '15 m', 'safaruma:rl:guide-auth')
export const pelerinAuthRatelimit = makeRatelimit(5, '15 m', 'safaruma:rl:pelerin-auth')
// 30 requests / minute for conversation/message endpoints
export const apiRatelimit = makeRatelimit(30, '1 m')
// 5 contact form submissions / 15 minutes per IP
export const contactRatelimit = makeRatelimit(5, '15 m', 'safaruma:rl:contact')
// 3 candidatures guide / heure par IP
export const guideApplicationRatelimit = makeRatelimit(3, '1 h', 'safaruma:rl:guide-application')
// 5 créations ou modifications d'avis / 15 minutes par compte et IP
export const reviewRatelimit = makeRatelimit(5, '15 m', 'safaruma:rl:review')

/**
 * Returns a 429 response if rate-limited, null otherwise.
 * Falls back to allowing the request if Upstash is not configured.
 */
export async function checkRateLimit(
  req: NextRequest,
  limiter: Ratelimit | null
): Promise<NextResponse | null> {
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown'

  return checkRateLimitKey(limiter, ip)
}

export async function checkRateLimitKey(
  limiter: Ratelimit | null,
  key: string,
): Promise<NextResponse | null> {
  if (!limiter) return null

  let result: Awaited<ReturnType<Ratelimit['limit']>>
  try {
    result = await limiter.limit(key)
  } catch (error) {
    // Le service Upstash ne doit pas rendre les routes métier indisponibles.
    console.error('[rate-limit] Upstash indisponible, requête autorisée', error)
    return null
  }

  const { success, limit, remaining, reset } = result

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
