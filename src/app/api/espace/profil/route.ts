import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';

export async function GET() {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const user = await prisma.user.findUnique({ where: { id: access.actor.id } });
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || access.actor.email,
    email: user.email || '—',
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phoneWhatsapp: user.phoneWhatsapp,
    createdAt: new Date(user.createdAt).toLocaleDateString('fr-FR'),
  });
}

export async function PATCH(req: NextRequest) {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const { firstName, lastName, country, phoneWhatsapp } = await req.json();

  const user = await prisma.user.update({
    where: { id: access.actor.id },
    data: {
      firstName: firstName ?? undefined,
      lastName:  lastName  ?? undefined,
      country:   country   ?? undefined,
      phoneWhatsapp: phoneWhatsapp ?? undefined,
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || access.actor.email,
    email: user.email || '—',
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phoneWhatsapp: user.phoneWhatsapp,
  });
}
