import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { sendPasswordReset } from '@/lib/email'
import { authRatelimit, checkRateLimit } from '@/lib/ratelimit'
import crypto from 'crypto'

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, authRatelimit)
  if (limited) return limited

  try {
    const { email } = await req.json()
    if (!email) return NextResponse.json({ error: 'Email requis' }, { status: 400 })

    // Vérifier si l'utilisateur existe
    const user = await prisma.user.findUnique({ where: { email } })

    // Toujours retourner succès pour ne pas révéler si l'email existe
    if (!user) {
      return NextResponse.json({ success: true })
    }

    // Générer un token unique
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 heure

    // Supprimer les anciens tokens pour cet email
    await prisma.passwordResetToken.deleteMany({ where: { email } })

    // Créer le nouveau token
    await prisma.passwordResetToken.create({
      data: { email, token, expiresAt },
    })

    // Envoyer l'email
    const baseUrl = process.env.NEXTAUTH_URL || 'https://safaruma.com'
    const resetUrl = `${baseUrl}/reinitialiser-mot-de-passe?token=${token}`
    await sendPasswordReset({
      to: email,
      name: user.firstName || user.name || '',
      resetUrl,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[forgot-password]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
