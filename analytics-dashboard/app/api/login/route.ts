import { NextRequest, NextResponse } from 'next/server'
import { createSession, verifyCredentials } from '@/lib/auth'
import { checkLoginRateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) {
    return NextResponse.json({ error: 'Origine invalide' }, { status: 403 })
  }

  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > 4_096) return NextResponse.json({ error: 'Requête invalide' }, { status: 413 })

  let body: { username?: unknown; password?: unknown }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
  const username = typeof body.username === 'string' ? body.username.trim() : ''
  const password = typeof body.password === 'string' ? body.password : ''
  if (!username || !password || username.length > 100 || password.length > 200) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
  }

  if (!await checkLoginRateLimit(username)) {
    return NextResponse.json({ error: 'Trop de tentatives. Réessayez dans 15 minutes.' }, { status: 429 })
  }
  if (!verifyCredentials(username, password)) {
    return NextResponse.json({ error: 'Identifiants invalides' }, { status: 401 })
  }

  await createSession()
  return NextResponse.json({ success: true })
}
