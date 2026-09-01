import { createHmac, timingSafeEqual } from 'node:crypto'

export const REFERRAL_OAUTH_COOKIE = 'safaruma_referral_intent'

type ReferralIntentPayload = { id: string; exp: number }

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET
  if (!value) throw new Error('NEXTAUTH_SECRET manquant')
  return value
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function createReferralIntentCookie(intentId: string, expiresAt: Date): string {
  const payload = Buffer.from(JSON.stringify({ id: intentId, exp: Math.floor(expiresAt.getTime() / 1000) })).toString('base64url')
  return `${payload}.${sign(payload)}`
}

export function readReferralIntentCookie(cookieHeader: string | null): string | null {
  const raw = cookieHeader?.split(';').map(part => part.trim()).find(part => part.startsWith(`${REFERRAL_OAUTH_COOKIE}=`))?.slice(REFERRAL_OAUTH_COOKIE.length + 1)
  if (!raw) return null
  const [payload, signature, extra] = raw.split('.')
  if (!payload || !signature || extra) return null
  const expected = sign(payload)
  const provided = Buffer.from(signature)
  const expectedBuffer = Buffer.from(expected)
  if (provided.length !== expectedBuffer.length || !timingSafeEqual(provided, expectedBuffer)) return null
  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as ReferralIntentPayload
    if (!value.id || !Number.isInteger(value.exp) || value.exp <= Math.floor(Date.now() / 1000)) return null
    return value.id
  } catch {
    return null
  }
}
