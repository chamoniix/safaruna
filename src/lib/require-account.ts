import 'server-only'

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { readGuideSessionToken, resolveGuideSession } from '@/lib/guide-auth'
import prisma from '@/lib/prisma'

type Denied = {
  ok: false
  response: NextResponse
}

export type PelerinActor = {
  id: string
  email: string
  role: 'PELERIN'
}

export type GuideActor = {
  id: string
  email: string
  role: 'GUIDE'
  guideProfileId: string
  guideStatus: 'DRAFT' | 'REVIEW' | 'ACTIVE'
  guideSlug: string | null
  acceptingBookings: boolean
  servesMakkah: boolean
  servesMadinah: boolean
  displayName: string | null
  firstName: string | null
  lastName: string | null
}

type Allowed<T> = {
  ok: true
  actor: T
}

function denied(status: 401 | 403, error: string): Denied {
  return {
    ok: false,
    response: NextResponse.json(
      { error },
      { status, headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
    ),
  }
}

async function currentSessionIdentity() {
  const session = await getServerSession(authOptions)
  const id = session?.user?.id
  const email = session?.user?.email
  if (!id && !email) return null
  return { id: id || null, email: email || null }
}

export async function requirePelerin(): Promise<Allowed<PelerinActor> | Denied> {
  const identity = await currentSessionIdentity()
  if (!identity) return denied(401, 'Non autorisé')

  const user = await prisma.user.findFirst({
    where: identity.id ? { id: identity.id } : { email: identity.email },
    select: { id: true, email: true, emailVerified: true, role: true },
  })

  if (!user) return denied(401, 'Session invalide')
  if (user.role !== 'PELERIN') return denied(403, 'Accès réservé aux pèlerins')
  if (!user.email) return denied(403, 'Compte sans adresse email')
  if (!user.emailVerified) return denied(403, 'Adresse email non vérifiée')

  return { ok: true, actor: { id: user.id, email: user.email, role: 'PELERIN' } }
}

export async function requireGuide(): Promise<Allowed<GuideActor> | Denied> {
  const token = await readGuideSessionToken()
  if (!token) return denied(401, 'Non autorisé')

  const guideSession = await resolveGuideSession(token)
  if (!guideSession) return denied(401, 'Session guide invalide')
  const account = guideSession.guideAccount

  if (account.status !== 'ACTIVE' || account.guideProfile?.status === 'SUSPENDED') return denied(403, 'Compte guide suspendu')
  if (!account.email || !account.guideProfile) return denied(403, 'Profil guide introuvable')

  return {
    ok: true,
    actor: {
      id: account.id,
      email: account.email,
      role: 'GUIDE',
      guideProfileId: account.guideProfile.id,
      guideStatus: account.guideProfile.status,
      guideSlug: account.guideProfile.slug,
      acceptingBookings: account.guideProfile.acceptingBookings,
      servesMakkah: account.guideProfile.servesMakkah,
      servesMadinah: account.guideProfile.servesMadinah,
      displayName: account.displayName,
      firstName: account.firstName,
      lastName: account.lastName,
    },
  }
}
