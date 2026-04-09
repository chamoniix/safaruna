import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as any).email as string | undefined;
  if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || email,
    email: user.email || '—',
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phoneWhatsapp: user.phoneWhatsapp,
    createdAt: new Date(user.createdAt).toLocaleDateString('fr-FR'),
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as any).email as string | undefined;
  if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { firstName, lastName, country, phoneWhatsapp } = await req.json();

  const user = await prisma.user.update({
    where: { email },
    data: {
      firstName: firstName ?? undefined,
      lastName:  lastName  ?? undefined,
      country:   country   ?? undefined,
      phoneWhatsapp: phoneWhatsapp ?? undefined,
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || email,
    email: user.email || '—',
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phoneWhatsapp: user.phoneWhatsapp,
  });
}
