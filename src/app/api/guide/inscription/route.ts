import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomeGuide } from '@/lib/email';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { firstName, lastName, email, whatsapp, city, nationality, bio, experienceYears, languages, iban, acceptedCharte } = body;

  if (!acceptedCharte) {
    return NextResponse.json({ error: 'Vous devez accepter la charte islamique.' }, { status: 400 });
  }
  if (!firstName || !lastName || !email) {
    return NextResponse.json({ error: 'Prénom, nom et email sont obligatoires.' }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  // Generate slug from firstName + lastName
  const base = `${firstName} ${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  let slug = base;
  let attempt = 1;
  while (true) {
    const conflict = await prisma.guideProfile.findUnique({ where: { slug } });
    if (!conflict) break;
    attempt++;
    slug = `${base}-${attempt}`;
  }

  const passwordHash = await bcrypt.hash(crypto.randomUUID(), 10);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phoneWhatsapp: whatsapp ?? undefined,
      country: nationality ?? undefined,
      role: 'GUIDE',
      passwordHash,
      guideProfile: {
        create: {
          slug,
          bio: bio ?? undefined,
          city: city ?? undefined,
          nationality: nationality ?? undefined,
          experienceYears: experienceYears ? Number(experienceYears) : undefined,
          ibanEncrypted: iban ?? undefined,
          status: 'REVIEW',
          languages: {
            create: Array.isArray(languages) && languages.length > 0
              ? languages.map((lang: string) => ({ languageCode: lang, level: 'NATIVE' }))
              : [],
          },
        },
      },
    },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  // Envoyer email de bienvenue guide (fire-and-forget)
  sendWelcomeGuide(email, `${firstName} ${lastName}`.trim()).catch(() => {});

  return NextResponse.json({ id: user.id, email: user.email, name: `${user.firstName} ${user.lastName}`.trim() }, { status: 201 });
}
