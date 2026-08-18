import { createHmac } from 'node:crypto'
import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const url = process.env.RATE_LIMIT_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.RATE_LIMIT_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN

const limiter = url && token
  ? new Ratelimit({
      redis: new Redis({ url, token }),
      limiter: Ratelimit.slidingWindow(5, '15 m'),
      prefix: 'safaruma:analytics:login',
    })
  : null

export async function checkLoginRateLimit(username: string): Promise<boolean> {
  if (!limiter) return true
  const secret = process.env.SUPERADMIN_SESSION_SECRET || 'unconfigured'
  const key = createHmac('sha256', secret).update(username.toLowerCase()).digest('hex')
  try {
    return (await limiter.limit(key)).success
  } catch {
    return true
  }
}
