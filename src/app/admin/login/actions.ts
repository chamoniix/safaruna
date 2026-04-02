'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminToken } from '@/lib/admin-auth';

export async function adminLogin(formData: FormData) {
  const email    = (formData.get('email')    as string)?.trim();
  const password = (formData.get('password') as string)?.trim();

  const validEmail    = process.env.ADMIN_EMAIL    ?? '';
  const validPassword = process.env.ADMIN_PASSWORD ?? '';
  const secret        = process.env.ADMIN_JWT_SECRET ?? '';

  if (email !== validEmail || password !== validPassword) {
    redirect('/admin/login?error=1');
  }

  const token = await createAdminToken(email, secret);
  const store = await cookies();

  store.set('admin_session', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'lax',
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
