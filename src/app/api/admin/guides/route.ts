import { NextRequest, NextResponse } from 'next/server';
import { adminAuditDetail, adminAuditFields, checkAdmin, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import { sendGuideAccess, dispatchGuideDossierEmails } from '@/lib/email';
import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { decideGuideStatus, GuideDossierDecisionError } from '@/lib/guide-dossier';

const EMAIL_ALREADY_USED = 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.';

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guides = await prisma.guideProfile.findMany({
    include: {
      guideAccount: { select: { id: true, displayName: true, email: true, registeredAt: true } },
      languages: true,
      reservations: { select: { id: true } },
      changeRequests: {
        where: { status: 'PENDING' },
        take: 1,
        select: { id: true },
      },
      reservationIncidents: {
        where: { status: 'PENDING' },
        select: { id: true },
      },
    },
    orderBy: { guideAccount: { registeredAt: 'desc' } },
  });

  return NextResponse.json({
    guides: guides.map(g => ({
      id: g.id,
      name: g.guideAccount?.displayName || '',
      email: g.guideAccount?.email || '',
      city: g.city || '',
      langs: g.languages.map(l => l.languageCode.toUpperCase()).join(', '),
      reservations: g.reservations.length,
      joined: g.guideAccount ? new Date(g.guideAccount.registeredAt).toLocaleDateString('fr-FR') : '—',
      createdByType: g.createdByType,
      createdByEmail: g.createdByEmail,
      status: g.status,
      slug: g.slug || '',
      pendingProfileChange: g.changeRequests.length > 0,
      cancellationCount: g.cancellationCount,
      permanentlyDeactivatedAt: g.permanentlyDeactivatedAt,
      pendingIncidentCount: g.reservationIncidents.length,
    })),
  });
}

export async function POST(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const auditContext = getAdminAuditContext(req);

  const { firstName, lastName, email: rawEmail } = await req.json();
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  if (!firstName || !email) return NextResponse.json({ error: 'Prénom et email requis' }, { status: 400 });

  await prisma.emailIdentity.deleteMany({ where: { email, quarantinedUntil: { lte: new Date() } } });
  const [identity, existing, existingGuideAccount, existingGuideApplication] = await Promise.all([
    prisma.emailIdentity.findUnique({ where: { email }, select: { kind: true } }),
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideApplication.findFirst({
      where: { email, status: { in: ['PENDING', 'IN_REVIEW', 'APPROVED'] } },
      select: { id: true },
    }),
  ]);
  if (identity || existing || existingGuideAccount || existingGuideApplication) {
    return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 });
  }

  // Generate slug
  const base = `${firstName} ${lastName || ''}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  let slug = base;
  let attempt = 1;
  while (await prisma.guideProfile.findUnique({ where: { slug } })) {
    slug = `${base}-${attempt++}`;
  }

  const invitationToken = randomBytes(32).toString('hex');
  const invitationTokenHash = createHash('sha256').update(invitationToken).digest('hex');
  const invitationExpiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000);
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXTAUTH_URL || 'https://safaruma.com';
  const setupUrl = `${baseUrl}/guide/reinitialiser-mot-de-passe?token=${invitationToken}`;

  let guideAccount;
  try {
    guideAccount = await prisma.$transaction(async tx => {
      await tx.emailIdentity.create({ data: { email, kind: 'GUIDE' } });
      const account = await tx.guideAccount.create({
        data: {
          email,
          emailVerified: new Date(),
          displayName: `${firstName} ${lastName || ''}`.trim(),
          firstName,
          lastName: lastName || '',
          guideProfile: {
            create: {
              slug,
              status: 'DRAFT',
              createdByType: actor.role,
              createdByAdminId: actor.id,
              createdByEmail: actor.email,
            },
          },
        },
        include: { guideProfile: { select: { id: true } } },
      });
      await tx.guidePasswordResetToken.create({
        data: {
          guideAccountId: account.id,
          tokenHash: invitationTokenHash,
          expiresAt: invitationExpiresAt,
        },
      });
      await tx.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: 'GUIDE_CREATED_BY_ADMIN',
          target: account.id,
          detail: adminAuditDetail(auditContext, { email, slug, guideAccountId: account.id, guideProfileId: account.guideProfile?.id }),
          after: { email, slug, status: 'DRAFT', createdByType: actor.role, createdByEmail: actor.email },
          ...adminAuditFields(auditContext),
        },
      });
      return account;
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 });
    }
    throw error;
  }

  let accessEmailSent = true;
  try {
    await sendGuideAccess({
      to: email,
      name: `${firstName} ${lastName || ''}`.trim(),
      email,
      setupUrl,
      profileActive: false,
    });
  } catch (e) {
    accessEmailSent = false;
    console.error('[admin/guides POST] email error', e);
    await prisma.guidePasswordResetToken.updateMany({
      where: { tokenHash: invitationTokenHash, usedAt: null },
      data: { usedAt: new Date() },
    }).catch(() => {});
  }
  await prisma.auditLog.create({
    data: {
      actor: actor.email,
      actorRole: actor.role,
      actorAdminId: actor.id,
      action: accessEmailSent ? 'GUIDE_ACCESS_EMAIL_SENT' : 'GUIDE_ACCESS_EMAIL_FAILED',
      target: guideAccount.id,
      detail: adminAuditDetail(auditContext, { email, guideAccountId: guideAccount.id }),
      ...adminAuditFields(auditContext),
    },
  }).catch(error => console.error('[admin/guides POST] email audit error', error));

  return NextResponse.json({ success: true, accessEmailSent, guideAccountId: guideAccount.id, guideProfileId: guideAccount.guideProfile?.id, slug }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const origin = req.headers.get('origin');
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 });
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || typeof body.guideId !== 'string' || !body.guideId || !['activate', 'suspend'].includes(body.action) || (body.action === 'activate' && (typeof body.revision !== 'string' || !/^[a-f0-9]{64}$/.test(body.revision)))) {
    return NextResponse.json({ error: 'Action ou version du dossier invalide. Rechargez la fiche.' }, { status: 400 });
  }
  try {
    const { status, emailIds } = await prisma.$transaction(tx => decideGuideStatus(tx, actor, getAdminAuditContext(req), { id: body.guideId }, body.action, body.revision), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    await dispatchGuideDossierEmails(emailIds);
    return NextResponse.json({ success: true, newStatus: status }, { headers: { 'Cache-Control': 'private, no-store' } });
  } catch (error) {
    if (error instanceof GuideDossierDecisionError) return NextResponse.json({ error: error.message }, { status: error.status });
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') return NextResponse.json({ error: 'Le dossier a changé. Rechargez la fiche avant de décider.' }, { status: 409 });
    console.error('[admin guide status]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
