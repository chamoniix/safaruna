import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { z } from 'zod';

const profilPatchSchema = z.object({
  firstName:       z.string().min(1).max(50).optional(),
  lastName:        z.string().min(1).max(50).optional(),
  phoneWhatsapp:   z.string().max(20).optional(),
  country:         z.string().max(100).optional(),
  bio:             z.string().max(2000).optional(),
  city:            z.string().max(100).optional(),
  nationality:     z.string().max(100).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId },
    include: {
      guideProfile: {
        include: {
          languages: { select: { id: true, languageCode: true, level: true } },
        },
      },
    },
  });

  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!user.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const gp = user.guideProfile;
  const displayName = user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '—';

  return NextResponse.json({
    profile: {
      id: user.id,
      name: displayName,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email || '—',
      phoneWhatsapp: user.phoneWhatsapp,
      country: user.country,
      slug: gp.slug,
      status: gp.status,
      bio: gp.bio,
      city: gp.city,
      nationality: gp.nationality,
      experienceYears: gp.experienceYears,
      languages: gp.languages,
      createdAt: new Date(user.createdAt).toLocaleDateString('fr-FR'),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId },
    include: { guideProfile: true },
  });

  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!user.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const raw = await req.json();
  const parsed = profilPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { firstName, lastName, phoneWhatsapp, country, bio, city, nationality, experienceYears } = parsed.data;

  await Promise.all([
    prisma.user.update({
      where: { id: user.id },
      data: {
        ...(firstName !== undefined && { firstName: firstName.trim() || null }),
        ...(lastName !== undefined && { lastName: lastName.trim() || null }),
        ...(phoneWhatsapp !== undefined && { phoneWhatsapp: phoneWhatsapp.trim() || null }),
        ...(country !== undefined && { country: country.trim() || null }),
        name: firstName && lastName ? `${firstName.trim()} ${lastName.trim()}` : user.name,
      },
    }),
    prisma.guideProfile.update({
      where: { id: user.guideProfile.id },
      data: {
        ...(bio !== undefined && { bio: bio.trim() || null }),
        ...(city !== undefined && { city: city.trim() || null }),
        ...(nationality !== undefined && { nationality: nationality.trim() || null }),
        ...(experienceYears !== undefined && { experienceYears: experienceYears || null }),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
