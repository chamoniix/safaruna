import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as { email?: string }).email;
  if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email }, select: { newsletterOptIn: true } });
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  return NextResponse.json({ newsletterOptIn: user.newsletterOptIn });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as { email?: string }).email;
  if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const body = await req.json() as { newsletterOptIn?: boolean };
  if (typeof body.newsletterOptIn !== 'boolean') {
    return NextResponse.json({ error: 'newsletterOptIn doit être un boolean' }, { status: 400 });
  }

  const user = await prisma.user.update({
    where: { email },
    data: { newsletterOptIn: body.newsletterOptIn },
    select: { newsletterOptIn: true },
  });

  return NextResponse.json({ newsletterOptIn: user.newsletterOptIn });
}
