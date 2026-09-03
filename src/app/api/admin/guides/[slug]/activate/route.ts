import { NextRequest, NextResponse } from 'next/server';
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import { sendGuideProfileActivated } from '@/lib/email';
import { missingRequiredGuideProfileFields } from '@/lib/guide-profile-changes';
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
      guideAccount: { select: { id: true, email: true, displayName: true, firstName: true, lastName: true, phoneWhatsapp: true } },
      changeRequests: { where: { status: 'PENDING' }, take: 1, select: { id: true } },
      languages: { select: { languageCode: true } },
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
    if (guide.permanentlyDeactivatedAt) {
      return NextResponse.json({ error: 'Ce Guide est définitivement désactivé après trois annulations comptabilisées.' }, { status: 409 });
    }
    if (guide.status === 'DRAFT') {
      return NextResponse.json({ error: 'Le Guide doit d’abord soumettre son profil pour validation.' }, { status: 409 });
    }
    if (guide.status === 'REVIEW' && guide.changeRequests.length > 0) {
      return NextResponse.json({ error: 'Validez ou rejetez d’abord les modifications de profil en attente.' }, { status: 409 });
    }
    const missing = missingRequiredGuideProfileFields({
      firstName: guide.guideAccount?.firstName || null,
      lastName: guide.guideAccount?.lastName || null,
      phoneWhatsapp: guide.guideAccount?.phoneWhatsapp || null,
      bio: guide.bio,
      city: guide.city,
      gender: guide.gender,
      nationality: guide.nationality,
      experienceYears: guide.experienceYears,
      languages: guide.languages.map(language => language.languageCode),
      servesMakkah: guide.servesMakkah,
      servesMadinah: guide.servesMadinah,
    });
    if (missing.length > 0) {
      return NextResponse.json({ error: `Profil incomplet : ${missing.join(', ')}.` }, { status: 409 });
    }
    await prisma.$transaction([
      prisma.guideProfile.update({
        where: { slug },
        data: {
          status: 'ACTIVE',
          approvedByAdminId: actor.id,
          approvedByEmail: actor.email,
          approvedAt: new Date(),
        },
      }),
      ...(guide.guideAccountId ? [prisma.guideAccount.update({
        where: { id: guide.guideAccountId },
        data: { status: 'ACTIVE' },
      })] : []),
      prisma.auditLog.create({
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
      }),
    ]);
    if (guide.status !== 'ACTIVE' && guide.guideAccount?.email && guide.slug) {
      const name = guide.guideAccount.displayName
        || `${guide.guideAccount.firstName ?? ''} ${guide.guideAccount.lastName ?? ''}`.trim()
        || 'Guide';
      await sendGuideProfileActivated({
        to: guide.guideAccount.email,
        name,
        profileUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/guides/${guide.slug}`,
      }).catch(error => console.error('[guide activation email]', error));
    }
    return NextResponse.json({ success: true, newStatus: 'ACTIVE', message: 'Profil activé.' });
  }

  return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
}
