import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { GUIDE_LANGUAGES } from '@/lib/languages';

const validCodes = GUIDE_LANGUAGES.map(l => l.code) as [string, ...string[]];

const addSchema = z.object({
  languageCode: z.enum(validCodes),
});

async function getGuideProfile(session: ReturnType<typeof getServerSession> extends Promise<infer T> ? T : never) {
  const user_session = session as { user?: { email?: string; id?: string } } | null;
  const email = user_session?.user?.email;
  const userId = user_session?.user?.id;
  if (!email && !userId) return null;
  const user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId as string },
    include: { guideProfile: true },
  });
  return user?.guideProfile ?? null;
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const gp = await getGuideProfile(session);
  if (!gp) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const raw = await req.json();
  const parsed = addSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Code langue invalide' }, { status: 400 });

  const { languageCode } = parsed.data;

  const existing = await prisma.guideLanguage.findFirst({
    where: { guideProfileId: gp.id, languageCode },
  });
  if (existing) return NextResponse.json({ language: existing }, { status: 200 });

  const lang = await prisma.guideLanguage.create({
    data: { guideProfileId: gp.id, languageCode, level: 'NATIVE' },
    select: { id: true, languageCode: true, level: true },
  });

  return NextResponse.json({ language: lang }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const gp = await getGuideProfile(session);
  if (!gp) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const lang = await prisma.guideLanguage.findFirst({
    where: { id, guideProfileId: gp.id },
  });
  if (!lang) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  await prisma.guideLanguage.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
