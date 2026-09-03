import { NextRequest, NextResponse } from 'next/server'
import { getAdminActor } from '@/lib/check-admin'
import prisma from '@/lib/prisma'

const ADMIN_OPERATIONAL_ACTIONS = [
  'GUIDE_ACTIVATED',
  'GUIDE_SUSPENDED',
  'GUIDE_CREATED_BY_ADMIN',
  'GUIDE_APPLICATION_APPROVED',
  'GUIDE_APPLICATION_REJECTED',
  'GUIDE_APPLICATION_IN_REVIEW',
  'GUIDE_IDENTITY_UPDATED',
  'GUIDE_PROFILE_UPDATED',
  'GUIDE_INTERVIEW_UPDATED',
  'GUIDE_LANGUAGE_ADDED',
  'GUIDE_LANGUAGE_DELETED',
  'GUIDE_PLACE_TOGGLED',
  'GUIDE_PROFILE_SUBMITTED_FOR_REVIEW',
  'GUIDE_RESERVATION_DECLINED_AND_SUSPENDED',
  'GUIDE_NO_RESPONSE_AND_SUSPENDED',
  'GUIDE_RESERVATION_INCIDENT_COUNTED',
  'GUIDE_RESERVATION_INCIDENT_EXCUSED',
  'RESERVATION_STATUS_UPDATED',
  'RESERVATION_GUIDE_TRANSFERRED',
] as const

function operationalDetail(detail: string | null): string | null {
  if (!detail) return null
  try {
    const parsed = JSON.parse(detail) as Record<string, unknown>
    delete parsed.request
    return Object.keys(parsed).length > 0 ? JSON.stringify(parsed) : null
  } catch {
    return null
  }
}

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const logs = await prisma.auditLog.findMany({
    ...(actor.role === 'ADMIN' && { where: { action: { in: [...ADMIN_OPERATIONAL_ACTIONS] } } }),
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  if (actor.role === 'SUPERADMIN') {
    return NextResponse.json({ logs, networkVisible: true, scope: 'FULL' })
  }

  return NextResponse.json({
    networkVisible: false,
    scope: 'OPERATIONAL',
    logs: logs.map(log => ({
      id: log.id,
      createdAt: log.createdAt,
      actor: log.actor,
      actorRole: log.actorRole,
      action: log.action,
      target: log.target,
      detail: operationalDetail(log.detail),
      before: log.before,
      after: log.after,
    })),
  })
}

export async function POST() {
  return NextResponse.json(
    { error: 'Le journal d’audit est en écriture serveur uniquement.' },
    { status: 405, headers: { Allow: 'GET' } },
  )
}

export async function PATCH() {
  return NextResponse.json(
    { error: 'Le journal d’audit est immuable.' },
    { status: 405, headers: { Allow: 'GET' } },
  )
}

export async function DELETE() {
  return NextResponse.json(
    { error: 'Le journal d’audit est immuable.' },
    { status: 405, headers: { Allow: 'GET' } },
  )
}
