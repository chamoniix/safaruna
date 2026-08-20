import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { baseTemplate, escapeHtml, heading, p, sendEmail, sendWelcomeGuide } from '@/lib/email';
import { encrypt } from '@/lib/crypto';
import { z } from 'zod';
import { recordAnalyticsEvent } from '@/lib/analytics';
import { checkRateLimit, guideApplicationRatelimit } from '@/lib/ratelimit';
import { Prisma } from '@prisma/client';

const EMAIL_ALREADY_USED = 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.';
const EDUCATION_LABELS = {
  uni: 'Université Islamique (Madinah / Umm Al-Qura)',
  institut: 'Institut spécialisé',
  autodidacte: 'Autodidacte confirmé',
} as const;

const dateOfBirthSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de naissance invalide')
  .refine(value => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, 'Date de naissance invalide');

const inscriptionSchema = z.object({
  firstName:       z.string().min(1).max(50),
  lastName:        z.string().min(1).max(50),
  email:           z.string().email().max(254).transform(value => value.trim().toLowerCase()),
  whatsapp:        z.string().max(20).optional(),
  city:            z.string().max(100).optional(),
  gender:          z.enum(['HOMME', 'FEMME']),
  serviceCities:   z.array(z.enum(['MAKKAH', 'MADINAH'])).min(1).max(2),
  nationality:     z.string().max(100).optional(),
  dateOfBirth:     dateOfBirthSchema,
  bio:             z.string().max(2000).optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  education:       z.enum(['uni', 'institut', 'autodidacte']),
  languages:       z.array(z.string().max(10)).max(20).optional(),
  masteredPlaces:  z.array(z.string().min(1).max(120)).max(30),
  iban:            z.string().max(34).regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'IBAN invalide').optional().or(z.literal('')),
  acceptedCharte:  z.literal(true, { error: 'Vous devez accepter la charte islamique.' }),
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, guideApplicationRatelimit);
  if (limited) return limited;

  const raw = await req.json();
  const parsed = inscriptionSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  const { firstName, lastName, email, whatsapp, city, gender, serviceCities, nationality, dateOfBirth, bio, experienceYears, education, languages, masteredPlaces, iban } = parsed.data;
  const educationLabel = EDUCATION_LABELS[education];

  const [identity, existing, existingGuideAccount, existingApplication] = await Promise.all([
    prisma.emailIdentity.findUnique({ where: { email }, select: { kind: true } }),
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideApplication.findFirst({
      where: { email, status: { in: ['PENDING', 'IN_REVIEW', 'APPROVED'] } },
      select: { id: true },
    }),
  ]);
  if (identity || existing || existingGuideAccount || existingApplication) {
    return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 });
  }

  let application;
  try {
    application = await prisma.$transaction(async tx => {
      await tx.emailIdentity.create({ data: { email, kind: 'GUIDE_APPLICATION' } });
      return tx.guideApplication.create({
        data: {
          firstName,
          lastName,
          email,
          whatsapp: whatsapp || null,
          city: city || null,
          gender,
          serviceCities,
          nationality: nationality || null,
          dateOfBirth: new Date(`${dateOfBirth}T00:00:00.000Z`),
          bio: bio || null,
          experienceYears: experienceYears ?? null,
          education: educationLabel,
          languages: languages ?? [],
          masteredPlaces,
          ibanEncrypted: iban ? encrypt(iban) : null,
          acceptedCharteAt: new Date(),
          submittedIp: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip'),
          submittedCountry: req.headers.get('x-vercel-ip-country'),
          submittedDevice: req.headers.get('sec-ch-ua-mobile') === '?1' ? 'MOBILE' : 'DESKTOP',
          submittedUserAgent: req.headers.get('user-agent')?.slice(0, 500),
        },
        select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
      });
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 });
    }
    throw error;
  }

  // Accusé de réception candidat et notifications opérationnelles.
  const adminHtml = baseTemplate(`
    ${heading('Nouvelle candidature guide')}
    ${p(`<strong>${escapeHtml(firstName)} ${escapeHtml(lastName)}</strong> vient d’envoyer une candidature.`)}
    <table cellpadding="8" cellspacing="0" width="100%" style="font-size:13px;color:#4A3F30;">
      <tr><td><strong>Email</strong></td><td>${escapeHtml(email)}</td></tr>
      <tr><td><strong>WhatsApp</strong></td><td>${escapeHtml(whatsapp || '—')}</td></tr>
      <tr><td><strong>Ville</strong></td><td>${escapeHtml(city || '—')}</td></tr>
      <tr><td><strong>Genre</strong></td><td>${escapeHtml(gender)}</td></tr>
      <tr><td><strong>Villes servies</strong></td><td>${escapeHtml(serviceCities.join(', '))}</td></tr>
      <tr><td><strong>Nationalité</strong></td><td>${escapeHtml(nationality || '—')}</td></tr>
      <tr><td><strong>Date de naissance</strong></td><td>${escapeHtml(dateOfBirth)}</td></tr>
      <tr><td><strong>Formation</strong></td><td>${escapeHtml(educationLabel)}</td></tr>
      <tr><td><strong>Langues</strong></td><td>${escapeHtml((languages || []).join(', ') || '—')}</td></tr>
      <tr><td><strong>Lieux maîtrisés</strong></td><td>${escapeHtml(masteredPlaces.join(', ') || '—')}</td></tr>
      <tr><td><strong>Expérience</strong></td><td>${experienceYears ?? '—'} an(s)</td></tr>
      <tr><td><strong>Référence</strong></td><td>${escapeHtml(application.id)}</td></tr>
    </table>
    ${p('La candidature est disponible dans le dashboard SAFARUMA avec le statut « En attente ».')}
  `);
  const recipients = [
    { email: process.env.GUIDE_APPLICATION_ADMIN_EMAIL || 'admin@safaruma.com', name: 'Admin SAFARUMA' },
    { email: process.env.GUIDE_APPLICATION_SUPERADMIN_EMAIL || 'superadmin@safaruma.com', name: 'Superadmin SAFARUMA' },
  ];
  await Promise.allSettled([
    sendWelcomeGuide(email, `${firstName} ${lastName}`.trim()),
    ...recipients.map(to => sendEmail({
      to,
      replyTo: { email, name: `${firstName} ${lastName}`.trim() },
      subject: `Nouvelle candidature guide — ${firstName} ${lastName}`,
      html: adminHtml,
    })),
  ]);

  await recordAnalyticsEvent({
    eventName: 'guide_application_submitted',
    path: '/guide/inscription',
    metadata: { applicationId: application.id, city: city || null, gender, serviceCities: serviceCities.join(',') },
  });

  return NextResponse.json({ id: application.id, email: application.email, name: `${application.firstName} ${application.lastName}`.trim(), status: 'PENDING' }, { status: 201 });
}
