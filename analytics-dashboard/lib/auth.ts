import 'server-only'

import { createHmac, randomBytes, scryptSync, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

const COOKIE_NAME = 'safaruma_superadmin'
const SESSION_SECONDS = 8 * 60 * 60

function equalText(left: string, right: string): boolean {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

function signature(payload: string): string {
  const secret = process.env.SUPERADMIN_SESSION_SECRET
  if (!secret) throw new Error('SUPERADMIN_SESSION_SECRET manquant')
  return createHmac('sha256', secret).update(payload).digest('base64url')
}

export function verifyCredentials(username: string, password: string): boolean {
  const expectedUsername = process.env.SUPERADMIN_USERNAME
  const salt = process.env.SUPERADMIN_PASSWORD_SALT
  const expectedHash = process.env.SUPERADMIN_PASSWORD_HASH
  if (!expectedUsername || !salt || !expectedHash) return false

  const usernameValid = equalText(username, expectedUsername)
  const derived = scryptSync(password, salt, 64).toString('hex')
  return usernameValid && equalText(derived, expectedHash)
}

export async function createSession(): Promise<void> {
  const now = Math.floor(Date.now() / 1000)
  const payload = Buffer.from(JSON.stringify({ iat: now, exp: now + SESSION_SECONDS, nonce: randomBytes(16).toString('hex') })).toString('base64url')
  const token = `${payload}.${signature(payload)}`
  const store = await cookies()
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: SESSION_SECONDS,
    priority: 'high',
  })
}

export async function hasValidSession(): Promise<boolean> {
  const token = (await cookies()).get(COOKIE_NAME)?.value
  if (!token) return false
  const [payload, providedSignature, extra] = token.split('.')
  if (!payload || !providedSignature || extra || !equalText(providedSignature, signature(payload))) return false
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { exp?: number }
    return typeof data.exp === 'number' && data.exp > Math.floor(Date.now() / 1000)
  } catch {
    return false
  }
}

export async function deleteSession(): Promise<void> {
  const store = await cookies()
  store.delete(COOKIE_NAME)
}
