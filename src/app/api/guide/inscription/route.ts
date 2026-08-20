import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { baseTemplate, escapeHtml, heading, p, sendEmail, sendWelcomeGuide } from '@/lib/email';
import { encrypt } from '@/lib/crypto';
import { z } from 'zod';
import { recordAnalyticsEvent } from '@/lib/analytics';
import { checkRateLimit, guideApplicationRatelimit } from '@/lib/ratelimit';

const inscriptionSchema = z.object({
  firstName:       z.string().min(1).max(50),
  lastName:        z.string().min(1).max(50),
  email:           z.string().email().max(254).transform(value => value.trim().toLowerCase()),
  whatsapp:        z.string().max(20).optional(),
  city:            z.string().max(100).optional(),
  gender:          z.enum(['HOMME', 'FEMME']),
  serviceCities:   z.array(z.enum(['MAKKAH', 'MADINAH'])).min(1).max(2),
  nationality:     z.string().max(100).optional(),
  bio:             z.string().max(2000).optional(),
  experienceYears: z.number().int().min(0).max(60).optional(),
  languages:       z.array(z.string().max(10)).max(20).optional(),
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
  const { firstName, lastName, email, whatsapp, city, gender, serviceCities, nationality, bio, experienceYears, languages, iban } = parsed.data;

  const [existing, existingGuideAccount] = await Promise.all([
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email }, select: { id: true } }),
  ]);
  if (existing || existingGuideAccount) {
    return NextResponse.json({ error: 'Un compte existe déjà avec cet email.' }, { status: 409 });
  }

  const application = await prisma.guideApplication.create({
    data: {
      firstName,
      lastName,
      email,
      whatsapp: whatsapp || null,
      city: city || null,
      gender,
      serviceCities,
      nationality: nationality || null,
      bio: bio || null,
      experienceYears: experienceYears ?? null,
      languages: languages ?? [],
      ibanEncrypted: iban ? encrypt(iban) : null,
      acceptedCharteAt: new Date(),
      submittedIp: req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip'),
      submittedCountry: req.headers.get('x-vercel-ip-country'),
      submittedDevice: req.headers.get('sec-ch-ua-mobile') === '?1' ? 'MOBILE' : 'DESKTOP',
      submittedUserAgent: req.headers.get('user-agent')?.slice(0, 500),
    },
    select: { id: true, email: true, firstName: true, lastName: true, createdAt: true },
  });

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
      <tr><td><strong>Langues</strong></td><td>${escapeHtml((languages || []).join(', ') || '—')}</td></tr>
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
