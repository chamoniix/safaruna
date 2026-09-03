import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { baseTemplate, escapeHtml, heading, p, sendEmail, sendWelcomeGuide } from '@/lib/email';
import { encrypt } from '@/lib/crypto';
import { z } from 'zod';
import { recordAnalyticsEvent } from '@/lib/analytics';
import { checkRateLimit, guideApplicationRatelimit } from '@/lib/ratelimit';
import { Prisma } from '@prisma/client';
import { PLACES } from '@/lib/places';
import { GUIDE_LANGUAGES, LANG_CODE_TO_LABEL } from '@/lib/languages';

const EMAIL_ALREADY_USED = 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.';
const EDUCATION_LABELS = {
  uni: 'Université Islamique (Madinah / Umm Al-Qura)',
  institut: 'Institut spécialisé',
  autodidacte: 'Autodidacte confirmé',
} as const;
const PLACE_KEYS = new Set(PLACES.map(place => place.key));
const LANGUAGE_CODES = new Set<string>(GUIDE_LANGUAGES.map(language => language.code));
const FIELD_STEPS: Record<string, number> = {
  firstName: 1, lastName: 1, email: 1, whatsapp: 1,
  dateOfBirth: 2, gender: 2, city: 2, serviceCities: 2, nationality: 2,
  experienceYears: 2, education: 2, languages: 2, bio: 2,
  masteredPlaces: 3, transportMode: 3, transportDetails: 3,
  proposedOmraPrice: 4, proposedMadinahPackagePrice: 4, proposedMadinahPlacePrice: 4,
  proposedMakkahPackagePrice: 4, proposedMakkahPlacePrice: 4, pricingDetails: 4,
  bankAccountFirstName: 4, bankAccountLastName: 4, bankName: 4, bankCountry: 4, iban: 4, bic: 4,
  acceptedCharte: 5,
};

const priceSchema = z.number({ error: 'Indiquez un tarif valide.' })
  .finite('Indiquez un tarif valide.')
  .min(0, 'Le tarif ne peut pas être négatif.');

const dateOfBirthSchema = z.string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date de naissance invalide')
  .refine(value => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(value);
  }, 'Date de naissance invalide');

const inscriptionSchema = z.object({
  firstName:       z.string().trim().min(1, 'Indiquez votre prénom.').max(50),
  lastName:        z.string().trim().min(1, 'Indiquez votre nom.').max(50),
  email:           z.string().email().max(254).transform(value => value.trim().toLowerCase()),
  whatsapp:        z.string().trim().min(1, 'Indiquez votre numéro WhatsApp.').max(20),
  city:            z.enum(['MAKKAH', 'MADINAH'], { error: 'Choisissez votre ville principale.' }),
  gender:          z.enum(['HOMME', 'FEMME'], { error: 'Choisissez le genre du guide.' }),
  serviceCities:   z.array(z.enum(['MAKKAH', 'MADINAH'])).min(1).max(2),
  nationality:     z.string().max(100).optional(),
  dateOfBirth:     dateOfBirthSchema,
  bio:             z.string().trim().min(1, 'Présentez brièvement votre expérience et votre approche.').max(2000),
  experienceYears: z.number({ error: 'Indiquez vos années d’expérience.' }).int().min(0).max(60),
  education:       z.enum(['uni', 'institut', 'autodidacte'], { error: 'Choisissez votre formation.' }),
  languages:       z.array(z.string().max(40)).min(1, 'Choisissez au moins une langue.').max(20)
    .refine(values => new Set(values).size === values.length, 'Une langue a été sélectionnée plusieurs fois.')
    .refine(values => values.every(value => LANGUAGE_CODES.has(value)), 'Une langue sélectionnée est invalide.'),
  masteredPlaces:  z.array(z.string().min(1).max(120)).max(30)
    .refine(values => values.every(value => PLACE_KEYS.has(value)), 'Un lieu sélectionné est invalide.'),
  transportMode:   z.enum(['NONE', 'CAR', 'VAN', 'OTHER'], { error: 'Choisissez un mode de transport.' }),
  transportDetails: z.string().trim().max(1000).optional(),
  proposedOmraPrice: priceSchema,
  proposedMadinahPackagePrice: priceSchema,
  proposedMadinahPlacePrice: priceSchema,
  proposedMakkahPackagePrice: priceSchema,
  proposedMakkahPlacePrice: priceSchema,
  pricingDetails: z.string().trim().max(1500).optional(),
  bankAccountFirstName: z.string().trim().min(1, 'Indiquez le prénom du titulaire.').max(80),
  bankAccountLastName: z.string().trim().min(1, 'Indiquez le nom du titulaire.').max(80),
  bankName: z.string().trim().min(1, 'Indiquez le nom de la banque.').max(120),
  bankCountry: z.string().trim().min(1, 'Indiquez le pays de la banque.').max(100),
  iban: z.string().transform(value => value.replace(/\s+/g, '').toUpperCase())
    .pipe(z.string().min(15, 'IBAN invalide.').max(34, 'IBAN invalide.').regex(/^[A-Z]{2}\d{2}[A-Z0-9]+$/, 'IBAN invalide.')),
  bic: z.string().transform(value => value.replace(/\s+/g, '').toUpperCase())
    .pipe(z.string().regex(/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/, 'SWIFT / BIC invalide.')),
  acceptedCharte:  z.literal(true, { error: 'Vous devez accepter la charte islamique.' }),
}).superRefine((value, context) => {
  if (!value.serviceCities.includes(value.city)) {
    context.addIssue({ code: 'custom', path: ['serviceCities'], message: 'La ville principale doit faire partie des villes proposées.' });
  }
  if (value.transportMode === 'OTHER' && !value.transportDetails) {
    context.addIssue({ code: 'custom', path: ['transportDetails'], message: 'Décrivez le transport que vous proposez.' });
  }
  if (value.serviceCities.includes('MAKKAH')) {
    if (value.proposedOmraPrice <= 0) context.addIssue({ code: 'custom', path: ['proposedOmraPrice'], message: 'Indiquez votre tarif pour l’accompagnement Omra.' });
    if (value.proposedMakkahPackagePrice <= 0) context.addIssue({ code: 'custom', path: ['proposedMakkahPackagePrice'], message: 'Indiquez votre tarif pour le pack Makkah.' });
    if (value.proposedMakkahPlacePrice <= 0) context.addIssue({ code: 'custom', path: ['proposedMakkahPlacePrice'], message: 'Indiquez votre tarif pour une visite à Makkah.' });
  }
  if (value.serviceCities.includes('MADINAH')) {
    if (value.proposedMadinahPackagePrice <= 0) context.addIssue({ code: 'custom', path: ['proposedMadinahPackagePrice'], message: 'Indiquez votre tarif pour le pack Médine.' });
    if (value.proposedMadinahPlacePrice <= 0) context.addIssue({ code: 'custom', path: ['proposedMadinahPlacePrice'], message: 'Indiquez votre tarif pour une visite à Médine.' });
  }
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, guideApplicationRatelimit);
  if (limited) return limited;

  const raw = await req.json();
  const parsed = inscriptionSchema.safeParse(raw);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = typeof issue?.path[0] === 'string' ? issue.path[0] : null;
    return NextResponse.json({
      error: issue?.message ?? 'Données invalides',
      field,
      step: field ? FIELD_STEPS[field] ?? null : null,
    }, { status: 400 });
  }
  const {
    firstName, lastName, email, whatsapp, city, gender, serviceCities, nationality, dateOfBirth,
    bio, experienceYears, education, languages, masteredPlaces, transportMode, transportDetails,
    proposedOmraPrice, proposedMadinahPackagePrice, proposedMadinahPlacePrice,
    proposedMakkahPackagePrice, proposedMakkahPlacePrice, pricingDetails,
    bankAccountFirstName, bankAccountLastName, bankName, bankCountry, iban, bic,
  } = parsed.data;
  const educationLabel = EDUCATION_LABELS[education];

  await prisma.emailIdentity.deleteMany({ where: { email, quarantinedUntil: { lte: new Date() } } });
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
          whatsapp,
          city,
          gender,
          serviceCities,
          nationality: nationality || null,
          dateOfBirth: new Date(`${dateOfBirth}T00:00:00.000Z`),
          bio: bio || null,
          experienceYears: experienceYears ?? null,
          education: educationLabel,
          languages,
          masteredPlaces,
          transportMode,
          transportDetails: transportDetails || null,
          proposedOmraPriceCents: Math.round(proposedOmraPrice * 100),
          proposedMadinahPackagePriceCents: Math.round(proposedMadinahPackagePrice * 100),
          proposedMadinahPlacePriceCents: Math.round(proposedMadinahPlacePrice * 100),
          proposedMakkahPackagePriceCents: Math.round(proposedMakkahPackagePrice * 100),
          proposedMakkahPlacePriceCents: Math.round(proposedMakkahPlacePrice * 100),
          pricingDetails: pricingDetails || null,
          bankAccountFirstName,
          bankAccountLastName,
          bankName,
          bankCountry,
          ibanEncrypted: encrypt(iban),
          bicEncrypted: encrypt(bic),
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
      <tr><td><strong>WhatsApp</strong></td><td>${escapeHtml(whatsapp)}</td></tr>
      <tr><td><strong>Ville principale</strong></td><td>${escapeHtml(city)}</td></tr>
      <tr><td><strong>Genre</strong></td><td>${escapeHtml(gender)}</td></tr>
      <tr><td><strong>Villes servies</strong></td><td>${escapeHtml(serviceCities.join(', '))}</td></tr>
      <tr><td><strong>Nationalité</strong></td><td>${escapeHtml(nationality || '—')}</td></tr>
      <tr><td><strong>Date de naissance</strong></td><td>${escapeHtml(dateOfBirth)}</td></tr>
      <tr><td><strong>Formation</strong></td><td>${escapeHtml(educationLabel)}</td></tr>
      <tr><td><strong>Langues</strong></td><td>${escapeHtml(languages.map(code => LANG_CODE_TO_LABEL[code] || code).join(', '))}</td></tr>
      <tr><td><strong>Lieux maîtrisés</strong></td><td>${escapeHtml(masteredPlaces.map(key => PLACES.find(place => place.key === key)?.nameFr || key).join(', ') || '—')}</td></tr>
      <tr><td><strong>Transport</strong></td><td>${escapeHtml(transportMode)}${transportDetails ? ` — ${escapeHtml(transportDetails)}` : ''}</td></tr>
      <tr><td><strong>Tarif Omra</strong></td><td>${proposedOmraPrice.toFixed(2)} €</td></tr>
      <tr><td><strong>Pack Makkah</strong></td><td>${proposedMakkahPackagePrice.toFixed(2)} €</td></tr>
      <tr><td><strong>Une visite Makkah</strong></td><td>${proposedMakkahPlacePrice.toFixed(2)} €</td></tr>
      <tr><td><strong>Pack Médine</strong></td><td>${proposedMadinahPackagePrice.toFixed(2)} €</td></tr>
      <tr><td><strong>Une visite Médine</strong></td><td>${proposedMadinahPlacePrice.toFixed(2)} €</td></tr>
      <tr><td><strong>Banque</strong></td><td>${escapeHtml(bankName)} · ${escapeHtml(bankCountry)} · coordonnées chiffrées</td></tr>
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
      category: 'GUIDE_APPLICATION_ADMIN_NOTICE',
      retryable: true,
      reference: { type: 'GUIDE_APPLICATION', id: application.id },
      to,
      replyTo: { email, name: `${firstName} ${lastName}`.trim() },
      subject: `Nouvelle candidature guide — ${firstName} ${lastName}`,
      html: adminHtml,
    })),
  ]);

  await recordAnalyticsEvent({
    eventName: 'guide_application_submitted',
    path: '/guide/inscription',
    metadata: { applicationId: application.id, city, gender, serviceCities: serviceCities.join(','), transportMode },
  });

  return NextResponse.json({ id: application.id, email: application.email, name: `${application.firstName} ${application.lastName}`.trim(), status: 'PENDING' }, { status: 201 });
}
