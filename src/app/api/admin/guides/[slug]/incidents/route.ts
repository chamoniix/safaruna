import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import prisma from '@/lib/prisma'

const decisionSchema = z.object({
  incidentId: z.string().min(1),
  action: z.enum(['COUNT', 'EXCUSE']),
  reviewNotes: z.string().trim().max(2000).optional(),
}).strict()

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const parsed = decisionSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Décision invalide' }, { status: 400 })
  const { slug } = await params
  const auditContext = getAdminAuditContext(req)

  try {
    const result = await prisma.$transaction(async tx => {
      const guide = await tx.guideProfile.findUnique({
        where: { slug },
        select: { id: true, cancellationCount: true, permanentlyDeactivatedAt: true },
      })
      if (!guide) throw new Error('GUIDE_NOT_FOUND')
      const incident = await tx.guideReservationIncident.findUnique({
        where: { id: parsed.data.incidentId },
        include: { reservation: { select: { refNumber: true } } },
      })
      if (!incident || incident.guideProfileId !== guide.id) throw new Error('INCIDENT_NOT_FOUND')
      if (incident.status !== 'PENDING') throw new Error('INCIDENT_ALREADY_REVIEWED')

      const counted = parsed.data.action === 'COUNT'
      const cancellationCount = counted ? guide.cancellationCount + 1 : guide.cancellationCount
      const permanentlyDeactivatedAt = counted && cancellationCount >= 3
        ? guide.permanentlyDeactivatedAt || new Date()
        : guide.permanentlyDeactivatedAt
      const reviewedAt = new Date()

      await tx.guideReservationIncident.update({
        where: { id: incident.id },
        data: {
          status: counted ? 'COUNTED' : 'EXCUSED',
          reviewedByAdminId: actor.id,
          reviewedByEmail: actor.email,
          reviewNotes: parsed.data.reviewNotes || null,
          reviewedAt,
        },
      })
      await tx.guideProfile.update({
        where: { id: guide.id },
        data: { cancellationCount, permanentlyDeactivatedAt },
      })
      await tx.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: counted ? 'GUIDE_RESERVATION_INCIDENT_COUNTED' : 'GUIDE_RESERVATION_INCIDENT_EXCUSED',
          target: incident.reservation.refNumber,
          detail: adminAuditDetail(auditContext, {
            incidentId: incident.id,
            guideProfileId: guide.id,
            incidentType: incident.type,
            cancellationCount,
            permanentlyDeactivated: Boolean(permanentlyDeactivatedAt),
          }),
          before: { incidentStatus: incident.status, cancellationCount: guide.cancellationCount },
          after: {
            incidentStatus: counted ? 'COUNTED' : 'EXCUSED',
            cancellationCount,
            permanentlyDeactivatedAt,
            reviewNotes: parsed.data.reviewNotes || null,
          },
          ...adminAuditFields(auditContext),
        },
      })

      return { cancellationCount, permanentlyDeactivated: Boolean(permanentlyDeactivatedAt) }
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })

    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    if (error instanceof Error && error.message === 'GUIDE_NOT_FOUND') {
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })
    }
    if (error instanceof Error && error.message === 'INCIDENT_NOT_FOUND') {
      return NextResponse.json({ error: 'Incident introuvable' }, { status: 404 })
    }
    if (error instanceof Error && error.message === 'INCIDENT_ALREADY_REVIEWED') {
      return NextResponse.json({ error: 'Cet incident a déjà été traité' }, { status: 409 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') {
      return NextResponse.json({ error: 'La décision a été modifiée simultanément. Rechargez la fiche.' }, { status: 409 })
    }
    throw error
  }
}
