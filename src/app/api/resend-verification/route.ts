import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const email = session.user.email

  // Limite : max 3 renvois dans la dernière heure
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
  const recentTokens = await prisma.emailVerificationToken.count({
    where: { email, createdAt: { gte: oneHourAgo } },
  })
  if (recentTokens >= 3) {
    return NextResponse.json(
      { error: 'Trop de renvois. Réessayez dans une heure.' },
      { status: 429 }
    )
  }

  // Créer un nouveau token
  const token = crypto.randomUUID()
  await prisma.emailVerificationToken.create({
    data: {
      token,
      email,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  })

  const name = session.user.name || email
  await sendEmail({
    to: { email, name },
    subject: 'Confirmez votre adresse email — SAFARUMA',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1A1209;">Confirmez votre email 🕋</h2>
        <p>Cliquez sur le bouton ci-dessous pour confirmer votre adresse email.</p>
        <a href="https://safaruma.com/verify-email?token=${token}"
           style="display: inline-block; background: #C9A84C;
           color: #1A1209; padding: 0.85rem 2rem; border-radius: 50px;
           font-weight: 700; text-decoration: none; margin: 1.5rem 0;">
          Confirmer mon adresse email
        </a>
        <p style="color: #7A6D5A; font-size: 0.85rem;">
          Ce lien expire dans 24h.
        </p>
      </div>
    `,
  })

  return NextResponse.json({ success: true })
}
