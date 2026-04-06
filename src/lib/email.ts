// Brevo Transactional Email — HTTP API (no external dependency)

const BREVO_URL = 'https://api.brevo.com/v3/smtp/email';

interface EmailPayload {
  to: { email: string; name?: string };
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailPayload): Promise<void> {
  const apiKey = process.env.BREVO_API_KEY;
  if (!apiKey) {
    console.warn('[email] BREVO_API_KEY not set — skipping send');
    return;
  }

  const body = {
    sender: {
      name: process.env.SMTP_FROM_NAME ?? 'SAFARUMA',
      email: process.env.SMTP_FROM ?? 'noreply@safaruma.com',
    },
    to: [{ email: to.email, name: to.name ?? to.email }],
    subject,
    htmlContent: html,
  };

  try {
    const res = await fetch(BREVO_URL, {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('[email] Brevo error', res.status, err);
    }
  } catch (err) {
    console.error('[email] fetch failed', err);
  }
}

// ─── Template helpers ───────────────────────────────────────────

function baseTemplate(content: string): string {
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>SAFARUMA</title></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:40px 16px;">
    <tr><td align="center">
      <table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">

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
          <td style="background:white;padding:40px;border:1px solid #E8DFC8;border-top:none;">
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

function btn(text: string, url: string): string {
  return `<a href="${url}" style="display:inline-block;background:#1A1209;color:#F0D897;padding:12px 28px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.04em;margin-top:8px;">${text}</a>`;
}

function heading(text: string): string {
  return `<h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1A1209;margin:0 0 8px;">${text}</h1>`;
}

function p(text: string): string {
  return `<p style="font-size:14px;color:#4A3F30;line-height:1.7;margin:12px 0;">${text}</p>`;
}

function divider(): string {
  return `<div style="height:1px;background:#E8DFC8;margin:24px 0;"></div>`;
}

function badge(text: string, color = '#C9A84C'): string {
  return `<span style="display:inline-block;background:${color}22;color:${color};font-size:11px;font-weight:700;letter-spacing:0.08em;padding:4px 12px;border-radius:20px;">${text}</span>`;
}

// ─── 1. Bienvenue pèlerin ────────────────────────────────────────

export function sendWelcomePelerin(to: string, name: string): Promise<void> {
  return sendEmail({
    to: { email: to, name },
    subject: 'Bienvenue sur SAFARUMA — Votre compte est créé',
    html: baseTemplate(`
      ${heading(`Bienvenue, ${name} !`)}
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

export function sendWelcomeGuide(to: string, name: string): Promise<void> {
  return sendEmail({
    to: { email: to, name },
    subject: 'Candidature reçue — SAFARUMA Guide',
    html: baseTemplate(`
      ${heading(`Barak Allahu fik, ${name} !`)}
      ${p('BarakAllahu fik. L\'équipe SAFARUMA a bien reçu votre candidature en tant que guide Mutawwif. Nous l\'examinerons insha\'Allah et vous contacterons sous <strong>48h</strong>.')}
      ${divider()}
      <div style="background:#FAF7F0;border-left:3px solid #C9A84C;padding:16px 20px;border-radius:0 12px 12px 0;margin:16px 0;">
        <div style="font-size:12px;font-weight:700;color:#C9A84C;letter-spacing:0.08em;text-transform:uppercase;margin-bottom:8px;">Prochaines étapes</div>
        <ol style="margin:0;padding-left:20px;font-size:13px;color:#4A3F30;line-height:2;">
          <li>Vérification de vos documents (48h)</li>
          <li>Entretien téléphonique avec notre équipe</li>
          <li>Activation de votre profil guide</li>
          <li>Vos premiers pèlerins vous contactent</li>
        </ol>
      </div>
      ${divider()}
      ${p('Des questions ? Contactez-nous directement à <a href="mailto:guides@safaruma.com" style="color:#C9A84C;">guides@safaruma.com</a>')}
    `),
  });
}

// ─── 3. Confirmation de réservation ─────────────────────────────

export function sendReservationConfirmation(opts: {
  to: string;
  pelerinName: string;
  guideName: string;
  departureDate: string;
  nights: number;
  amount: number;
  reservationId: string;
}): Promise<void> {
  const { to, pelerinName, guideName, departureDate, nights, amount, reservationId } = opts;
  return sendEmail({
    to: { email: to, name: pelerinName },
    subject: `Réservation confirmée — ${reservationId}`,
    html: baseTemplate(`
      ${heading('Réservation confirmée')}
      ${badge('CONFIRMÉE', '#4CAF9A')}
      ${p(`Votre réservation avec <strong>${guideName}</strong> est confirmée. Qu'Allah accepte votre Omra et vous facilite le voyage.`)}
      ${divider()}
      <table cellpadding="0" cellspacing="0" width="100%">
        ${[
          ['Référence', reservationId],
          ['Guide', guideName],
          ['Date de départ', departureDate],
          ['Durée', `${nights} nuits`],
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
}): Promise<void> {
  const { to, recipientName, senderName, preview, conversationId } = opts;
  return sendEmail({
    to: { email: to, name: recipientName },
    subject: `Nouveau message de ${senderName}`,
    html: baseTemplate(`
      ${heading('Nouveau message')}
      ${p(`<strong>${senderName}</strong> vous a envoyé un message sur SAFARUMA :`)}
      <div style="background:#FAF7F0;border:1px solid #E8DFC8;border-radius:12px;padding:20px;margin:16px 0;">
        <div style="font-size:14px;color:#4A3F30;line-height:1.7;font-style:italic;">"${preview}"</div>
        <div style="margin-top:12px;font-size:12px;color:#9A8D7A;">— ${senderName}</div>
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
}): Promise<void> {
  const { to, name, resetUrl } = opts;
  return sendEmail({
    to: { email: to, name },
    subject: 'Réinitialisation de votre mot de passe — SAFARUMA',
    html: baseTemplate(`
      ${heading('Réinitialiser votre mot de passe')}
      ${p(`Bonjour${name ? ' ' + name : ''},`)}
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

// ─── 5. Rappel 7 jours avant départ ─────────────────────────────

export function sendDepartureReminder(opts: {
  to: string;
  pelerinName: string;
  guideName: string;
  guidePhone: string;
  departureDate: string;
  reservationId: string;
}): Promise<void> {
  const { to, pelerinName, guideName, guidePhone, departureDate, reservationId } = opts;
  return sendEmail({
    to: { email: to, name: pelerinName },
    subject: `Votre Omra dans 7 jours — Rappel SAFARUMA`,
    html: baseTemplate(`
      ${heading('Votre départ approche')}
      ${badge('J - 7', '#7B6CF6')}
      ${p(`Qu'Allah vous facilite le voyage. Votre Omra avec <strong>${guideName}</strong> est dans <strong>7 jours</strong>.`)}
      ${divider()}
      <div style="background:#1A1209;border-radius:12px;padding:24px;margin:16px 0;text-align:center;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.1em;text-transform:uppercase;color:rgba(255,255,255,0.4);margin-bottom:8px;">Date de départ</div>
        <div style="font-family:Georgia,serif;font-size:28px;color:#F0D897;font-weight:300;">${departureDate}</div>
      </div>
      ${divider()}
      <div style="background:#FAF7F0;border-radius:12px;padding:20px;margin:16px 0;">
        <div style="font-size:12px;font-weight:700;letter-spacing:0.08em;text-transform:uppercase;color:#C9A84C;margin-bottom:12px;">Contact de votre guide</div>
        <div style="font-size:14px;font-weight:600;color:#1A1209;">${guideName}</div>
        <div style="font-size:13px;color:#7A6D5A;margin-top:4px;">WhatsApp : <a href="https://wa.me/${guidePhone.replace(/\s/g,'')}" style="color:#C9A84C;">${guidePhone}</a></div>
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
