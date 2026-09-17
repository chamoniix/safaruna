import { createHash, randomUUID } from 'node:crypto';
import { Prisma } from '@prisma/client';
import { decrypt, encrypt } from '@/lib/crypto';
import prisma from '@/lib/prisma';

// Brevo Transactional Email — HTTP API (no external dependency)

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';
const EMAIL_PROVIDER = 'BREVO' as const;

export type EmailCategory =
  | 'ADMIN_LOGIN_ALERT'
  | 'ADMIN_PASSWORD_CHANGED'
  | 'ADMIN_PASSWORD_RESET'
  | 'CONTACT_REQUEST'
  | 'DEPARTURE_REMINDER_GUIDE'
  | 'DEPARTURE_REMINDER_PELERIN'
  | 'GUIDE_ACCESS_INVITATION'
  | 'GUIDE_APPLICATION_ADMIN_NOTICE'
  | 'GUIDE_APPLICATION_RECEIVED'
  | 'GUIDE_EMAIL_CHANGED'
  | 'GUIDE_EMAIL_CHANGE_CODE'
  | 'GUIDE_CONFIRMATION_ESCALATION'
  | 'GUIDE_CONFIRMATION_REMINDER'
  | 'GUIDE_MESSAGE_NOTIFICATION'
  | 'GUIDE_PASSWORD_CHANGED'
  | 'GUIDE_PASSWORD_RESET'
  | 'GUIDE_PLACE_SUGGESTION'
  | 'GUIDE_PROFILE_ACTIVATED'
  | 'GUIDE_PROFILE_REVIEW_SUBMITTED'
  | 'GUIDE_DOSSIER_RECEIVED'
  | 'GUIDE_DOSSIER_CORRECTION_DECIDED'
  | 'GUIDE_DOSSIER_RETURNED'
  | 'GUIDE_RESERVATION_INCIDENT'
  | 'GUIDE_RESERVATION_CONFIRMED'
  | 'GUIDE_TRANSFER_CONFIRMED'
  | 'PELERIN_EMAIL_VERIFICATION'
  | 'PELERIN_EMAIL_VERIFIED'
  | 'PELERIN_MESSAGE_NOTIFICATION'
  | 'PELERIN_PASSWORD_CHANGED'
  | 'PELERIN_PASSWORD_RESET'
  | 'PELERIN_WELCOME'
  | 'REFERRAL_PROMO_CODE'
  | 'RESERVATION_CONFIRMATION_ADMIN'
  | 'RESERVATION_CONFIRMATION_GUIDE'
  | 'RESERVATION_CONFIRMATION_PELERIN'
  | 'RESERVATION_GUIDE_TRANSFER'
  | 'REVIEW_REQUEST'
  | 'REVIEW_SUBMITTED_ADMIN';

export type EmailSendResult = {
  provider: typeof EMAIL_PROVIDER;
  deliveryId: string | null;
  messageId: string | null;
  status: 'ACCEPTED' | 'FAILED' | 'RETRY_PENDING' | 'IN_PROGRESS';
};

type EmailRecipient = { email: string; name?: string };

interface EmailPayload {
  to: EmailRecipient;
  subject: string;
  html: string;
  category: EmailCategory;
  replyTo?: EmailRecipient;
  throwOnError?: boolean;
  retryable?: boolean;
  idempotencyKey?: string;
  reference?: { type: string; id: string };
}

type StoredEmailPayload = Pick<EmailPayload, 'to' | 'subject' | 'html' | 'category' | 'replyTo' | 'reference'> & {
  providerIdempotencyKey: string;
};

class EmailProviderError extends Error {
  constructor(message: string, readonly retryable: boolean, readonly statusCode?: number) {
    super(message);
  }
}

function errorMessage(error: unknown): string {
  return (error instanceof Error ? error.message : 'Erreur fournisseur inconnue').slice(0, 500);
}

function retryAt(attempts: number): Date {
  const delays = [15 * 60_000, 6 * 60 * 60_000, 24 * 60 * 60_000];
  return new Date(Date.now() + delays[Math.min(delays.length - 1, Math.max(0, attempts - 1))]);
}

function providerIdempotencyKey(idempotencyKey: string): string {
  const hash = createHash('sha256').update(idempotencyKey).digest('hex');
  return `${hash.slice(0, 8)}-${hash.slice(8, 12)}-5${hash.slice(13, 16)}-a${hash.slice(17, 20)}-${hash.slice(20, 32)}`;
}

async function sendViaBrevo(payload: StoredEmailPayload): Promise<string> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) throw new EmailProviderError('BREVO_API_KEY not set', false);

  const response = await fetch(BREVO_URL, {
    method: 'POST',
    headers: {
      'api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...(payload.category === 'GUIDE_TRANSFER_CONFIRMED' && { signal: AbortSignal.timeout(10000) }),
    body: JSON.stringify({
      sender: {
        name: process.env.SMTP_FROM_NAME ?? 'SAFARUMA',
        email: process.env.SMTP_FROM ?? 'noreply@safaruma.com',
      },
      to: [{ email: payload.to.email, name: payload.to.name ?? payload.to.email }],
      ...(payload.replyTo && { replyTo: { email: payload.replyTo.email, name: payload.replyTo.name ?? payload.replyTo.email } }),
      subject: payload.subject,
      htmlContent: payload.html,
      tags: ['safaruma', payload.category.toLowerCase()],
      headers: { 'Idempotency-Key': payload.providerIdempotencyKey },
    }),
  });

  if (!response.ok) {
    await response.text().catch(() => '');
    throw new EmailProviderError(`Brevo error ${response.status}`, response.status === 429 || response.status >= 500, response.status);
  }

  const body = await response.json() as { messageId?: string };
  if (!body.messageId) throw new EmailProviderError('Brevo response missing messageId', true);
  return body.messageId;
}

async function createDelivery(payload: EmailPayload, storedPayload: StoredEmailPayload, idempotencyKey: string) {
  try {
    return await prisma.emailDelivery.create({
      data: {
        idempotencyKey,
        provider: EMAIL_PROVIDER,
        category: payload.category,
        recipientEmail: payload.to.email.toLowerCase(),
        referenceType: payload.reference?.type,
        referenceId: payload.reference?.id,
        maxAttempts: payload.retryable ? 3 : 1,
        payloadEncrypted: payload.retryable ? encrypt(JSON.stringify(storedPayload)) : null,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return prisma.emailDelivery.findUnique({ where: { idempotencyKey } });
    }
    console.error('[email-ledger] create failed', error);
    return null;
  }
}

export async function sendEmail(payload: EmailPayload): Promise<EmailSendResult> {
  const { throwOnError = false, retryable = false } = payload;
  const idempotencyKey = payload.idempotencyKey || randomUUID();
  const storedPayload: StoredEmailPayload = {
    to: payload.to,
    subject: payload.subject,
    html: payload.html,
    category: payload.category,
    replyTo: payload.replyTo,
    reference: payload.reference,
    providerIdempotencyKey: providerIdempotencyKey(idempotencyKey),
  };
  const delivery = await createDelivery(payload, storedPayload, idempotencyKey);

  if (delivery && delivery.status !== 'QUEUED') {
    return {
      provider: EMAIL_PROVIDER,
      deliveryId: delivery.id,
      messageId: delivery.providerMessageId,
      status: delivery.status === 'RETRY_PENDING'
        ? 'RETRY_PENDING'
        : delivery.status === 'FAILED'
          ? 'FAILED'
          : ['SENDING'].includes(delivery.status)
            ? 'IN_PROGRESS'
            : 'ACCEPTED',
    };
  }

  if (delivery) {
    const claimed = await prisma.emailDelivery.updateMany({
      where: { id: delivery.id, status: 'QUEUED' },
      data: { status: 'SENDING' },
    }).catch(error => {
      console.error('[email-ledger] initial claim failed', error);
      return null;
    });
    if (claimed && claimed.count !== 1) {
      const current = await prisma.emailDelivery.findUnique({ where: { id: delivery.id } });
      return {
        provider: EMAIL_PROVIDER,
        deliveryId: delivery.id,
        messageId: current?.providerMessageId ?? null,
        status: current?.status === 'RETRY_PENDING' ? 'RETRY_PENDING' : current?.status === 'FAILED' ? 'FAILED' : 'IN_PROGRESS',
      };
    }
  }

  try {
    const messageId = await sendViaBrevo(storedPayload);
    if (delivery) {
      await prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: {
          providerMessageId: messageId,
          status: 'ACCEPTED',
          attempts: { increment: 1 },
          acceptedAt: new Date(),
          payloadEncrypted: null,
          nextAttemptAt: null,
          lastError: null,
        },
      }).catch(error => console.error('[email-ledger] accept update failed', error));
    }
    return { provider: EMAIL_PROVIDER, deliveryId: delivery?.id ?? null, messageId, status: 'ACCEPTED' };
  } catch (error) {
    const canRetry = retryable && (!(error instanceof EmailProviderError) || error.retryable);
    const status = canRetry ? 'RETRY_PENDING' : 'FAILED';
    console.error('[email] send failed', error);
    if (delivery) {
      await prisma.emailDelivery.update({
        where: { id: delivery.id },
        data: {
          status,
          attempts: { increment: 1 },
          nextAttemptAt: canRetry ? retryAt(1) : null,
          payloadEncrypted: canRetry ? delivery.payloadEncrypted : null,
          lastError: errorMessage(error),
        },
      }).catch(ledgerError => console.error('[email-ledger] failure update failed', ledgerError));
    }
    if (throwOnError) throw error;
    return { provider: EMAIL_PROVIDER, deliveryId: delivery?.id ?? null, messageId: null, status };
  }
}

export async function retryPendingEmails(limit = 20, deliveryIds?: string[]) {
  const now = new Date();
  const staleSendingBefore = new Date(now.getTime() - 15 * 60_000);
  const candidates = await prisma.emailDelivery.findMany({
    where: {
      ...(deliveryIds && { id: { in: deliveryIds } }),
      payloadEncrypted: { not: null },
      AND: [{ OR: [
        { attempts: { lt: 3 } },
        { category: 'GUIDE_TRANSFER_CONFIRMED', status: 'SENDING' },
      ] }],
      OR: [
        { status: 'QUEUED', category: { in: [...GUIDE_DOSSIER_EMAIL_CATEGORIES, 'GUIDE_TRANSFER_CONFIRMED'] }, nextAttemptAt: { lte: now } },
        { status: 'RETRY_PENDING', nextAttemptAt: { lte: now } },
        { status: 'SENDING', updatedAt: { lte: staleSendingBefore } },
      ],
    },
    orderBy: { nextAttemptAt: 'asc' },
    take: Math.min(50, Math.max(1, limit)),
  });
  let accepted = 0;
  let failed = 0;

  for (const candidate of candidates) {
    // A stale in-flight transfer email may already have been accepted. Provider
    // idempotency expires: never replay that ambiguous financial notification.
    if (candidate.category === 'GUIDE_TRANSFER_CONFIRMED' && candidate.status === 'SENDING') {
      const stopped = await prisma.emailDelivery.updateMany({
        where: { id: candidate.id, status: 'SENDING', attempts: candidate.attempts, updatedAt: { lte: staleSendingBefore } },
        data: { status: 'FAILED', nextAttemptAt: null,
          lastError: 'Résultat d’envoi incertain. Vérifier chez Brevo avant tout renvoi.', payloadEncrypted: null },
      });
      failed += stopped.count;
      continue;
    }
    const claimed = await prisma.emailDelivery.updateMany({
      where: { id: candidate.id, status: candidate.status, attempts: candidate.attempts },
      data: { status: 'SENDING', attempts: { increment: 1 } },
    });
    if (claimed.count !== 1 || !candidate.payloadEncrypted) continue;

    try {
      const payload = JSON.parse(decrypt(candidate.payloadEncrypted)) as StoredEmailPayload;
      const messageId = await sendViaBrevo(payload);
      await prisma.emailDelivery.update({
        where: { id: candidate.id },
        data: {
          providerMessageId: messageId,
          status: 'ACCEPTED',
          acceptedAt: new Date(),
          payloadEncrypted: null,
          nextAttemptAt: null,
          lastError: null,
        },
      });
      accepted++;
    } catch (error) {
      const attempts = candidate.attempts + 1;
      const transferEmail = candidate.category === 'GUIDE_TRANSFER_CONFIRMED';
      // Only a definite rate-limit rejection is automatically retried here.
      // Timeout, missing acknowledgement, 5xx or a failed ledger write can hide
      // provider acceptance. Other email categories keep their existing policy.
      const canRetry = attempts < candidate.maxAttempts && (transferEmail
        ? error instanceof EmailProviderError && error.statusCode === 429
        : !(error instanceof EmailProviderError) || error.retryable);
      await prisma.emailDelivery.update({
        where: { id: candidate.id },
        data: {
          status: canRetry ? 'RETRY_PENDING' : 'FAILED',
          nextAttemptAt: canRetry ? retryAt(attempts) : null,
          payloadEncrypted: canRetry ? candidate.payloadEncrypted : null,
          lastError: transferEmail && !(error instanceof EmailProviderError && error.statusCode && error.statusCode < 500)
            ? 'Résultat d’envoi non confirmé. Vérification nécessaire avant tout renvoi.' : errorMessage(error),
        },
      });
      failed++;
    }
  }

  return { checked: candidates.length, accepted, failed };
}

// ─── Sécurité : échappement HTML ────────────────────────────────
// Toutes les données dynamiques (noms, messages, etc.) passent par
// cette fonction avant injection dans les templates HTML.
export function escapeHtml(str: unknown): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// ─── Template helpers ───────────────────────────────────────────

export function baseTemplate(content: string, guideMobileLayout = false): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SAFARUMA</title></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;${guideMobileLayout ? 'table-layout:fixed;' : ''}">

        <!-- Header -->
        <tr>
          <td style="background:#1A1209;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
            <div style="height:3px;background:linear-gradient(90deg,#C9A84C,#F0D897,#C9A84C);border-radius:2px;margin-bottom:20px;"></div>
            <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:white;letter-spacing:0.08em;">
              SAFAR<span style="color:#C9A84C;">U</span>MA
            </span>
          </td>
        </tr>

        <!-- Body -->
        <tr>
          <td style="background:white;padding:${guideMobileLayout ? '24' : '40'}px;border:1px solid #E8DFC8;border-top:none;">
            ${content}
          </td>
        </tr>

        <!-- Footer -->
        <tr>
          <td style="background:#F5F0E8;border:1px solid #E8DFC8;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#9A8D7A;line-height:1.6;">
              SAFARUMA — La plateforme des guides privés pour la Omra<br>
              <a href="https://safaruma.com" style="color:#C9A84C;text-decoration:none;">safaruma.com</a>
              &nbsp;·&nbsp;
              <a href="mailto:contact@safaruma.com" style="color:#C9A84C;text-decoration:none;">contact@safaruma.com</a>
            </p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

export function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#1A1209;color:#F0D897;padding:12px 28px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.04em;margin-top:8px;">${text}</a>`;
}

export function heading(text: string): string {
  return `<h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1A1209;margin:0 0 8px;">${text}</h1>`;
}

export function p(text: string): string {
  return `<p style="font-size:14px;color:#4A3F30;line-height:1.7;margin:12px 0;">${text}</p>`;
}

export function divider(): string {
  return `<div style="height:1px;background:#E8DFC8;margin:24px 0;"></div>`;
}

export function badge(text: string, color = '#C9A84C'): string {
  return `<span style="display:inline-block;background:${color}22;color:${color};font-size:11px;font-weight:700;letter-spacing:0.08em;padding:4px 12px;border-radius:20px;">${text}</span>`;
}

export function sendReferralPromoCode(opts: {
  to: string;
  name: string;
  code: string;
  expiresAt: Date;
  purpose: 'REFERRED_SIGNUP' | 'SPONSOR_REWARD';
  referralId: string;
}): Promise<EmailSendResult> {
  const expiry = opts.expiresAt.toLocaleDateString('fr-FR', {
    day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC',
  });
  const intro = opts.purpose === 'REFERRED_SIGNUP'
    ? 'Votre code promotionnel de parrainage est prêt. Saisissez-le volontairement dans votre checkout SAFARUMA avant le paiement.'
    : 'Un filleul a finalisé un paiement avec votre lien de parrainage. Votre code promotionnel personnel est prêt.';
  return sendEmail({
    category: 'REFERRAL_PROMO_CODE',
    retryable: true,
    idempotencyKey: `referral-promo:${opts.referralId}:${opts.purpose}:${opts.to.toLowerCase()}`,
    reference: { type: 'REFERRAL', id: opts.referralId },
    to: { email: opts.to, name: opts.name },
    subject: 'Votre code promotionnel SAFARUMA — 10 %',
    html: baseTemplate(`
      ${heading(`Bonjour ${escapeHtml(opts.name || 'Pèlerin')},`)}
      ${badge('CODE PROMOTIONNEL · 10 %', '#1D5C3A')}
      ${p(intro)}
      <div style="background:#1A1209;border-radius:12px;padding:20px;margin:20px 0;text-align:center;">
        <div style="font-size:11px;letter-spacing:.1em;color:rgba(255,255,255,.55);font-weight:700;text-transform:uppercase;margin-bottom:8px;">Votre code à usage unique</div>
        <div style="font-family:monospace;font-size:22px;letter-spacing:.08em;font-weight:800;color:#F0D897;">${escapeHtml(opts.code)}</div>
      </div>
      ${p(`Valable jusqu’au <strong>${escapeHtml(expiry)}</strong>. Il est utilisable une seule fois et ne se cumule avec aucun autre code.`)}
      ${divider()}
      <div style="text-align:center">${btn('Préparer ma réservation', 'https://safaruma.com/guides')}</div>
    `),
  });
}

// ─── 1. Bienvenue pèlerin ────────────────────────────────────────

export function sendWelcomePelerin(to: string, name: string): Promise<EmailSendResult> {
  return sendEmail({
    category: 'PELERIN_WELCOME',
    to: { email: to, name },
    subject: 'Bienvenue sur SAFARUMA — Votre compte est créé',
    html: baseTemplate(`
      ${heading(`Bienvenue, ${escapeHtml(name)} !`)}
      ${p('Votre compte pèlerin a été créé avec succès. Vous rejoignez une communauté de confiance dédiée à accompagner les pèlerins lors de leur Omra.')}
      ${divider()}
      <table cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
        <tr>
          <td width="48%" style="background:#FAF7F0;border-radius:12px;padding:16px 20px;border:1px solid #E8DFC8;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C9A84C;margin-bottom:6px;">Étape 1</div>
            <div style="font-size:13px;font-weight:600;color:#1A1209;">Complétez votre profil</div>
            <div style="font-size:12px;color:#7A6D5A;margin-top:4px;line-height:1.5;">Dates souhaitées, budget, préférences</div>
          </td>
          <td width="4%"></td>
          <td width="48%" style="background:#FAF7F0;border-radius:12px;padding:16px 20px;border:1px solid #E8DFC8;">
            <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#C9A84C;margin-bottom:6px;">Étape 2</div>
            <div style="font-size:13px;font-weight:600;color:#1A1209;">Trouvez votre guide</div>
            <div style="font-size:12px;color:#7A6D5A;margin-top:4px;line-height:1.5;">Guides vérifiés, avis certifiés</div>
          </td>
        </tr>
      </table>
      ${divider()}
      <div style="text-align:center;padding:8px 0;">
        ${btn('Accéder à mon espace', 'https://safaruma.com/espace/tableau-de-bord')}
      </div>
    `),
  });
}

// ─── 2. Bienvenue guide ──────────────────────────────────────────

// Keep Arabic and recipient names in separate blocks so bidirectional text
// cannot reorder punctuation or crowd the greeting on narrow email clients.
function guideEmailGreeting(arabic: string, name: string): string {
  return `<h1 lang="ar" dir="rtl" style="font-family:Arial,sans-serif;font-size:24px;font-weight:400;line-height:1.8;text-align:left;color:#1A1209;margin:0;padding:2px 0;">${escapeHtml(arabic)}</h1>
    <p dir="auto" style="font-size:18px;line-height:1.6;color:#1A1209;margin:0 0 16px;overflow-wrap:anywhere;word-break:break-word;">${escapeHtml(name)}</p>`;
}

function guideWhatsAppButton(): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin:16px 0;">
    <tr><td align="center" bgcolor="#128C7E" style="background:#128C7E;border-radius:10px;">
      <a href="https://wa.me/message/3LAXCIZV7FFEK1" dir="ltr" style="display:block;background:#128C7E;color:#FFFFFF;border-radius:10px;padding:14px 8px;font-family:Arial,sans-serif;font-size:12px;line-height:20px;font-weight:700;text-align:center;text-decoration:none;white-space:nowrap;">
        <img src="https://safaruma.com/whatsapp-email.png" width="18" height="18" alt="" style="display:inline-block;vertical-align:middle;border:0;margin-right:4px;">WhatsApp&nbsp;·&nbsp;<span style="white-space:nowrap;">+33&nbsp;7&nbsp;43&nbsp;95&nbsp;91&nbsp;70</span>
      </a>
    </td></tr>
  </table>`;
}

export function sendWelcomeGuide(to: string, name: string): Promise<EmailSendResult> {
  return sendEmail({
    category: 'GUIDE_APPLICATION_RECEIVED',
    to: { email: to, name },
    subject: 'Candidature GUIDE SAFARUMA',
    html: baseTemplate(`
      ${guideEmailGreeting('بارك الله فيك', name)}
      ${p('Votre candidature pour devenir Guide SAFARUMA a bien été reçue. Notre équipe reviendra vers vous dans un délai de 72 h.')}
      ${divider()}
      <div style="background:#FAF7F0;border-left:3px solid #C9A84C;padding:16px 20px;border-radius:0 12px 12px 0;margin:16px 0;">
        <div style="font-size:12px;font-weight:700;color:#C9A84C;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Prochaines étapes</div>
        <ol style="margin:0;padding-left:20px;font-size:13px;color:#4A3F30;line-height:2;">
          <li>Étude de votre candidature par l\'équipe SAFARUMA</li>
          <li>Échange ou entretien si votre profil est retenu</li>
          <li>Création de votre espace Guide et publication en ligne de votre profil</li>
          <li>Recevez vos premières réservations</li>
        </ol>
      </div>
      ${divider()}
      ${p('Des questions ? Contactez-nous à <a href="mailto:contact@safaruma.com" style="color:#C9A84C;font-weight:700;">contact@safaruma.com</a> ou sur WhatsApp.')}
      ${guideWhatsAppButton()}
    `, true),
  });
}

// ─── 3. Accès guide validé ──────────────────────────────────────

export function sendGuideAccess(opts: {
  to: string;
  name: string;
  email: string;
  setupUrl: string;
  profileActive?: boolean;
}): Promise<EmailSendResult> {
  const { to, name, email, setupUrl, profileActive = true } = opts;
  return sendEmail({
    category: 'GUIDE_ACCESS_INVITATION',
    to: { email: to, name },
    subject: profileActive ? 'Activez votre accès Guide SAFARUMA — Bienvenue !' : 'Définissez votre accès Guide SAFARUMA',
    throwOnError: true,
    html: baseTemplate(`
      ${guideEmailGreeting('ما شاء الله', name)}
      ${badge(profileActive ? 'PROFIL ACTIF ✓' : 'CANDIDATURE VALIDÉE ✓', '#1D5C3A')}
      ${p(profileActive
        ? 'Votre dossier a été examiné et approuvé par l\'équipe SAFARUMA. Votre profil guide est maintenant actif et visible par les pèlerins.'
        : 'Votre candidature a été approuvée. Vos accès à l’espace Guide sont prêts ; la publication du profil public reste contrôlée par l’équipe SAFARUMA.')}
      ${divider()}
      <div style="background:#1A1209;border-radius:12px;padding:24px;margin:16px 0;">
        <div style="font-size:11px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:#F0D897;margin-bottom:16px;">Votre adresse de connexion</div>
        <div style="font-size:12px;color:#E8DFC8;padding:6px 0;">Email</div>
        <div dir="ltr" style="font-size:13px;line-height:1.6;color:#FFF3C4;font-weight:700;font-family:monospace;overflow-wrap:anywhere;word-break:break-all;">${escapeHtml(email)}</div>
        <div style="margin-top:12px;font-size:11px;color:#E8DFC8;">Définissez vous-même votre mot de passe avec le lien personnel ci-dessous.</div>
      </div>
      ${divider()}
      <div style="text-align:center;padding:8px 0;">
        ${btn('Définir mon mot de passe', setupUrl)}
      </div>
      ${p('<small style="color:#9A8D7A;">Ce lien est personnel, utilisable une seule fois et expire dans <strong>48 heures</strong>. En cas de problème : <a href="mailto:contact@safaruma.com" style="color:#C9A84C;">contact@safaruma.com</a>.</small>')}
      ${guideWhatsAppButton()}
    `, true),
  });
}

const GUIDE_DOSSIER_EMAIL_CATEGORIES = [
  'GUIDE_PROFILE_REVIEW_SUBMITTED', 'GUIDE_PROFILE_ACTIVATED',
  'GUIDE_DOSSIER_RECEIVED', 'GUIDE_DOSSIER_CORRECTION_DECIDED', 'GUIDE_DOSSIER_RETURNED',
] as const;

// Saved in the SAME transaction as the decision; no provider call before commit.
// Reuses the existing encrypted delivery ledger and its retry scheduler.
export async function queueGuideDossierEmail(db: Prisma.TransactionClient, opts: {
  eventId: string; guideProfileId: string; to: string; name: string;
  event: 'SUBMITTED' | 'ADMIN_REVIEW' | 'APPROVED' | 'REJECTED' | 'RETURNED' | 'ACTIVATED';
  slug?: string | null; guideName?: string;
}) {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com';
  const copy = {
    SUBMITTED: { category: 'GUIDE_DOSSIER_RECEIVED', title: 'Votre dossier Guide a bien été reçu', text: 'Votre dossier est en cours d’examen par l’équipe SAFARUMA. Vous pouvez suivre son état dans votre espace Guide. Cette réception ne vaut pas publication de votre profil.' },
    ADMIN_REVIEW: { category: 'GUIDE_PROFILE_REVIEW_SUBMITTED', title: 'Un dossier Guide est à examiner', text: 'Un Guide a soumis son dossier, à traiter sous 48 h. Consultez les informations et les confirmations enregistrées avant de prendre votre décision.' },
    APPROVED: { category: 'GUIDE_DOSSIER_CORRECTION_DECIDED', title: 'Vos modifications ont été approuvées', text: 'L’équipe SAFARUMA a approuvé votre demande de modification. Consultez votre dossier pour retrouver les informations retenues. Cette décision ne publie pas automatiquement votre profil ni votre portrait.' },
    REJECTED: { category: 'GUIDE_DOSSIER_CORRECTION_DECIDED', title: 'Votre demande de modification a été examinée', text: 'Votre demande de modification n’a pas été approuvée. Le motif de la décision est disponible dans votre espace Guide.' },
    RETURNED: { category: 'GUIDE_DOSSIER_RETURNED', title: 'Votre dossier Guide nécessite des corrections', text: 'Votre dossier a été remis en brouillon. Consultez le motif dans votre espace Guide, corrigez les informations demandées, puis soumettez à nouveau votre dossier.' },
    ACTIVATED: { category: 'GUIDE_PROFILE_ACTIVATED', title: 'Votre profil Guide SAFARUMA est en ligne', text: 'Votre profil public est accessible et vos rubriques opérationnelles sont ouvertes. La réception de nouvelles réservations dépend de votre pause générale, des villes proposées et de vos disponibilités. Vérifiez soigneusement votre calendrier.' },
  }[opts.event];
  const url = opts.event === 'ADMIN_REVIEW'
    ? `${baseUrl}/admin/guides${opts.slug ? `/${encodeURIComponent(opts.slug)}` : ''}`
    : `${baseUrl}/guide/profil`;
  const idempotencyKey = `guide-dossier:${opts.eventId}:${opts.event}:${opts.to.toLowerCase()}`;
  const payload: StoredEmailPayload = {
    to: { email: opts.to, name: opts.name },
    subject: copy.title,
    category: copy.category as EmailCategory,
    reference: { type: 'GUIDE_PROFILE', id: opts.guideProfileId },
    providerIdempotencyKey: providerIdempotencyKey(idempotencyKey),
    html: baseTemplate(`${heading(copy.title)}${p(`السلام عليكم ${escapeHtml(opts.name)},`)}${p(copy.text)}
      ${opts.event === 'ADMIN_REVIEW' && opts.guideName ? p(`Guide : ${escapeHtml(opts.guideName)}`) : ''}
      ${opts.event === 'ACTIVATED' ? p('Une réservation laissée sans réponse entraîne la suspension du profil. Toute annulation est examinée par l’administration et trois annulations comptabilisées entraînent une désactivation définitive.') : ''}
      ${divider()}${btn(opts.event === 'ADMIN_REVIEW' ? 'Examiner le dossier' : 'Ouvrir mon espace Guide', url)}`, true),
  };
  const delivery = await db.emailDelivery.create({ data: {
    idempotencyKey, provider: EMAIL_PROVIDER, category: payload.category,
    recipientEmail: opts.to.toLowerCase(), referenceType: 'GUIDE_PROFILE', referenceId: opts.guideProfileId,
    maxAttempts: 3, payloadEncrypted: encrypt(JSON.stringify(payload)), nextAttemptAt: new Date(),
  } });
  return delivery.id;
}

export async function dispatchGuideDossierEmails(deliveryIds: string[]) {
  if (!deliveryIds.length) return;
  // A provider failure must not report an already committed decision as failed.
  // QUEUED/RETRY_PENDING rows remain recoverable by the existing cron.
  await retryPendingEmails(deliveryIds.length, deliveryIds).catch(error => console.error('[guide dossier email dispatch]', error));
}

// Confirmation only. Metadata corrections deliberately do not enqueue email.
export async function queueGuideTransferEmail(db: Prisma.TransactionClient, opts: {
  transferId: string; to: string; name: string; refNumber: string;
  amountCents: number; bankReference: string; sentAt: Date;
}) {
  const idempotencyKey = `guide-transfer:confirmed:${opts.transferId}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com';
  const amount = (opts.amountCents / 100).toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' });
  const sent = opts.sentAt.toLocaleString('fr-FR', { timeZone: 'Asia/Riyadh', dateStyle: 'long', timeStyle: 'short' });
  const payload: StoredEmailPayload = {
    to: { email: opts.to, name: opts.name }, category: 'GUIDE_TRANSFER_CONFIRMED',
    subject: `SAFARUMA — Virement envoyé · ${opts.refNumber}`,
    reference: { type: 'GUIDE_TRANSFER', id: opts.transferId },
    providerIdempotencyKey: providerIdempotencyKey(idempotencyKey),
    html: baseTemplate(`${heading('Votre virement a été envoyé')}${p(`السلام عليكم ${escapeHtml(opts.name)},`)}
      ${p('L’équipe SAFARUMA a confirmé l’envoi de votre virement pour la réservation suivante.')}
      ${p(`Réservation : <strong>${escapeHtml(opts.refNumber)}</strong><br>Montant envoyé : <strong>${escapeHtml(amount)}</strong><br>
        Référence bancaire : <strong>${escapeHtml(opts.bankReference)}</strong><br>Date d’envoi : ${escapeHtml(sent)} (Arabie saoudite)`)}
      ${p('Le virement est envoyé en euros. Le délai de réception, les frais éventuels et le taux de change dépendent de votre banque. Cet email ne confirme pas la réception des fonds sur votre compte.')}
      ${p('Les informations actualisées sont disponibles dans votre espace Guide.')}
      ${divider()}${btn('Consulter mes virements', `${baseUrl}/guide/revenus`)}`, true),
  };
  const delivery = await db.emailDelivery.create({ data: {
    idempotencyKey, provider: EMAIL_PROVIDER, category: payload.category,
    recipientEmail: opts.to.toLowerCase(), referenceType: 'GUIDE_TRANSFER', referenceId: opts.transferId,
    maxAttempts: 3, payloadEncrypted: encrypt(JSON.stringify(payload)), nextAttemptAt: new Date(),
  } });
  return delivery.id;
}

export async function dispatchGuideTransferEmail(transferId: string) {
  // Called only after the confirmation transaction committed. The cron recovers
  // QUEUED rows if this call is interrupted. No bank operation occurs here.
  try {
    const deliveries = await prisma.emailDelivery.findMany({
      where: { referenceType: 'GUIDE_TRANSFER', referenceId: transferId, category: 'GUIDE_TRANSFER_CONFIRMED' },
      select: { id: true }, take: 1,
    });
    if (deliveries.length) await retryPendingEmails(1, deliveries.map(row => row.id));
  } catch { console.error('[guide transfer email] Dispatch unavailable; delivery remains tracked.'); }
}

// ─── 4. Confirmation de réservation ─────────────────────────────

export function sendReservationConfirmation(opts: {
  to: string;
  pelerinName: string;
  guideName: string;
  departureDate: string;
  nights: number;
  amount: number;
  reservationId: string;
}): Promise<EmailSendResult> {
  const { to, pelerinName, guideName, departureDate, nights, amount, reservationId } = opts;
  return sendEmail({
    category: 'RESERVATION_CONFIRMATION_PELERIN',
    retryable: true,
    idempotencyKey: `reservation-confirmation:pelerin:${reservationId}:${to.toLowerCase()}`,
    reference: { type: 'RESERVATION', id: reservationId },
    to: { email: to, name: pelerinName },
    subject: `Réservation confirmée — ${reservationId}`,
    html: baseTemplate(`
      ${heading('Réservation confirmée')}
      ${badge('CONFIRMÉE', '#4CAF9A')}
      ${p(`Votre réservation avec <strong>${escapeHtml(guideName)}</strong> est confirmée. Qu'Allah accepte votre Omra et vous facilite le voyage.`)}
      ${divider()}
      <table cellpadding="0" cellspacing="0" width="100%">
        ${[
          ['Référence', escapeHtml(reservationId)],
          ['Guide', escapeHtml(guideName)],
          ['Date de départ', escapeHtml(departureDate)],
          ['Durée', `${escapeHtml(nights)} nuits`],
          ['Montant total', `${amount.toLocaleString('fr-FR')} €`],
        ].map(([k, v]) => `
          <tr>
            <td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;width:40%;">${k}</td>
            <td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:600;">${v}</td>
          </tr>
          <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
        `).join('')}
      </table>
      ${divider()}
      <div style="text-align:center;padding:8px 0;">
        ${btn('Voir ma réservation', `https://safaruma.com/espace/reservations`)}
      </div>
    `),
  });
}

// ─── 4. Notification message reçu ───────────────────────────────

export function sendMessageNotification(opts: {
  to: string;
  recipientName: string;
  senderName: string;
  preview: string;
  conversationId: string;
}): Promise<EmailSendResult> {
  const { to, recipientName, senderName, preview, conversationId } = opts;
  return sendEmail({
    category: 'PELERIN_MESSAGE_NOTIFICATION',
    to: { email: to, name: recipientName },
    subject: `Nouveau message de ${senderName}`,
    html: baseTemplate(`
      ${heading('Nouveau message')}
      ${p(`<strong>${escapeHtml(senderName)}</strong> vous a envoyé un message sur SAFARUMA :`)}
      <div style="background:#FAF7F0;border:1px solid #E8DFC8;border-radius:12px;padding:20px;margin:16px 0;">
        <div style="font-size:14px;color:#4A3F30;line-height:1.7;font-style:italic;">"${escapeHtml(preview)}"</div>
        <div style="margin-top:12px;font-size:12px;color:#9A8D7A;">— ${escapeHtml(senderName)}</div>
      </div>
      ${divider()}
      <div style="text-align:center;padding:8px 0;">
        ${btn('Répondre au message', `https://safaruma.com/espace/messages/${conversationId}`)}
      </div>
      ${p('<small style="color:#9A8D7A;">Vous recevez cet email car vous avez un nouveau message sur SAFARUMA. <a href="https://safaruma.com/espace/parametres" style="color:#C9A84C;">Gérer mes notifications</a></small>')}
    `),
  });
}

// ─── 6. Reset mot de passe ──────────────────────────────────────

export function sendPasswordReset(opts: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<EmailSendResult> {
  const { to, name, resetUrl } = opts;
  return sendEmail({
    category: 'PELERIN_PASSWORD_RESET',
    to: { email: to, name },
    subject: 'Réinitialisation de votre mot de passe — SAFARUMA',
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Réinitialiser votre mot de passe')}
      ${p(`Bonjour${name ? ' ' + escapeHtml(name) : ''},`)}
      ${p('Vous avez demandé la réinitialisation de votre mot de passe SAFARUMA. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.')}
      ${divider()}
      <div style="text-align:center;padding:16px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#C9A84C;color:#1A1209;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:800;text-decoration:none;letter-spacing:0.04em;">
          Réinitialiser mon mot de passe →
        </a>
      </div>
      ${divider()}
      ${p('<small style="color:#9A8D7A;">Ce lien expire dans <strong>1 heure</strong>. Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email — votre compte reste sécurisé.</small>')}
      ${p('<small style="color:#9A8D7A;">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><span style="color:#C9A84C;">' + resetUrl + '</span></small>')}
    `),
  });
}

export function sendPelerinPasswordChanged(opts: {
  to: string;
  name: string;
  context: GuideSecurityContext;
}): Promise<EmailSendResult> {
  const { to, name, context } = opts;
  return sendEmail({
    category: 'PELERIN_PASSWORD_CHANGED',
    to: { email: to, name },
    subject: 'Votre mot de passe Pèlerin a été modifié — SAFARUMA',
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Mot de passe modifié')}
      ${p(`Bonjour${name ? ' ' + escapeHtml(name) : ''},`)}
      ${p('Le mot de passe de votre espace Pèlerin SAFARUMA vient d’être modifié.')}
      ${guideSecurityContext(context)}
      ${p('<small style="color:#9A8D7A;">Si vous n’êtes pas à l’origine de cette action, utilisez immédiatement « Mot de passe oublié » puis contactez SAFARUMA.</small>')}
    `),
  });
}

export function sendAdminPasswordReset(opts: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<EmailSendResult> {
  const { to, name, resetUrl } = opts;
  return sendEmail({
    category: 'ADMIN_PASSWORD_RESET',
    to: { email: to, name },
    subject: 'Réinitialisation de votre accès Administration — SAFARUMA',
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Réinitialiser votre accès Administration')}
      ${p(`Bonjour${name ? ' ' + escapeHtml(name) : ''},`)}
      ${p('Une demande de réinitialisation du mot de passe de votre compte Administration SAFARUMA a été effectuée. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe.')}
      ${divider()}
      <div style="text-align:center;padding:16px 0;">
        <a href="${resetUrl}" style="display:inline-block;background:#C9A84C;color:#1A1209;padding:14px 32px;border-radius:50px;font-size:14px;font-weight:800;text-decoration:none;letter-spacing:0.04em;">
          Réinitialiser mon accès →
        </a>
      </div>
      ${divider()}
      ${p('<small style="color:#9A8D7A;">Ce lien est personnel, utilisable une seule fois et expire dans <strong>1 heure</strong>. Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email.</small>')}
    `),
  });
}

type AdminSecurityEmailContext = {
  date: string;
  ip: string;
  country?: string | null;
  city?: string | null;
  device?: string | null;
  browser?: string | null;
};

function adminSecurityContext(context: AdminSecurityEmailContext): string {
  const location = [context.city, context.country].filter(Boolean).join(', ') || 'Non déterminée';
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#FAF7F0;border:1px solid #E8DFC8;border-radius:12px;padding:12px 18px;margin:16px 0;">
      <tr><td style="padding:5px 0;font-size:12px;color:#7A6D5A;">Date</td><td style="padding:5px 0;font-size:12px;color:#1A1209;font-weight:600;">${escapeHtml(context.date)}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:#7A6D5A;">Adresse IP</td><td style="padding:5px 0;font-size:12px;color:#1A1209;font-weight:600;">${escapeHtml(context.ip)}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:#7A6D5A;">Localisation</td><td style="padding:5px 0;font-size:12px;color:#1A1209;font-weight:600;">${escapeHtml(location)}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:#7A6D5A;">Appareil</td><td style="padding:5px 0;font-size:12px;color:#1A1209;font-weight:600;">${escapeHtml([context.device, context.browser].filter(Boolean).join(' · ') || 'Non déterminé')}</td></tr>
    </table>`;
}

export function sendAdminLoginAlert(opts: {
  to: string;
  name: string;
  role: 'ADMIN' | 'SUPERADMIN';
  context: AdminSecurityEmailContext;
}): Promise<EmailSendResult> {
  const { to, name, role, context } = opts;
  const roleLabel = role === 'SUPERADMIN' ? 'Superadmin' : 'Admin';
  return sendEmail({
    category: 'ADMIN_LOGIN_ALERT',
    to: { email: to, name },
    subject: `Nouvelle connexion à votre compte ${roleLabel} — SAFARUMA`,
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Nouvelle connexion détectée')}
      ${badge(roleLabel.toUpperCase(), role === 'SUPERADMIN' ? '#2563EB' : '#C9A84C')}
      ${p(`Bonjour${name ? ' ' + escapeHtml(name) : ''},`)}
      ${p(`Une connexion réussie à votre compte <strong>${roleLabel} SAFARUMA</strong> vient d’être enregistrée.`)}
      ${adminSecurityContext(context)}
      ${p('<small style="color:#9A8D7A;">Si vous n’êtes pas à l’origine de cette connexion, réinitialisez immédiatement votre mot de passe et contactez SAFARUMA.</small>')}
      ${divider()}
      <div style="text-align:center;padding:8px 0;">${btn('Sécuriser mon compte', 'https://safaruma.com/admin/mot-de-passe-oublie')}</div>
    `),
  });
}

export function sendAdminPasswordChanged(opts: {
  to: string;
  name: string;
  role: 'ADMIN' | 'SUPERADMIN';
  context: AdminSecurityEmailContext;
}): Promise<EmailSendResult> {
  const { to, name, role, context } = opts;
  const roleLabel = role === 'SUPERADMIN' ? 'Superadmin' : 'Admin';
  return sendEmail({
    category: 'ADMIN_PASSWORD_CHANGED',
    to: { email: to, name },
    subject: `Mot de passe ${roleLabel} modifié — SAFARUMA`,
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Mot de passe modifié')}
      ${badge(roleLabel.toUpperCase(), role === 'SUPERADMIN' ? '#2563EB' : '#C9A84C')}
      ${p(`Bonjour${name ? ' ' + escapeHtml(name) : ''},`)}
      ${p(`Le mot de passe de votre compte <strong>${roleLabel} SAFARUMA</strong> vient d’être modifié. Toutes les sessions précédentes ont été déconnectées.`)}
      ${adminSecurityContext(context)}
      ${p('<small style="color:#9A8D7A;">Si vous n’êtes pas à l’origine de cette action, utilisez immédiatement « Mot de passe oublié » puis contactez SAFARUMA.</small>')}
      ${divider()}
      <div style="text-align:center;padding:8px 0;">${btn('Sécuriser mon compte', 'https://safaruma.com/admin/mot-de-passe-oublie')}</div>
    `),
  });
}

type GuideSecurityContext = {
  date: string;
  ip: string;
  country?: string | null;
  city?: string | null;
  device?: string | null;
  browser?: string | null;
};

function guideSecurityContext(context: GuideSecurityContext): string {
  const location = [context.city, context.country].filter(Boolean).join(', ') || 'Non déterminée';
  return `
    <table cellpadding="0" cellspacing="0" width="100%" style="background:#FAF7F0;border:1px solid #E8DFC8;border-radius:12px;padding:12px 18px;margin:16px 0;">
      <tr><td style="padding:5px 0;font-size:12px;color:#7A6D5A;">Date</td><td style="padding:5px 0;font-size:12px;color:#1A1209;font-weight:600;">${escapeHtml(context.date)}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:#7A6D5A;">Adresse IP</td><td style="padding:5px 0;font-size:12px;color:#1A1209;font-weight:600;">${escapeHtml(context.ip)}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:#7A6D5A;">Localisation</td><td style="padding:5px 0;font-size:12px;color:#1A1209;font-weight:600;">${escapeHtml(location)}</td></tr>
      <tr><td style="padding:5px 0;font-size:12px;color:#7A6D5A;">Appareil</td><td style="padding:5px 0;font-size:12px;color:#1A1209;font-weight:600;">${escapeHtml([context.device, context.browser].filter(Boolean).join(' · ') || 'Non déterminé')}</td></tr>
    </table>`;
}

export function sendGuidePasswordReset(opts: {
  to: string;
  name: string;
  resetUrl: string;
}): Promise<EmailSendResult> {
  const { to, name, resetUrl } = opts;
  return sendEmail({
    category: 'GUIDE_PASSWORD_RESET',
    to: { email: to, name },
    subject: 'Réinitialisation de votre accès Guide — SAFARUMA',
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Réinitialiser votre accès Guide')}
      ${p(`Bonjour${name ? ' ' + escapeHtml(name) : ''},`)}
      ${p('Une demande de réinitialisation du mot de passe de votre espace Guide SAFARUMA a été effectuée.')}
      ${divider()}
      <div style="text-align:center;padding:16px 0;">${btn('Choisir un nouveau mot de passe', resetUrl)}</div>
      ${divider()}
      ${p('<small style="color:#9A8D7A;">Ce lien est personnel, utilisable une seule fois et expire dans <strong>1 heure</strong>. Si vous n\'avez pas demandé cette réinitialisation, ignorez cet email.</small>')}
    `),
  });
}

export function sendGuideEmailChangeCode(opts: {
  to: string;
  name: string;
  code: string;
}): Promise<EmailSendResult> {
  const { to, name, code } = opts;
  return sendEmail({
    category: 'GUIDE_EMAIL_CHANGE_CODE',
    to: { email: to, name },
    subject: 'Code de confirmation de votre nouvelle adresse — SAFARUMA',
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Confirmer votre nouvelle adresse')}
      ${p(`Bonjour${name ? ' ' + escapeHtml(name) : ''},`)}
      ${p('Saisissez ce code dans votre espace Guide pour confirmer votre nouvelle adresse e-mail :')}
      <div style="margin:24px 0;text-align:center;font-size:30px;font-weight:800;letter-spacing:0.3em;color:#1A1209;">${escapeHtml(code)}</div>
      ${p('<small style="color:#9A8D7A;">Ce code expire dans <strong>1 heure</strong>. Ne le communiquez à personne.</small>')}
    `),
  });
}

export function sendGuideEmailChanged(opts: {
  to: string;
  name: string;
  oldEmail: string;
  newEmail: string;
  context: GuideSecurityContext;
}): Promise<EmailSendResult> {
  const { to, name, oldEmail, newEmail, context } = opts;
  return sendEmail({
    category: 'GUIDE_EMAIL_CHANGED',
    to: { email: to, name },
    subject: 'Votre adresse e-mail Guide a été modifiée — SAFARUMA',
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Adresse e-mail modifiée')}
      ${p(`Bonjour${name ? ' ' + escapeHtml(name) : ''},`)}
      ${p(`L’adresse de connexion de votre espace Guide est passée de <strong>${escapeHtml(oldEmail)}</strong> à <strong>${escapeHtml(newEmail)}</strong>. Toutes les sessions ont été déconnectées.`)}
      ${guideSecurityContext(context)}
      ${p('<small style="color:#9A8D7A;">Si vous n’êtes pas à l’origine de cette action, contactez immédiatement SAFARUMA.</small>')}
    `),
  });
}

export function sendGuidePasswordChanged(opts: {
  to: string;
  name: string;
  context: GuideSecurityContext;
}): Promise<EmailSendResult> {
  const { to, name, context } = opts;
  return sendEmail({
    category: 'GUIDE_PASSWORD_CHANGED',
    to: { email: to, name },
    subject: 'Votre mot de passe Guide a été modifié — SAFARUMA',
    throwOnError: true,
    html: baseTemplate(`
      ${heading('Mot de passe modifié')}
      ${p(`<span lang="ar" dir="rtl" style="display:block;font-family:Arial,sans-serif;font-size:20px;line-height:1.8;text-align:left;">السلام عليكم</span>${name ? `<span dir="auto" style="display:block;overflow-wrap:anywhere;">${escapeHtml(name)}</span>` : ''}`)}
      ${p('Le mot de passe de votre espace Guide SAFARUMA vient d’être modifié. Toutes les sessions ont été déconnectées.')}
      ${guideSecurityContext(context)}
      ${p('<small style="color:#9A8D7A;">Si vous n’êtes pas à l’origine de cette action, utilisez immédiatement « Mot de passe oublié » puis contactez SAFARUMA.</small>')}
    `),
  });
}

// ─── 5. Rappel 7 jours avant départ ─────────────────────────────

export function sendDepartureReminder(opts: {
  to: string;
  pelerinName: string;
  guideName: string;
  guidePhone: string;
  departureDate: string;
  reservationId: string;
}): Promise<EmailSendResult> {
  const { to, pelerinName, guideName, guidePhone, departureDate, reservationId } = opts;
  return sendEmail({
    category: 'DEPARTURE_REMINDER_PELERIN',
    to: { email: to, name: pelerinName },
    subject: `Votre Omra dans 7 jours — Rappel SAFARUMA`,
    html: baseTemplate(`
      ${heading('Votre départ approche')}
      ${badge('J - 7', '#7B6CF6')}
      ${p(`Qu'Allah vous facilite le voyage. Votre Omra avec <strong>${escapeHtml(guideName)}</strong> est dans <strong>7 jours</strong>.`)}
      ${divider()}
      <div style="background:#1A1209;border-radius:12px;padding:24px;margin:16px 0;text-align:center;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:8px;">Date de départ</div>
        <div style="font-family:Georgia,serif;font-size:28px;color:#F0D897;font-weight:300;">${escapeHtml(departureDate)}</div>
      </div>
      ${divider()}
      <div style="background:#FAF7F0;border-radius:12px;padding:20px;margin:16px 0;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px;">Contact de votre guide</div>
        <div style="font-size:14px;font-weight:600;color:#1A1209;">${escapeHtml(guideName)}</div>
        <div style="font-size:13px;color:#7A6D5A;margin-top:4px;">WhatsApp : <a href="https://wa.me/${encodeURIComponent(guidePhone.replace(/\s/g,''))}" style="color:#C9A84C;">${escapeHtml(guidePhone)}</a></div>
      </div>
      <div style="background:#FAF7F0;border-radius:12px;padding:20px;margin:16px 0;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px;">Checklist avant départ</div>
        <ul style="margin:0;padding-left:20px;font-size:13px;color:#4A3F30;line-height:2;">
          <li>Passeport valide + visa Omra</li>
          <li>Vaccinations requises à jour</li>
          <li>Vêtements d'ihram préparés</li>
          <li>Contact WhatsApp du guide enregistré</li>
          <li>Assurance voyage</li>
        </ul>
      </div>
      ${divider()}
      <div style="text-align:center;padding:8px 0;">
        ${btn('Voir ma réservation', `https://safaruma.com/espace/reservations`)}
      </div>
    `),
  });
}
