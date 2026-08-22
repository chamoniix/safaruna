import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { z } from 'zod';
import { requireGuide } from '@/lib/require-account';

const profilPatchSchema = z.object({
  firstName:       z.string().min(1).max(50).optional(),
  lastName:        z.string().min(1).max(50).optional(),
  phoneWhatsapp:   z.string().max(20).optional(),
  country:         z.string().max(100).optional(),
  bio:             z.string().max(2000).optional(),
  city:            z.string().max(100).optional(),
  gender:          z.enum(['HOMME', 'FEMME']).optional(),
  servesMakkah:    z.boolean().optional(),
  servesMadinah:   z.boolean().optional(),
  acceptingBookings: z.boolean().optional(),
  nationality:     z.string().max(100).optional(),
  experienceYears: z.coerce.number().int().min(0).max(60).optional(),
});

export async function GET() {
  const access = await requireGuide();
  if (!access.ok) return access.response;

  const account = await prisma.guideAccount.findUnique({
    where: { id: access.actor.id },
    include: {
      guideProfile: {
        include: {
          languages: { select: { id: true, languageCode: true, level: true } },
        },
      },
    },
  });

  if (!account) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!account.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const gp = account.guideProfile;
  const displayName = account.displayName || `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() || account.email || '—';

  return NextResponse.json({
    profile: {
      id: account.id,
      name: displayName,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email || '—',
      phoneWhatsapp: account.phoneWhatsapp,
      country: account.country,
      slug: gp.slug,
      status: gp.status,
      bio: gp.bio,
      city: gp.city,
      gender: gp.gender,
      servesMakkah: gp.servesMakkah,
      servesMadinah: gp.servesMadinah,
      acceptingBookings: gp.acceptingBookings,
      makkahNetUpTo6Cents: gp.makkahNetUpTo6Cents,
      makkahNetUpTo15Cents: gp.makkahNetUpTo15Cents,
      makkahNetUpTo32Cents: gp.makkahNetUpTo32Cents,
      madinahNetUpTo6Cents: gp.madinahNetUpTo6Cents,
      madinahNetUpTo15Cents: gp.madinahNetUpTo15Cents,
      madinahNetUpTo32Cents: gp.madinahNetUpTo32Cents,
      nationality: gp.nationality,
      experienceYears: gp.experienceYears,
      languages: gp.languages,
      createdAt: new Date(account.registeredAt).toLocaleDateString('fr-FR'),
    },
  });
}

export async function PATCH(req: NextRequest) {
  const access = await requireGuide();
  if (!access.ok) return access.response;

  const account = await prisma.guideAccount.findUnique({
    where: { id: access.actor.id },
    include: { guideProfile: true },
  });

  if (!account) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!account.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const raw = await req.json();
  const parsed = profilPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { firstName, lastName, phoneWhatsapp, country, bio, city, gender, servesMakkah, servesMadinah, acceptingBookings, nationality, experienceYears } = parsed.data;

  await prisma.$transaction([
    prisma.guideAccount.update({
      where: { id: access.actor.id },
      data: {
        ...(firstName !== undefined && { firstName: firstName.trim() || null }),
        ...(lastName !== undefined && { lastName: lastName.trim() || null }),
        ...(phoneWhatsapp !== undefined && { phoneWhatsapp: phoneWhatsapp.trim() || null }),
        ...(country !== undefined && { country: country.trim() || null }),
        ...(firstName && lastName && { displayName: `${firstName.trim()} ${lastName.trim()}` }),
      },
    }),
    prisma.guideProfile.update({
      where: { id: account.guideProfile.id },
      data: {
        ...(bio !== undefined && { bio: bio.trim() || null }),
        ...(city !== undefined && { city: city.trim() || null }),
        ...(gender !== undefined && { gender }),
        ...(servesMakkah !== undefined && { servesMakkah }),
        ...(servesMadinah !== undefined && { servesMadinah }),
        ...(acceptingBookings !== undefined && { acceptingBookings }),
        ...(nationality !== undefined && { nationality: nationality.trim() || null }),
        ...(experienceYears !== undefined && { experienceYears: experienceYears || null }),
      },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
