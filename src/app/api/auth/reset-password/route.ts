import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { authRatelimit, checkRateLimit } from '@/lib/ratelimit'

export async function POST(req: NextRequest) {
  const limited = await checkRateLimit(req, authRatelimit)
  if (limited) return limited

  try {
    const { token, password } = await req.json()
    if (!token || !password) return NextResponse.json({ error: 'Token et mot de passe requis' }, { status: 400 })
    if (password.length < 8) return NextResponse.json({ error: 'Mot de passe trop court (8 caractères minimum)' }, { status: 400 })

    // Vérifier le token
    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })

    if (!resetToken) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 })
    if (resetToken.usedAt) return NextResponse.json({ error: 'Ce lien a déjà été utilisé' }, { status: 400 })
    if (new Date() > resetToken.expiresAt) return NextResponse.json({ error: 'Ce lien a expiré. Faites une nouvelle demande.' }, { status: 400 })

    // Mettre à jour le mot de passe
    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash },
    })

    // Marquer le token comme utilisé
    await prisma.passwordResetToken.update({
      where: { token },
      data: { usedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[reset-password]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
