'use server';

import { redirect } from 'next/navigation';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendWelcomePelerin } from '@/lib/email';

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

  // Envoyer email de bienvenue (fire-and-forget)
  sendWelcomePelerin(email, fullName).catch(() => {});

  if (refCode) {
    console.log(`[parrainage] Nouvel inscrit ${email} parrainé par code ${refCode}`);
    // TODO: créer une entrée Referral en base quand Stripe est actif
  }

  // Rediriger vers connexion avec message de succès
  redirect(refCode ? `/connexion?registered=1&ref=${refCode}` : '/connexion?registered=1');
}

export async function signout() {
  redirect('/connexion');
}
