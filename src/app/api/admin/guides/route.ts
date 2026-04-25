import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendGuideAccess } from '@/lib/email';

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
      status: g.status,
      slug: g.slug || '',
    })),
  });
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { firstName, lastName, email } = await req.json();
  if (!firstName || !email) return NextResponse.json({ error: 'Prénom et email requis' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });

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
  const password =
    Math.random().toString(36).slice(2, 10).toUpperCase() +
    Math.random().toString(36).slice(2, 6) + '!';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name: `${firstName} ${lastName || ''}`.trim(),
      firstName,
      lastName: lastName || '',
      passwordHash,
      role: 'GUIDE',
      emailVerified: new Date(),
      guideProfile: {
        create: { slug, status: 'REVIEW' },
      },
    },
    select: { id: true, email: true },
  });

  try {
    await sendGuideAccess({
      to: email,
      name: `${firstName} ${lastName || ''}`.trim(),
      email,
      password,
      loginUrl: 'https://safaruma.com/guide/connexion',
    });
  } catch (e) {
    console.error('[admin/guides POST] email error', e);
  }

  return NextResponse.json({ success: true, userId: user.id, slug, password }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { guideId, action } = await req.json();
  const status = action === 'activate' ? 'ACTIVE' : 'SUSPENDED';

  await prisma.guideProfile.update({
    where: { id: guideId },
    data: { status },
  });

  return NextResponse.json({ success: true });
}
