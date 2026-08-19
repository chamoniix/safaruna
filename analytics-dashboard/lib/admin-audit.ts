import 'server-only'

import { randomUUID } from 'node:crypto'
import { Redis } from '@upstash/redis'
import type { NextRequest } from 'next/server'

export type AdminLoginEvent = {
  id: string
  at: string
  username: string
  success: boolean
  reason: 'success' | 'invalid_credentials' | 'rate_limited'
  ip: string
  country: string
  city: string
  device: 'Mobile' | 'Tablette' | 'Ordinateur' | 'Inconnu'
  browser: string
}

const url = process.env.RATE_LIMIT_KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
const token = process.env.RATE_LIMIT_KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
const redis = url && token ? new Redis({ url, token }) : null
const KEY = 'safaruma:analytics:admin-login-history'

function device(userAgent: string): AdminLoginEvent['device'] {
  if (!userAgent) return 'Inconnu'
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return 'Tablette'
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return 'Mobile'
  return 'Ordinateur'
}

function browser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return 'Edge'
  if (/Firefox\//i.test(userAgent)) return 'Firefox'
  if (/CriOS|Chrome\//i.test(userAgent)) return 'Chrome'
  if (/Safari\//i.test(userAgent)) return 'Safari'
  return userAgent ? 'Autre' : 'Inconnu'
}

function decodedHeader(value: string | null) {
  if (!value) return 'Inconnue'
  try { return decodeURIComponent(value) } catch { return value }
}

export async function recordAdminLoginAttempt(
  req: NextRequest,
  username: string,
  success: boolean,
  reason: AdminLoginEvent['reason'],
) {
  if (!redis) return
  const userAgent = req.headers.get('user-agent') || ''
  const event: AdminLoginEvent = {
    id: randomUUID(),
    at: new Date().toISOString(),
    username: username.slice(0, 100),
    success,
    reason,
    ip: (req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || 'Inconnue').slice(0, 64),
    country: (req.headers.get('x-vercel-ip-country') || 'Inconnu').slice(0, 32),
    city: decodedHeader(req.headers.get('x-vercel-ip-city')).slice(0, 80),
    device: device(userAgent),
    browser: browser(userAgent),
  }
  try {
    await redis.lpush(KEY, event)
    await redis.ltrim(KEY, 0, 199)
    await redis.expire(KEY, 90 * 24 * 60 * 60)
  } catch { /* l'authentification ne doit jamais dépendre du journal */ }
}

export async function getAdminLoginHistory(): Promise<AdminLoginEvent[]> {
  if (!redis) return []
  try { return await redis.lrange<AdminLoginEvent>(KEY, 0, 49) } catch { return [] }
}
