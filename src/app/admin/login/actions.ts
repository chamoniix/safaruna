'use server';

import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { createAdminToken, readVerifiedAdminToken } from '@/lib/admin-auth';
import { createHash, randomUUID, timingSafeEqual } from 'crypto';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { adminAuthRatelimit } from '@/lib/ratelimit';

function device(userAgent: string) {
  if (/ipad|tablet|kindle|silk/i.test(userAgent)) return 'TABLET'
  if (/mobi|iphone|ipod|android/i.test(userAgent)) return 'MOBILE'
  return userAgent ? 'DESKTOP' : 'UNKNOWN'
}

function browser(userAgent: string) {
  if (/Edg\//i.test(userAgent)) return 'Edge'
  if (/Firefox\//i.test(userAgent)) return 'Firefox'
  if (/CriOS|Chrome\//i.test(userAgent)) return 'Chrome'
  if (/Safari\//i.test(userAgent)) return 'Safari'
  return userAgent ? 'Autre' : 'Inconnu'
}

async function requestContext() {
  const values = await headers()
  const userAgent = values.get('user-agent') || ''
  return {
    ip: values.get('x-forwarded-for')?.split(',')[0]?.trim() || values.get('x-real-ip') || 'unknown',
    country: values.get('x-vercel-ip-country'),
    city: values.get('x-vercel-ip-city'),
    device: device(userAgent),
    browser: browser(userAgent),
    userAgent: userAgent.slice(0, 500),
  }
}

async function logAttempt(email: string, success: boolean, reason: string, context: Awaited<ReturnType<typeof requestContext>>) {
  await prisma.adminLoginAttempt.create({
    data: { email: email.slice(0, 254), success, reason, ...context },
  }).catch(() => {})
}

export async function adminLogin(formData: FormData) {
  const email    = (formData.get('email')    as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string)?.trim();
  const context = await requestContext();

  const validEmail    = process.env.ADMIN_EMAIL;
  const validPassword = process.env.ADMIN_PASSWORD;
  const secret        = process.env.ADMIN_JWT_SECRET;

  if (!email || !password || !secret) {
    await logAttempt(email || 'missing', false, 'INVALID_INPUT', context)
    redirect('/admin/login?error=1');
  }

  if (adminAuthRatelimit) {
    const rate = await adminAuthRatelimit.limit(`${context.ip}:${email}`)
    if (!rate.success) {
      await logAttempt(email, false, 'RATE_LIMITED', context)
      redirect('/admin/login?error=rate-limit')
    }
  }

  const account = await prisma.adminAccount.findUnique({ where: { email } })
  let authenticatedAccount = null as typeof account

  if (account) {
    const valid = account.status === 'ACTIVE' && Boolean(account.passwordHash)
      && await bcrypt.compare(password, account.passwordHash!)
    if (valid) authenticatedAccount = account
  } else if (validEmail && validPassword) {
    // Compatibilité temporaire avec le compte partagé pendant la migration.
    const emailBuf = Buffer.from(email)
    const validEmailBuf = Buffer.from(validEmail.toLowerCase())
    const passBuf = Buffer.from(password)
    const validPassBuf = Buffer.from(validPassword)
    const emailMatch = emailBuf.length === validEmailBuf.length && timingSafeEqual(emailBuf, validEmailBuf)
    const passMatch = passBuf.length === validPassBuf.length && timingSafeEqual(passBuf, validPassBuf)
    if (emailMatch && passMatch) {
      const token = await createAdminToken(email, secret)
      const store = await cookies()
      store.set('admin_session', token, {
        httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 8 * 3600, path: '/', priority: 'high',
      })
      await logAttempt(email, true, 'LEGACY_SUCCESS', context)
      redirect('/admin/tableau-de-bord')
    }
  }

  if (!authenticatedAccount) {
    await logAttempt(email, false, account?.status === 'SUSPENDED' ? 'ACCOUNT_SUSPENDED' : 'INVALID_CREDENTIALS', context)
    redirect('/admin/login?error=1');
  }

  const sessionId = randomUUID()
  const token = await createAdminToken(email, secret, {
    adminId: authenticatedAccount.id,
    sessionId,
    role: authenticatedAccount.role,
  });
  const expiresAt = new Date(Date.now() + 8 * 3600 * 1000)
  await prisma.$transaction([
    prisma.adminSession.create({
      data: {
        id: sessionId,
        tokenHash: createHash('sha256').update(token).digest('hex'),
        adminAccountId: authenticatedAccount.id,
        expiresAt,
        ...context,
      },
    }),
    prisma.adminAccount.update({ where: { id: authenticatedAccount.id }, data: { lastLoginAt: new Date() } }),
    prisma.adminLoginAttempt.create({ data: { email, success: true, reason: 'SUCCESS', ...context } }),
  ])
  const store = await cookies();
  store.set('admin_session', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   8 * 3600,
    path:     '/',
    priority: 'high',
  });

  redirect('/admin/tableau-de-bord');
}

export async function adminLogout() {
  const store = await cookies();
  const token = store.get('admin_session')?.value
  const secret = process.env.ADMIN_JWT_SECRET
  if (token && secret) {
    const payload = await readVerifiedAdminToken(token, secret)
    if (payload?.sessionId) {
      await prisma.adminSession.updateMany({
        where: { id: payload.sessionId, revokedAt: null },
        data: { revokedAt: new Date() },
      }).catch(() => {})
    }
  }
  store.delete('admin_session');
  redirect('/admin/login');
}
