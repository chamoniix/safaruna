import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { escapeHtml, sendEmail } from '@/lib/email';
import { checkRateLimit, contactRatelimit } from '@/lib/ratelimit';

const contactSchema = z.object({
  nom: z.string().trim().min(1).max(80),
  prenom: z.string().trim().min(1).max(80),
  email: z.string().trim().email().max(254),
  telephone: z.string().trim().max(30).optional().default(''),
  sujet: z.enum([
    'Réservation Omra',
    'Demande de guide',
    'Service transfert',
    'Service visa',
    'Service hôtels',
    'Question technique',
    'Partenariat',
    'Autre',
  ]),
  message: z.string().trim().min(1).max(5000),
});

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, contactRatelimit);
  if (limited) return limited;

  try {
    const parsed = contactSchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Veuillez vérifier les informations saisies.' }, { status: 400 });
    }

    const { nom, prenom, email, telephone, sujet, message } = parsed.data;
    const fullName = `${prenom} ${nom}`;

    await sendEmail({
      to: { email: 'contact@safaruma.com', name: 'SAFARUMA — Contact' },
      replyTo: { email, name: fullName },
      subject: `[Contact SAFARUMA] ${sujet} — ${fullName}`,
      html: `
        <h1 style="font-family:Georgia,serif;font-size:24px;color:#1A1209;">Nouvelle demande de contact</h1>
        <p><strong>Nom :</strong> ${escapeHtml(nom)}</p>
        <p><strong>Prénom :</strong> ${escapeHtml(prenom)}</p>
        <p><strong>Email :</strong> ${escapeHtml(email)}</p>
        <p><strong>Téléphone :</strong> ${escapeHtml(telephone || 'Non renseigné')}</p>
        <p><strong>Sujet :</strong> ${escapeHtml(sujet)}</p>
        <p><strong>Message :</strong></p>
        <p style="white-space:pre-wrap;">${escapeHtml(message)}</p>
      `,
      throwOnError: true,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[contact]', error);
    return NextResponse.json(
      { error: 'Impossible d’envoyer votre message pour le moment. Réessayez plus tard.' },
      { status: 500 }
    );
  }
}
