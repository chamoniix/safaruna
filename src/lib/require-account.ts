import 'server-only'

import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
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
  legacyUserId: string
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
    select: { id: true, email: true, role: true },
  })

  if (!user) return denied(401, 'Session invalide')
  if (user.role !== 'PELERIN') return denied(403, 'Accès réservé aux pèlerins')
  if (!user.email) return denied(403, 'Compte sans adresse email')

  return { ok: true, actor: { id: user.id, email: user.email, role: 'PELERIN' } }
}

export async function requireGuide(): Promise<Allowed<GuideActor> | Denied> {
  const identity = await currentSessionIdentity()
  if (!identity) return denied(401, 'Non autorisé')

  const account = await prisma.guideAccount.findFirst({
    where: {
      OR: [
        ...(identity.id ? [{ id: identity.id }] : []),
        ...(identity.email ? [{ email: identity.email }] : []),
      ],
    },
    select: {
      id: true,
      email: true,
      status: true,
      legacyUserId: true,
      guideProfile: { select: { id: true, status: true } },
    },
  })

  if (!account) return denied(401, 'Session guide invalide')
  if (account.status !== 'ACTIVE' || account.guideProfile?.status === 'SUSPENDED') return denied(403, 'Compte guide suspendu')
  if (!account.email || !account.guideProfile || !account.legacyUserId) return denied(403, 'Profil guide introuvable')

  return {
    ok: true,
    actor: {
      id: account.id,
      email: account.email,
      role: 'GUIDE',
      guideProfileId: account.guideProfile.id,
      guideStatus: account.guideProfile.status,
      legacyUserId: account.legacyUserId,
    },
  }
}
