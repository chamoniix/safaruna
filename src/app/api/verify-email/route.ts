import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendEmail } from '@/lib/email'

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

  // Email de bienvenue envoyé après confirmation
  const user = await prisma.user.findUnique({
    where: { email: record.email },
  })

  sendEmail({
    to: {
      email: record.email,
      name: user?.firstName
        ? `${user.firstName} ${user.lastName ?? ''}`
        : record.email,
    },
    subject: 'Bienvenue sur SAFARUMA — Votre compte est activé 🕋',
    html: `
      <div style="font-family: Arial, sans-serif;
        max-width: 480px; margin: 0 auto;">
        <h2 style="color: #1A1209;">
          Bienvenue ${user?.firstName ?? ''} !
        </h2>
        <p>Votre adresse email a été confirmée.
           Votre compte pèlerin est maintenant actif.</p>
        <div style="margin: 1.5rem 0;">
          <p style="margin: 0.5rem 0;">
            <strong>Étape 1</strong> — Complétez votre profil
          </p>
          <p style="margin: 0.5rem 0;">
            <strong>Étape 2</strong> — Trouvez votre guide
          </p>
          <p style="margin: 0.5rem 0;">
            <strong>Étape 3</strong> — Réservez votre voyage
          </p>
        </div>
        <a href="https://safaruma.com/espace/tableau-de-bord"
           style="display: inline-block;
           background: #C9A84C; color: #1A1209;
           padding: 0.85rem 2rem; border-radius: 50px;
           font-weight: 700; text-decoration: none;">
          Accéder à mon espace
        </a>
      </div>
    `,
  }).catch(() => {})

  return NextResponse.json({ success: true })
}
