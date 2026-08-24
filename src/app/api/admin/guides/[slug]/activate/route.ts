import { NextRequest, NextResponse } from 'next/server';
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import prisma from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const auditContext = getAdminAuditContext(req);

  const { slug } = await params;
  const body = await req.json();
  const { action, generatePassword } = body as { action: 'activate' | 'suspend'; generatePassword?: boolean };
  if (generatePassword) {
    return NextResponse.json(
      { error: 'Le mot de passe doit être réinitialisé par le guide.' },
      { status: 403 },
    );
  }

  const guide = await prisma.guideProfile.findUnique({
    where: { slug },
    include: {
      guideAccount: { select: { id: true, email: true, displayName: true, firstName: true, lastName: true } },
    },
  });

  if (!guide) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });

  if (action === 'suspend') {
    await prisma.$transaction([
      prisma.guideProfile.update({ where: { slug }, data: { status: 'SUSPENDED' } }),
      ...(guide.guideAccountId ? [prisma.guideAccount.update({ where: { id: guide.guideAccountId }, data: { status: 'SUSPENDED' } })] : []),
      ...(guide.guideAccountId ? [prisma.guideSession.updateMany({
        where: { guideAccountId: guide.guideAccountId, revokedAt: null },
        data: { revokedAt: new Date() },
      })] : []),
      prisma.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: 'GUIDE_SUSPENDED',
          target: guide.id,
          detail: adminAuditDetail(auditContext),
          before: { status: guide.status },
          after: { status: 'SUSPENDED' },
          ...adminAuditFields(auditContext),
        },
      }),
    ]);
    return NextResponse.json({ success: true, newStatus: 'SUSPENDED', message: 'Profil suspendu.' });
  }

  if (action === 'activate') {
    await prisma.guideProfile.update({
      where: { slug },
      data: {
        status: 'ACTIVE',
        approvedByAdminId: actor.id,
        approvedByEmail: actor.email,
        approvedAt: guide.approvedAt || new Date(),
      },
    });
    if (guide.guideAccountId) {
      await prisma.guideAccount.update({ where: { id: guide.guideAccountId }, data: { status: 'ACTIVE' } });
    }

    await prisma.auditLog.create({
      data: {
        actor: actor.email,
        actorRole: actor.role,
        actorAdminId: actor.id,
        action: 'GUIDE_ACTIVATED',
        target: guide.id,
        detail: adminAuditDetail(auditContext),
        before: { status: guide.status },
        after: { status: 'ACTIVE' },
        ...adminAuditFields(auditContext),
      },
    });
    return NextResponse.json({ success: true, newStatus: 'ACTIVE', message: 'Profil activé.' });
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
}
