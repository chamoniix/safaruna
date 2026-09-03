'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';
import { recordAnalyticsEvent } from '@/lib/analytics';
import { Prisma } from '@prisma/client';
import { claimReferralForNewPelerin } from '@/lib/referral';
import { sendReferralPromoCode } from '@/lib/email';

type SignupState = { error: string };
type ResendState = { success: boolean; message: string };

const EMAIL_ALREADY_USED = 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.';

function safePelerinRedirect(value: string | null | undefined): string {
  if (!value || value.length > 2048 || !value.startsWith('/') || value.startsWith('//') || value.includes('\\')) {
    return '';
  }

  try {
    const url = new URL(value, 'https://safaruma.com');
    if (url.origin !== 'https://safaruma.com') return '';
    if (url.pathname !== '/avis/deposer' && !url.pathname.startsWith('/avis/guide/') && url.pathname !== '/espace' && !url.pathname.startsWith('/espace/')) return '';
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return '';
  }
}

function verificationUrl(token: string, redirectTo: string): string {
  const baseUrl = (process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com').replace(/\/$/, '');
  const params = new URLSearchParams({ token });
  if (redirectTo) params.set('redirect', redirectTo);
  return `${baseUrl}/verify-email?${params.toString()}`;
}

function verificationEmailHtml(url: string): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
      <h2 style="color: #1A1209;">Bienvenue sur SAFARUMA 🕋</h2>
      <p>Cliquez sur le bouton ci-dessous pour confirmer
         votre adresse email et accéder à votre espace.</p>
      <a href="${url}"
         style="display: inline-block; background: #C9A84C;
         color: #1A1209; padding: 0.85rem 2rem; border-radius: 50px;
         font-weight: 700; text-decoration: none; margin: 1.5rem 0;">
        Confirmer mon adresse email
      </a>
      <p style="color: #7A6D5A; font-size: 0.85rem;">
        Ce lien expire dans 24h. Si vous n'avez pas créé de compte,
        ignorez cet email.
      </p>
    </div>
  `;
}

export async function signup(_previousState: SignupState, formData: FormData): Promise<SignupState> {
  const email     = (formData.get('email')      as string)?.trim().toLowerCase();
  const password  = (formData.get('password')   as string);
  const confirmPassword = (formData.get('confirmPassword') as string);
  const firstName = (formData.get('first_name') as string)?.trim();
  const lastName  = (formData.get('last_name')  as string)?.trim();
  const whatsapp  = (formData.get('whatsapp')   as string)?.trim() || null;
  const refCode   = (formData.get('ref')        as string)?.trim() || null;
  const redirectTo = safePelerinRedirect((formData.get('redirect') as string)?.trim());
  // Reconstruit les query params à ajouter aux redirections de ce flow,
  // pour ne pas perdre le tunnel de réservation (checkout) en cours.
  const extra = redirectTo ? `&redirect=${encodeURIComponent(redirectTo)}` : '';

  if (!email || !firstName || !lastName || !password || password.length < 8 || password !== confirmPassword) {
    return { error: 'Vérifiez les informations saisies et la confirmation du mot de passe.' };
  }

  // Vérifier si l'email existe déjà
  await prisma.emailIdentity.deleteMany({ where: { email, quarantinedUntil: { lte: new Date() } } });
  const [identity, existing, existingGuideAccount, existingGuideApplication] = await Promise.all([
    prisma.emailIdentity.findUnique({ where: { email }, select: { kind: true } }),
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideApplication.findFirst({
      where: { email, status: { in: ['PENDING', 'IN_REVIEW', 'APPROVED'] } },
      select: { id: true },
    }),
  ]);
  if (identity || existing || existingGuideAccount || existingGuideApplication) {
    return { error: EMAIL_ALREADY_USED };
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, 12);
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

  const token = crypto.randomUUID();

  // Réserver l'adresse, créer l'utilisateur et son token dans une seule transaction.
  let createdRegistration;
  try {
    createdRegistration = await prisma.$transaction(async tx => {
      await tx.emailIdentity.create({ data: { email, kind: 'PELERIN' } });
      const user = await tx.user.create({
        data: {
          email,
          name: fullName,
          firstName,
          lastName,
          passwordHash,
          phoneWhatsapp: whatsapp,
          role: 'PELERIN',
        },
      });
      await tx.emailVerificationToken.create({
        data: {
          token,
          email,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
        },
      });
      const referralPromo = refCode
        ? await claimReferralForNewPelerin(tx, { referralCode: refCode, referredUserId: user.id })
        : null;
      if (referralPromo) {
        await tx.auditLog.create({
          data: {
            actor: email,
            actorRole: 'CLIENT',
            action: 'REFERRAL_REGISTERED',
            target: user.id,
            detail: JSON.stringify({ promoCode: referralPromo.promo.code, expiresAt: referralPromo.promo.expiresAt }),
          },
        });
      }
      return { user, referralPromo };
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return { error: EMAIL_ALREADY_USED };
    }
    throw error;
  }

  await recordAnalyticsEvent({
    eventName: 'account_created',
    userId: createdRegistration.user.id,
    path: '/inscription',
    metadata: { method: 'email', role: 'PELERIN' },
  });

  if (createdRegistration.referralPromo) {
    await sendReferralPromoCode({
      to: email,
      name: fullName,
      code: createdRegistration.referralPromo.promo.code,
      expiresAt: createdRegistration.referralPromo.promo.expiresAt,
      purpose: 'REFERRED_SIGNUP',
      referralId: createdRegistration.referralPromo.referralId,
    }).catch(error => console.error('[referral] signup promo email failed', error));
  }

  // Attendre l'envoi : en cas d'échec, la page de connexion permet le renvoi.
  let emailError = false;
  try {
    await sendEmail({
      category: 'PELERIN_EMAIL_VERIFICATION',
      to: { email, name: fullName },
      subject: 'Confirmez votre adresse email — SAFARUMA',
      html: verificationEmailHtml(verificationUrl(token, redirectTo)),
      throwOnError: true,
    });
  } catch {
    emailError = true;
  }

  const refExtra = refCode ? `&ref=${encodeURIComponent(refCode)}` : '';
  const emailExtra = emailError ? '&emailError=1' : '';

  // Rediriger vers connexion avec message de vérification
  redirect(`/connexion?registered=1&verify=1${refExtra}${emailExtra}${extra}`);
}

export async function resendVerificationEmail(formData: FormData): Promise<ResendState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const redirectTo = safePelerinRedirect((formData.get('redirect') as string)?.trim());

  if (!email) {
    return { success: false, message: 'Saisissez votre adresse email avant de demander un nouvel envoi.' };
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.emailVerified) {
    return {
      success: true,
      message: 'Si ce compte attend une vérification, un nouvel email vient d’être envoyé.',
    };
  }

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentTokens = await prisma.emailVerificationToken.count({
    where: { email, createdAt: { gte: oneHourAgo } },
  });
  if (recentTokens >= 3) {
    return { success: false, message: 'Trop de renvois. Réessayez dans une heure.' };
  }

  const token = crypto.randomUUID();
  await prisma.emailVerificationToken.create({
    data: {
      token,
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  try {
    await sendEmail({
      category: 'PELERIN_EMAIL_VERIFICATION',
      to: { email, name: user.name || email },
      subject: 'Confirmez votre adresse email — SAFARUMA',
      html: verificationEmailHtml(verificationUrl(token, redirectTo)),
      throwOnError: true,
    });
  } catch {
    await prisma.emailVerificationToken.delete({ where: { token } }).catch(() => {});
    return { success: false, message: 'L’email n’a pas pu être envoyé. Réessayez dans quelques instants.' };
  }

  return { success: true, message: 'Un nouvel email de vérification vient d’être envoyé.' };
}

export async function signout() {
  redirect('/connexion');
}
