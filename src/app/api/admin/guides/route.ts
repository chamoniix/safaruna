import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/check-admin';
import prisma from '@/lib/prisma';

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
