import { NextRequest, NextResponse } from 'next/server';
import { adminAuditDetail, adminAuditFields, checkAdmin, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendGuideAccess } from '@/lib/email';
import { randomBytes } from 'node:crypto';
import { Prisma } from '@prisma/client';

const EMAIL_ALREADY_USED = 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.';

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guides = await prisma.guideProfile.findMany({
    include: {
      guideAccount: { select: { id: true, displayName: true, email: true, registeredAt: true } },
      languages: true,
      reservations: { select: { id: true } },
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

  // Generate temp password
  const password = `${randomBytes(12).toString('base64url')}Aa1!`;
  const passwordHash = await bcrypt.hash(password, 12);

  let guideAccount;
  try {
    guideAccount = await prisma.$transaction(async tx => {
      await tx.emailIdentity.create({ data: { email, kind: 'GUIDE' } });
      return tx.guideAccount.create({
        data: {
          email,
          passwordHash,
          emailVerified: new Date(),
          displayName: `${firstName} ${lastName || ''}`.trim(),
          firstName,
          lastName: lastName || '',
          guideProfile: {
            create: {
              slug,
              status: 'REVIEW',
              createdByType: actor.role,
              createdByAdminId: actor.id,
              createdByEmail: actor.email,
            },
          },
        },
        include: { guideProfile: { select: { id: true } } },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 });
    }
    throw error;
  }

  try {
    await sendGuideAccess({
      to: email,
      name: `${firstName} ${lastName || ''}`.trim(),
      email,
      password,
      loginUrl: 'https://safaruma.com/guide/connexion',
      profileActive: false,
    });
  } catch (e) {
    console.error('[admin/guides POST] email error', e);
  }

  await prisma.auditLog.create({
    data: {
      actor: actor.email,
      actorRole: actor.role,
      actorAdminId: actor.id,
      action: 'GUIDE_CREATED_BY_ADMIN',
      target: guideAccount.id,
      detail: adminAuditDetail(auditContext, { email, slug, guideAccountId: guideAccount.id, guideProfileId: guideAccount.guideProfile?.id }),
      after: { email, slug, status: 'REVIEW', createdByType: actor.role, createdByEmail: actor.email },
      ...adminAuditFields(auditContext),
    },
  });

  return NextResponse.json({ success: true, guideAccountId: guideAccount.id, guideProfileId: guideAccount.guideProfile?.id, slug }, { status: 201 });
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

  const profile = await prisma.guideProfile.findUnique({ where: { id: guideId }, select: { guideAccountId: true, status: true } });
  if (!profile) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });
  await prisma.$transaction([
    prisma.guideProfile.update({ where: { id: guideId }, data: { status } }),
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

  return NextResponse.json({ success: true });
}
