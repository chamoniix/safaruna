import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(['APPROVED', 'REJECTED']),
  reviewNotes: z.string().max(2000).optional(),
});

const ANONYMIZED_NAME = 'Pèlerin Safaruma';

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const statusParam = req.nextUrl.searchParams.get('status');
  const status = ['PENDING', 'APPROVED', 'REJECTED'].includes(statusParam || '')
    ? (statusParam as 'PENDING' | 'APPROVED' | 'REJECTED')
    : undefined;

  const [requests, counts] = await Promise.all([
    prisma.accountDeletionRequest.findMany({
      where: status ? { status } : undefined,
      orderBy: { requestedAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, createdAt: true } },
      },
    }),
    prisma.accountDeletionRequest.groupBy({ by: ['status'], _count: { status: true } }),
  ]);

  return NextResponse.json({
    requests: requests.map(r => ({
      id: r.id,
      status: r.status,
      requestedAt: r.requestedAt.toISOString(),
      reviewedAt: r.reviewedAt ? r.reviewedAt.toISOString() : null,
      reviewedByEmail: r.reviewedByEmail,
      reviewNotes: r.reviewNotes,
      user: {
        id: r.user.id,
        name: r.user.name || `${r.user.firstName ?? ''} ${r.user.lastName ?? ''}`.trim() || r.user.email,
        email: r.user.email,
        createdAt: r.user.createdAt.toISOString(),
      },
    })),
    counts: Object.fromEntries(counts.map(c => [c.status, c._count.status])),
  });
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Seul le Superadmin peut valider une suppression de compte.' }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Requête invalide' }, { status: 400 });
  const { requestId, status, reviewNotes } = parsed.data;

  const deletionRequest = await prisma.accountDeletionRequest.findUnique({ where: { id: requestId } });
  if (!deletionRequest) return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
  if (deletionRequest.status !== 'PENDING') {
    return NextResponse.json({ error: 'Cette demande a déjà été traitée.' }, { status: 409 });
  }

  const context = getAdminAuditContext(req);
  const now = new Date();

  try {
    if (status === 'REJECTED') {
      await prisma.$transaction(async tx => {
        const claimed = await tx.accountDeletionRequest.updateMany({
          where: { id: requestId, status: 'PENDING' },
          data: { status: 'REJECTED', reviewedByAdminId: actor.id, reviewedByEmail: actor.email, reviewNotes, reviewedAt: now },
        });
        if (claimed.count !== 1) throw new Error('DELETION_REQUEST_ALREADY_HANDLED');

        await tx.user.update({ where: { id: deletionRequest.userId }, data: { bannedAt: null } });
        await tx.auditLog.create({
          data: {
            actor: actor.email,
            actorRole: actor.role,
            actorAdminId: actor.id,
            action: 'PELERIN_DELETION_REJECTED',
            target: deletionRequest.userId,
            detail: adminAuditDetail(context, { requestId }),
            ...adminAuditFields(context),
          },
        });
      });
      return NextResponse.json({ success: true });
    }

    const anonymizedEmail = `deleted-${deletionRequest.userId}@safaruma.invalid`;
    await prisma.$transaction(async tx => {
      const claimed = await tx.accountDeletionRequest.updateMany({
        where: { id: requestId, status: 'PENDING' },
        data: { status: 'APPROVED', reviewedByAdminId: actor.id, reviewedByEmail: actor.email, reviewNotes, reviewedAt: now },
      });
      if (claimed.count !== 1) throw new Error('DELETION_REQUEST_ALREADY_HANDLED');

      await tx.user.update({
        where: { id: deletionRequest.userId },
        data: {
          name: ANONYMIZED_NAME,
          firstName: ANONYMIZED_NAME,
          lastName: null,
          email: anonymizedEmail,
          image: null,
          passwordHash: null,
          phoneWhatsapp: null,
          country: null,
          bannedAt: now,
        },
      });
      await tx.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: 'PELERIN_DELETION_APPROVED',
          target: deletionRequest.userId,
          detail: adminAuditDetail(context, { requestId }),
          ...adminAuditFields(context),
        },
      });
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof Error && error.message === 'DELETION_REQUEST_ALREADY_HANDLED') {
      return NextResponse.json({ error: 'Cette demande a déjà été traitée.' }, { status: 409 });
    }
    throw error;
  }
}
