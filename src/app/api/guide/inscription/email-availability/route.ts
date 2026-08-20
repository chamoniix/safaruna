import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit'

const firstStepSchema = z.object({
  firstName: z.string().trim().min(1).max(50),
  lastName: z.string().trim().min(1).max(50),
  email: z.string().trim().toLowerCase().email().max(254),
  whatsapp: z.string().trim().min(1).max(20),
})

const EMAIL_ALREADY_USED = 'Adresse e-mail déjà utilisée. Veuillez en utiliser une autre.'

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, apiRatelimit)
  if (limited) return limited

  const parsed = firstStepSchema.safeParse(await req.json())
  if (!parsed.success) {
    return NextResponse.json({ error: 'Vérifiez les informations saisies.' }, { status: 400 })
  }

  const { email } = parsed.data
  const [identity, user, guideAccount, activeApplication] = await Promise.all([
    prisma.emailIdentity.findUnique({ where: { email }, select: { kind: true } }),
    prisma.user.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email }, select: { id: true } }),
    prisma.guideApplication.findFirst({
      where: { email, status: { in: ['PENDING', 'IN_REVIEW', 'APPROVED'] } },
      select: { id: true },
    }),
  ])

  if (identity || user || guideAccount || activeApplication) {
    return NextResponse.json({ error: EMAIL_ALREADY_USED }, { status: 409 })
  }

  return NextResponse.json({ available: true, email })
}
