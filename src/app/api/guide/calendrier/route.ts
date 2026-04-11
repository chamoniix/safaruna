import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function getGuideProfile(session: any) {
  const email = session?.user?.email as string | undefined;
  if (!email) return null;
  const user = await prisma.user.findUnique({
    where: { email },
    include: { guideProfile: { select: { id: true } } },
  });
  return user?.guideProfile ?? null;
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guideProfile = await getGuideProfile(session);
  if (!guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in90days = new Date(today);
  in90days.setDate(in90days.getDate() + 90);

  const availabilities = await prisma.availability.findMany({
    where: {
      guideProfileId: guideProfile.id,
      date: { gte: today, lte: in90days },
    },
    orderBy: { date: 'asc' },
  });

  return NextResponse.json({
    availabilities: availabilities.map(a => ({
      id: a.id,
      date: a.date.toISOString().split('T')[0],
      status: a.status,
    })),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guideProfile = await getGuideProfile(session);
  if (!guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const body = await req.json();
  const { date, status } = body as { date: string; status: 'AVAILABLE' | 'UNAVAILABLE' };

  if (!date || !['AVAILABLE', 'UNAVAILABLE'].includes(status)) {
    return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 });
  }

  const dateObj = new Date(date);
  dateObj.setHours(12, 0, 0, 0);

  await prisma.availability.upsert({
    where: {
      guideProfileId_date: {
        guideProfileId: guideProfile.id,
        date: dateObj,
      },
    },
    update: { status },
    create: {
      guideProfileId: guideProfile.id,
      date: dateObj,
      status,
    },
  });

  return NextResponse.json({ success: true });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const guideProfile = await getGuideProfile(session);
  if (!guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const body = await req.json();
  const { date } = body as { date: string };

  if (!date) return NextResponse.json({ error: 'Date manquante' }, { status: 400 });

  const dateObj = new Date(date);
  dateObj.setHours(12, 0, 0, 0);

  await prisma.availability.deleteMany({
    where: {
      guideProfileId: guideProfile.id,
      date: dateObj,
    },
  });

  return NextResponse.json({ success: true });
}
