import { randomInt } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { sendGuideEmailChangeCode } from '@/lib/email'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { requireGuide } from '@/lib/require-account'
import { checkRateLimitKey, guideAuthRatelimit } from '@/lib/ratelimit'

const requestSchema = z.object({
  newEmail: z.string().trim().toLowerCase().email().max(254),
  currentPassword: z.string().min(1).max(1024),
})

const EMAIL_ALREADY_USED = 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.'

export async function POST(req: NextRequest) {
  const access = await requireGuide()
  if (!access.ok) return access.response
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Requête non autorisée.' }, { status: 403 })
  }

  const context = getGuideRequestContext(req)
  const limited = await checkRateLimitKey(guideAuthRatelimit, `${context.ip}:${access.actor.id}:email-change`)
  if (limited) return limited

  const parsed = requestSchema.safeParse(await req.json().catch(() => null))
  if (!parsed.success) {
    return NextResponse.json({ error: 'Vérifiez l’adresse et le mot de passe saisis.' }, { status: 400 })
  }

  const { newEmail, currentPassword } = parsed.data
  if (newEmail === access.actor.email.toLowerCase()) {
    return NextResponse.json({ error: 'Cette adresse est déjà celle de votre compte.' }, { status: 400 })
  }

  const account = await prisma.guideAccount.findUnique({
    where: { id: access.actor.id },
    select: { id: true, passwordHash: true, displayName: true, firstName: true },
  })
  const passwordValid = account?.passwordHash
    ? await bcrypt.compare(currentPassword, account.passwordHash)
    : false
  if (!account || !passwordValid) {
    return NextResponse.json({ error: 'Mot de passe actuel incorrect.' }, { status: 401 })
  }

  const now = new Date()
  await prisma.emailIdentity.deleteMany({ where: { email: newEmail, quarantinedUntil: { lte: now } } })
  const [identity, user, guideAccount, activeApplication] = await Promise.all([
    prisma.emailIdentity.findUnique({ where: { email: newEmail }, select: { kind: true } }),
    prisma.user.findUnique({ where: { email: newEmail }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email: newEmail }, select: { id: true } }),
    prisma.guideApplication.findFirst({
      where: { email: newEmail, status: { in: ['PENDING', 'IN_REVIEW', 'APPROVED'] } },
      select: { id: true },
    }),
  ])
  if (identity || user || guideAccount || activeApplication) {
    return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 })
  }

  const code = randomInt(0, 1_000_000).toString().padStart(6, '0')
  const codeHash = await bcrypt.hash(code, 12)
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000)

  const changeRequest = await prisma.$transaction(async tx => {
    await tx.guideEmailChangeRequest.updateMany({
      where: { guideAccountId: account.id, usedAt: null },
      data: { usedAt: now },
    })
    return tx.guideEmailChangeRequest.create({
      data: { guideAccountId: account.id, newEmail, codeHash, expiresAt },
      select: { id: true },
    })
  })

  try {
    await sendGuideEmailChangeCode({
      to: newEmail,
      name: account.displayName || account.firstName || 'Guide',
      code,
    })
  } catch (error) {
    console.error('[guide-email-change-request-email]', error)
    await prisma.guideEmailChangeRequest.updateMany({
      where: { id: changeRequest.id, usedAt: null },
      data: { usedAt: new Date() },
    }).catch(() => {})
    return NextResponse.json({ error: 'Envoi temporairement indisponible.' }, { status: 503 })
  }

  return NextResponse.json({ success: true, requestId: changeRequest.id })
}
