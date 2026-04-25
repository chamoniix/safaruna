'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminToken } from '@/lib/admin-auth';
import { timingSafeEqual } from 'crypto';

export async function adminLogin(formData: FormData) {
  const email    = (formData.get('email')    as string)?.trim();
  const password = (formData.get('password') as string)?.trim();

  const validEmail    = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;
  const secret        = process.env.ADMIN_JWT_SECRET;

  // Si les variables d'environnement ne sont pas définies → refus immédiat
  if (!validEmail || !validPassword || !secret) {
    console.error('[admin] Variables ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_JWT_SECRET manquantes');
    redirect('/admin/login?error=1');
  }

  // Comparaison timing-safe pour éviter les timing attacks
  const emailBuf = Buffer.from(email || '')
  const validEmailBuf = Buffer.from(validEmail)
  const passBuf = Buffer.from(password || '')
  const validPassBuf = Buffer.from(validPassword)
  const emailMatch = emailBuf.length === validEmailBuf.length && timingSafeEqual(emailBuf, validEmailBuf)
  const passMatch = passBuf.length === validPassBuf.length && timingSafeEqual(passBuf, validPassBuf)
  if (!emailMatch || !passMatch) {
    redirect('/admin/login?error=1');
  }

  const token = await createAdminToken(email, secret);
  const store = await cookies();
  store.set('admin_session', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   8 * 3600,
    path:     '/',
  });

  redirect('/admin/tableau-de-bord');
}

export async function adminLogout() {
  const store = await cookies();
  store.delete('admin_session');
  redirect('/admin/login');
}
