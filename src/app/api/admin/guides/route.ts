import { NextRequest, NextResponse } from 'next/server';
import { adminAuditDetail, adminAuditFields, checkAdmin, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import { sendGuideAccess, sendGuideProfileActivated } from '@/lib/email';
import { createHash, randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { missingRequiredGuideProfileFields } from '@/lib/guide-profile-changes';

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
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const auditContext = getAdminAuditContext(req);

  const { guideId, action } = await req.json();
  if (!guideId || !['activate', 'suspend'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }
  const status = action === 'activate' ? 'ACTIVE' : 'SUSPENDED';

  const profile = await prisma.guideProfile.findUnique({
    where: { id: guideId },
    select: {
      guideAccountId: true,
      status: true,
      slug: true,
      bio: true,
      city: true,
      gender: true,
      nationality: true,
      experienceYears: true,
      servesMakkah: true,
      servesMadinah: true,
      permanentlyDeactivatedAt: true,
      changeRequests: { where: { status: 'PENDING' }, take: 1, select: { id: true } },
      languages: { select: { languageCode: true } },
      guideAccount: { select: { email: true, displayName: true, firstName: true, lastName: true, phoneWhatsapp: true } },
    },
  });
  if (!profile) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });
  if (action === 'activate' && profile.permanentlyDeactivatedAt) {
    return NextResponse.json({ error: 'Ce Guide est définitivement désactivé après trois annulations comptabilisées.' }, { status: 409 });
  }
  if (action === 'activate' && profile.status === 'DRAFT') {
    return NextResponse.json({ error: 'Le Guide doit d’abord soumettre son profil pour validation.' }, { status: 409 });
  }
  if (action === 'activate' && (profile.status === 'DRAFT' || profile.status === 'REVIEW') && profile.changeRequests.length > 0) {
    return NextResponse.json({ error: 'Validez ou rejetez d’abord les modifications de profil en attente.' }, { status: 409 });
  }
  if (action === 'activate') {
    const missing = missingRequiredGuideProfileFields({
      firstName: profile.guideAccount?.firstName || null,
      lastName: profile.guideAccount?.lastName || null,
      phoneWhatsapp: profile.guideAccount?.phoneWhatsapp || null,
      bio: profile.bio,
      city: profile.city,
      gender: profile.gender,
      nationality: profile.nationality,
      experienceYears: profile.experienceYears,
      languages: profile.languages.map(language => language.languageCode),
      servesMakkah: profile.servesMakkah,
      servesMadinah: profile.servesMadinah,
    });
    if (missing.length > 0) {
      return NextResponse.json({ error: `Profil incomplet : ${missing.join(', ')}.` }, { status: 409 });
    }
  }
  await prisma.$transaction([
    prisma.guideProfile.update({
      where: { id: guideId },
      data: {
        status,
        ...(status === 'ACTIVE' && {
          approvedByAdminId: actor.id,
          approvedByEmail: actor.email,
          approvedAt: new Date(),
        }),
      },
    }),
    ...(profile.guideAccountId ? [prisma.guideAccount.update({ where: { id: profile.guideAccountId }, data: { status: status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE' } })] : []),
    prisma.auditLog.create({
      data: {
        actor: actor.email,
        actorRole: actor.role,
        actorAdminId: actor.id,
        action: status === 'ACTIVE' ? 'GUIDE_ACTIVATED' : 'GUIDE_SUSPENDED',
        target: guideId,
        detail: adminAuditDetail(auditContext),
        before: { status: profile.status },
        after: { status },
        ...adminAuditFields(auditContext),
      },
    }),
  ]);

  if (status === 'ACTIVE' && profile.status !== 'ACTIVE' && profile.guideAccount?.email && profile.slug) {
    const name = profile.guideAccount.displayName
      || `${profile.guideAccount.firstName ?? ''} ${profile.guideAccount.lastName ?? ''}`.trim()
      || 'Guide';
    await sendGuideProfileActivated({
      to: profile.guideAccount.email,
      name,
      profileUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/guides/${profile.slug}`,
    }).catch(error => console.error('[guide activation email]', error));
  }

  return NextResponse.json({ success: true });
}
