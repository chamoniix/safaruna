import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin, getAdminActor } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendGuideAccess } from '@/lib/email';
import { randomBytes } from 'node:crypto';

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guides = await prisma.guideProfile.findMany({
    include: {
      user: { select: { id: true, name: true, email: true, createdAt: true } },
      languages: true,
      reservations: { select: { id: true } },
    },
    orderBy: { user: { createdAt: 'desc' } },
  });

  return NextResponse.json({
    guides: guides.map(g => ({
      id: g.id,
      name: g.user.name || '',
      email: g.user.email || '',
      city: g.city || '',
      langs: g.languages.map(l => l.languageCode.toUpperCase()).join(', '),
      reservations: g.reservations.length,
      joined: new Date(g.user.createdAt).toLocaleDateString('fr-FR'),
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

  const { firstName, lastName, email: rawEmail } = await req.json();
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  if (!firstName || !email) return NextResponse.json({ error: 'Prénom et email requis' }, { status: 400 });

  const [existing, existingGuideAccount] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (existing || existingGuideAccount) return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });

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

  const user = await prisma.$transaction(async tx => {
    const created = await tx.user.create({
      data: {
        email,
        name: `${firstName} ${lastName || ''}`.trim(),
        firstName,
        lastName: lastName || '',
        passwordHash,
        role: 'GUIDE',
        emailVerified: new Date(),
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
    const guideAccount = await tx.guideAccount.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        emailVerified: new Date(),
        displayName: `${firstName} ${lastName || ''}`.trim(),
        firstName,
        lastName: lastName || '',
        legacyUserId: created.id,
      },
    });
    await tx.guideProfile.update({ where: { id: created.guideProfile!.id }, data: { guideAccountId: guideAccount.id } });
    return created;
  });

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
      target: user.id,
      detail: JSON.stringify({ email, slug }),
    },
  });

  return NextResponse.json({ success: true, userId: user.id, slug }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { guideId, action } = await req.json();
  if (!guideId || !['activate', 'suspend'].includes(action)) {
    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  }
  const status = action === 'activate' ? 'ACTIVE' : 'SUSPENDED';

  const profile = await prisma.guideProfile.findUnique({ where: { id: guideId }, select: { guideAccountId: true } });
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
      },
    }),
  ]);

  return NextResponse.json({ success: true });
}
