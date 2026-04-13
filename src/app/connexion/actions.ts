'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendEmail } from '@/lib/email';

export async function signup(formData: FormData) {
  const email     = (formData.get('email')      as string)?.trim().toLowerCase();
  const password  = (formData.get('password')   as string);
  const firstName = (formData.get('first_name') as string)?.trim();
  const lastName  = (formData.get('last_name')  as string)?.trim();
  const whatsapp  = (formData.get('whatsapp')   as string)?.trim() || null;
  const refCode   = (formData.get('ref')        as string)?.trim() || null;

  if (!email || !password || password.length < 8) {
    redirect('/inscription?error=InvalidData');
  }

  // Vérifier si l'email existe déjà
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    redirect('/inscription?error=EmailAlreadyExists');
  }

  // Hasher le mot de passe
  const passwordHash = await bcrypt.hash(password, 12);
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || email.split('@')[0];

  // Créer l'utilisateur dans Prisma
  await prisma.user.create({
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

  if (refCode) {
    console.log(`[parrainage] Nouvel inscrit ${email} parrainé par code ${refCode}`);
    // TODO: créer une entrée Referral en base quand Stripe est actif
  }

  // Générer et sauvegarder le token de vérification
  const token = crypto.randomUUID();
  await prisma.emailVerificationToken.create({
    data: {
      token,
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24h
    },
  });

  // Envoyer l'email de confirmation (fire-and-forget)
  sendEmail({
    to: { email, name: `${firstName} ${lastName}` },
    subject: 'Confirmez votre adresse email — SAFARUMA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1A1209;">Bienvenue sur SAFARUMA 🕋</h2>
        <p>Cliquez sur le bouton ci-dessous pour confirmer
           votre adresse email et accéder à votre espace.</p>
        <a href="https://safaruma.com/verify-email?token=${token}"
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
    `,
  }).catch(() => {});

  // Rediriger vers connexion avec message de vérification
  redirect(refCode
    ? `/connexion?registered=1&verify=1&ref=${refCode}`
    : '/connexion?registered=1&verify=1'
  );
}

export async function signout() {
  redirect('/connexion');
}
