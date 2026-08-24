import bcrypt from 'bcryptjs'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendGuideEmailChanged } from '@/lib/email'
import { getGuideRequestContext, GUIDE_SESSION_COOKIE, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { requireGuide } from '@/lib/require-account'
import { checkRateLimitKey, guideAuthRatelimit } from '@/lib/ratelimit'

const confirmSchema = z.object({
  requestId: z.string().min(1).max(100),
  code: z.string().regex(/^\d{6}$/),
})

const EMAIL_ALREADY_USED = 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.'

export async function POST(req: NextRequest) {
  const access = await requireGuide()
  if (!access.ok) return access.response
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Requête non autorisée.' }, { status: 403 })
  }

  const context = getGuideRequestContext(req)
  const limited = await checkRateLimitKey(guideAuthRatelimit, `${context.ip}:${access.actor.id}:email-confirm`)
  if (limited) return limited

  const parsed = confirmSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: 'Code invalide.' }, { status: 400 })

  const request = await prisma.guideEmailChangeRequest.findUnique({
    where: { id: parsed.data.requestId },
    include: { guideAccount: { select: { id: true, email: true, displayName: true, firstName: true, guideProfile: { select: { id: true } } } } },
  })
  const now = new Date()
  if (
    !request
    || request.guideAccountId !== access.actor.id
    || request.usedAt
    || request.expiresAt <= now
    || request.attempts >= 5
  ) {
    return NextResponse.json({ error: 'Code invalide ou expiré.' }, { status: 400 })
  }

  const codeValid = await bcrypt.compare(parsed.data.code, request.codeHash)
  if (!codeValid) {
    await prisma.guideEmailChangeRequest.updateMany({
      where: { id: request.id, usedAt: null, attempts: { lt: 5 } },
      data: { attempts: { increment: 1 } },
    })
    return NextResponse.json({ error: 'Code invalide ou expiré.' }, { status: 400 })
  }

  const newEmail = request.newEmail.toLowerCase()
  const oldEmail = request.guideAccount.email.toLowerCase()
  await prisma.emailIdentity.deleteMany({ where: { email: newEmail, quarantinedUntil: { lte: now } } })
  const [oldIdentity, identity, user, guideAccount, activeApplication] = await Promise.all([
    prisma.emailIdentity.findUnique({ where: { email: oldEmail }, select: { kind: true } }),
    prisma.emailIdentity.findUnique({ where: { email: newEmail }, select: { kind: true } }),
    prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email: newEmail }, select: { id: true } }),
    prisma.guideApplication.findFirst({
      where: { email: newEmail, status: { in: ['PENDING', 'IN_REVIEW', 'APPROVED'] } },
      select: { id: true },
    }),
  ])
  if (oldIdentity?.kind !== 'GUIDE') {
    return NextResponse.json({ error: 'Identité du compte incohérente. Contactez SAFARUMA.' }, { status: 409 })
  }
  if (identity || user || guideAccount || activeApplication) {
    return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 })
  }

  const releasedAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
  try {
    await prisma.$transaction(async tx => {
      const claimed = await tx.guideEmailChangeRequest.updateMany({
        where: { id: request.id, usedAt: null, expiresAt: { gt: now }, attempts: { lt: 5 } },
        data: { usedAt: now },
      })
      if (claimed.count !== 1) throw new Error('EMAIL_CHANGE_ALREADY_USED')

      await tx.emailIdentity.update({
        where: { email: oldEmail },
        data: { quarantinedUntil: releasedAt, sourceGuideAccountId: request.guideAccountId },
      })
      await tx.emailIdentity.create({ data: { email: newEmail, kind: 'GUIDE' } })
      await tx.guideAccount.update({
        where: { id: request.guideAccountId },
        data: { email: newEmail, emailVerified: now },
      })
      if (request.guideAccount.guideProfile) {
        await tx.guideApplication.updateMany({
          where: {
            createdGuideProfileId: request.guideAccount.guideProfile.id,
            status: 'APPROVED',
          },
          data: { email: newEmail },
        })
      }
      await tx.guideSession.updateMany({
        where: { guideAccountId: request.guideAccountId, revokedAt: null },
        data: { revokedAt: now },
      })
      await tx.guideEmailChangeRequest.updateMany({
        where: { guideAccountId: request.guideAccountId, id: { not: request.id }, usedAt: null },
        data: { usedAt: now },
      })
      await tx.auditLog.create({
        data: {
          actor: oldEmail,
          actorRole: 'GUIDE',
          action: 'GUIDE_EMAIL_CHANGED',
          target: request.guideAccountId,
          detail: JSON.stringify({ request: { country: context.country, city: context.city, device: context.device, browser: context.browser } }),
          ip: context.ip,
          userAgent: context.userAgent,
          before: { email: oldEmail },
          after: { email: newEmail, oldEmailQuarantinedUntil: releasedAt.toISOString() },
        },
      })
    })
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_CHANGE_ALREADY_USED') {
      return NextResponse.json({ error: 'Ce code a déjà été utilisé.' }, { status: 400 })
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 })
    }
    throw error
  }

  const securityContext = {
    date: now.toLocaleString('fr-FR', { timeZone: 'Asia/Riyadh' }),
    ip: context.ip,
    country: context.country,
    city: context.city,
    device: context.device,
    browser: context.browser,
  }
  await Promise.allSettled([
    sendGuideEmailChanged({ to: oldEmail, name: request.guideAccount.displayName || request.guideAccount.firstName || 'Guide', oldEmail, newEmail, context: securityContext }),
    sendGuideEmailChanged({ to: newEmail, name: request.guideAccount.displayName || request.guideAccount.firstName || 'Guide', oldEmail, newEmail, context: securityContext }),
  ])

  const response = NextResponse.json({ success: true })
  response.cookies.set(GUIDE_SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    expires: new Date(0),
    path: '/',
    priority: 'high',
  })
  return response
}
