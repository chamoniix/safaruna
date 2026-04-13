import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { checkAdmin } from '@/lib/check-admin';
import prisma from '@/lib/prisma';

function generatePassword(length = 12): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#';
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { email, firstName, lastName } = await req.json();

  if (!email || !firstName) {
    return NextResponse.json({ error: 'Email et prénom requis' }, { status: 400 });
  }

  const tempPassword = generatePassword();
  const passwordHash = await bcrypt.hash(tempPassword, 12);

  try {
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: 'GUIDE', firstName, lastName: lastName || '' },
      create: {
        email,
        name: `${firstName} ${lastName || ''}`.trim(),
        firstName,
        lastName: lastName || '',
        passwordHash,
        role: 'GUIDE',
      },
    });

    // Envoyer email via Brevo
    await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY || '',
      },
      body: JSON.stringify({
        sender: { name: 'SAFARUMA', email: 'noreply@safaruma.com' },
        to: [{ email, name: `${firstName} ${lastName || ''}`.trim() }],
        subject: 'Vos accès Guide SAFARUMA',
        htmlContent: `
          <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #1A1209; color: white; border-radius: 12px; padding: 2rem;">
            <h1 style="font-size: 1.8rem; color: #C9A84C; margin-bottom: 0.5rem;">SAFARUMA</h1>
            <h2 style="color: white; font-size: 1.2rem; margin-bottom: 1.5rem;">Vos accès Guide sont prêts</h2>
            <p style="color: rgba(255,255,255,0.7); margin-bottom: 1.5rem;">Bonjour ${firstName},<br/><br/>Votre espace guide SAFARUMA a été activé. Voici vos identifiants de connexion :</p>
            <div style="background: rgba(201,168,76,0.1); border: 1px solid rgba(201,168,76,0.3); border-radius: 8px; padding: 1rem 1.25rem; margin-bottom: 1.5rem;">
              <p style="margin: 0 0 0.5rem; color: rgba(255,255,255,0.5); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">Identifiant</p>
              <p style="margin: 0 0 1rem; color: white; font-weight: 700;">${email}</p>
              <p style="margin: 0 0 0.5rem; color: rgba(255,255,255,0.5); font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.1em;">Mot de passe temporaire</p>
              <p style="margin: 0; color: #C9A84C; font-weight: 700; font-size: 1.1rem; letter-spacing: 0.05em;">${tempPassword}</p>
            </div>
            <p style="color: rgba(255,255,255,0.5); font-size: 0.8rem; margin-bottom: 1.5rem;">⚠️ Changez votre mot de passe après votre première connexion.</p>
            <a href="https://safaruma.com/guide/connexion" style="display: inline-block; background: #C9A84C; color: #1A1209; padding: 0.75rem 1.75rem; border-radius: 50px; text-decoration: none; font-weight: 700; font-size: 0.875rem;">Accéder à mon espace →</a>
          </div>
        `,
      }),
    });

    // Ne PAS retourner tempPassword dans la réponse — déjà envoyé par email
    return NextResponse.json({ success: true, userId: user.id, email });

  } catch (error) {
    console.error('[create-guide-access]', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
