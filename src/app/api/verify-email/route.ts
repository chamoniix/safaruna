import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function POST(req: NextRequest) {
  const { token } = await req.json()
  if (!token) {
    return NextResponse.json({ error: 'Token manquant' }, { status: 400 })
  }

  const record = await prisma.emailVerificationToken.findUnique({
    where: { token },
  })

  if (!record) {
    return NextResponse.json({ error: 'Token invalide' }, { status: 400 })
  }

  if (record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.delete({ where: { token } })
    return NextResponse.json({ error: 'Token expiré' }, { status: 400 })
  }

  await prisma.user.update({
    where: { email: record.email },
    data: { emailVerified: new Date() },
  })

  await prisma.emailVerificationToken.delete({ where: { token } })

  return NextResponse.json({ success: true })
}
