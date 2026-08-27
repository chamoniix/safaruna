'use server';

import { cookies } from 'next/headers';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { after } from 'next/server';
import { createAdminToken, readVerifiedAdminToken } from '@/lib/admin-auth';
import { sendAdminLoginAlert } from '@/lib/email';
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
  const encodedCity = values.get('x-vercel-ip-city')
  let city = encodedCity
  if (encodedCity) {
    try { city = decodeURIComponent(encodedCity) } catch { city = encodedCity }
  }
  return {
    context: {
      ip: (values.get('x-forwarded-for')?.split(',')[0]?.trim() || values.get('x-real-ip') || 'unknown').slice(0, 64),
      country: values.get('x-vercel-ip-country')?.slice(0, 32) || null,
      city: city?.slice(0, 100) || null,
      device: device(userAgent),
      browser: browser(userAgent),
      userAgent: userAgent.slice(0, 500),
    },
    requestId: (values.get('x-request-id') || values.get('x-vercel-id') || randomUUID()).slice(0, 160),
  }
}

async function logAttempt(email: string, success: boolean, reason: string, context: Awaited<ReturnType<typeof requestContext>>['context']) {
  await prisma.adminLoginAttempt.create({
    data: { email: email.slice(0, 254), success, reason, ...context },
  }).catch(() => {})
}

function timingSafeMatch(value: string, expected: string) {
  const valueBuffer = Buffer.from(value)
  const expectedBuffer = Buffer.from(expected)
  return valueBuffer.length === expectedBuffer.length && timingSafeEqual(valueBuffer, expectedBuffer)
}

export async function adminLogin(formData: FormData) {
  const email    = (formData.get('email')    as string)?.trim().toLowerCase();
  const password = (formData.get('password') as string)?.trim();
  const { context, requestId } = await requestContext();

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
  } else {
    const bootstrap = email === (process.env.SUPERADMIN_ACCOUNT_EMAIL || 'superadmin@safaruma.com').trim().toLowerCase()
      ? { password: process.env.SUPERADMIN_ACCOUNT_PASSWORD, role: 'SUPERADMIN' as const, name: 'Superadmin SAFARUMA' }
      : email === (process.env.ADMIN_ACCOUNT_EMAIL || 'admin@safaruma.com').trim().toLowerCase()
        ? { password: process.env.ADMIN_ACCOUNT_PASSWORD, role: 'ADMIN' as const, name: 'Admin SAFARUMA' }
        : null

    if (bootstrap?.password && timingSafeMatch(password, bootstrap.password)) {
      const passwordHash = await bcrypt.hash(password, 12)
      authenticatedAccount = await prisma.$transaction(async tx => {
        const created = await tx.adminAccount.create({
          data: { email, name: bootstrap.name, passwordHash, role: bootstrap.role, status: 'ACTIVE' },
        })
        await tx.auditLog.create({
          data: {
            actor: email,
            actorRole: bootstrap.role,
            actorAdminId: created.id,
            action: 'ADMIN_ACCOUNT_BOOTSTRAPPED',
            target: created.id,
          },
        })
        return created
      })
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

  const loginDate = new Date().toLocaleString('fr-FR', { timeZone: 'Asia/Riyadh' })
  after(async () => {
    let action = 'ADMIN_LOGIN_ALERT_EMAIL_SENT'
    try {
      await sendAdminLoginAlert({
        to: authenticatedAccount.email,
        name: authenticatedAccount.name || '',
        role: authenticatedAccount.role,
        context: {
          date: loginDate,
          ip: context.ip,
          country: context.country,
          city: context.city,
          device: context.device,
          browser: context.browser,
        },
      })
    } catch (error) {
      action = 'ADMIN_LOGIN_ALERT_EMAIL_FAILED'
      console.error('[admin-login-alert-email]', error)
    }

    await prisma.auditLog.create({
      data: {
        actor: authenticatedAccount.email,
        actorRole: authenticatedAccount.role,
        actorAdminId: authenticatedAccount.id,
        action,
        target: authenticatedAccount.id,
        detail: JSON.stringify({
          request: {
            country: context.country,
            city: context.city,
            device: context.device,
            browser: context.browser,
          },
        }),
        ip: context.ip,
        userAgent: context.userAgent,
        requestId,
      },
    }).catch(error => console.error('[admin-login-alert-audit]', error))
  })

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
