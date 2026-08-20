import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { GUIDE_LANGUAGES } from '@/lib/languages';
import { requireGuide } from '@/lib/require-account';

const validCodes = GUIDE_LANGUAGES.map(l => l.code) as [string, ...string[]];

const addSchema = z.object({
  languageCode: z.enum(validCodes),
});

export async function POST(req: NextRequest) {
  const access = await requireGuide();
  if (!access.ok) return access.response;

  const raw = await req.json();
  const parsed = addSchema.safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: 'Code langue invalide' }, { status: 400 });

  const { languageCode } = parsed.data;

  const existing = await prisma.guideLanguage.findFirst({
    where: { guideProfileId: access.actor.guideProfileId, languageCode },
  });
  if (existing) return NextResponse.json({ language: existing }, { status: 200 });

  const lang = await prisma.guideLanguage.create({
    data: { guideProfileId: access.actor.guideProfileId, languageCode, level: 'NATIVE' },
    select: { id: true, languageCode: true, level: true },
  });

  return NextResponse.json({ language: lang }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const access = await requireGuide();
  if (!access.ok) return access.response;

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 });

  const lang = await prisma.guideLanguage.findFirst({
    where: { id, guideProfileId: access.actor.guideProfileId },
  });
  if (!lang) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  await prisma.guideLanguage.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
