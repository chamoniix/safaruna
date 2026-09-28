import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';

const ALLOWED_LANGUAGES = ['fr', 'en', 'ar'];
const ALLOWED_TIMEZONES = ['Europe/Paris', 'Africa/Casablanca', 'Asia/Riyadh', 'America/Montreal'];

export async function GET() {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const user = await prisma.user.findUnique({ where: { id: access.actor.id } });
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  return NextResponse.json({
    id: user.id,
    name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || access.actor.email,
    email: user.email || '—',
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phoneWhatsapp: user.phoneWhatsapp,
    createdAt: new Date(user.createdAt).toLocaleDateString('fr-FR'),
    hasPassword: Boolean(user.passwordHash),
    notifConfirmOptIn: user.notifConfirmOptIn,
    notifRappelOptIn: user.notifRappelOptIn,
    notifMessagesOptIn: user.notifMessagesOptIn,
    notifPromoOptIn: user.notifPromoOptIn,
    language: user.language,
    timezone: user.timezone,
    accessibilityPmr: user.accessibilityPmr,
  });
}

export async function PATCH(req: NextRequest) {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const {
    firstName, lastName, country, phoneWhatsapp,
    notifConfirmOptIn, notifRappelOptIn, notifMessagesOptIn, notifPromoOptIn,
    language, timezone, accessibilityPmr,
  } = await req.json();

  const user = await prisma.user.update({
    where: { id: access.actor.id },
    data: {
      firstName: firstName ?? undefined,
      lastName:  lastName  ?? undefined,
      country:   country   ?? undefined,
      phoneWhatsapp: phoneWhatsapp ?? undefined,
      notifConfirmOptIn: typeof notifConfirmOptIn === 'boolean' ? notifConfirmOptIn : undefined,
      notifRappelOptIn: typeof notifRappelOptIn === 'boolean' ? notifRappelOptIn : undefined,
      notifMessagesOptIn: typeof notifMessagesOptIn === 'boolean' ? notifMessagesOptIn : undefined,
      notifPromoOptIn: typeof notifPromoOptIn === 'boolean' ? notifPromoOptIn : undefined,
      language: ALLOWED_LANGUAGES.includes(language) ? language : undefined,
      timezone: ALLOWED_TIMEZONES.includes(timezone) ? timezone : undefined,
      accessibilityPmr: typeof accessibilityPmr === 'boolean' ? accessibilityPmr : undefined,
    },
  });

  return NextResponse.json({
    id: user.id,
    name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || access.actor.email,
    email: user.email || '—',
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phoneWhatsapp: user.phoneWhatsapp,
    notifConfirmOptIn: user.notifConfirmOptIn,
    notifRappelOptIn: user.notifRappelOptIn,
    notifMessagesOptIn: user.notifMessagesOptIn,
    notifPromoOptIn: user.notifPromoOptIn,
    language: user.language,
    timezone: user.timezone,
    accessibilityPmr: user.accessibilityPmr,
  });
}
