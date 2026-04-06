import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const userId = (session.user as any).id
  if (!userId) return NextResponse.json({ error: 'userId manquant' }, { status: 400 })

  const DEMO_NOTIFS = [
    {
      type: 'guide',
      title: 'Naïm LAAMARI a accepté votre demande',
      message: 'Votre guide officiel SAFARUMA est confirmé pour le 10 juin 2026. Il vous contactera sous 2h.',
    },
    {
      type: 'reminder',
      title: 'Votre Omra est dans 14 jours',
      message: 'Checklist : il vous reste 6 étapes à compléter avant le départ. Préparez votre tenue d\'Ihram.',
    },
    {
      type: 'spiritual',
      title: 'N\'attendez pas que tout soit parfait',
      message: 'La Omra n\'attend pas la perfection. Peut-être que c\'est ce voyage qui sera la cause de votre transformation. Réservez dès maintenant.',
    },
    {
      type: 'promo',
      title: 'Ramadan 2026 — Places limitées',
      message: 'Il reste 3 créneaux disponibles avec Rachid Al-Madani pour Ramadan. Les guides SAFARUMA sont très demandés en cette période bénie.',
    },
    {
      type: 'academy',
      title: 'Nouveau module disponible',
      message: 'Le module "Comprendre le Tawaf" vient d\'être publié par Cheikh Rachid. 32 minutes pour préparer ce rituel essentiel.',
    },
  ]

  // Supprimer les notifs démo existantes pour cet user
  await prisma.notification.deleteMany({ where: { userId } })

  // Créer les nouvelles
  await prisma.notification.createMany({
    data: DEMO_NOTIFS.map((n, i) => ({
      userId,
      type: n.type,
      title: n.title,
      message: n.message,
      readAt: i > 2 ? new Date() : null, // Les 3 premières non lues
      createdAt: new Date(Date.now() - i * 3600000), // Décalées d'1h chacune
    })),
  })

  return NextResponse.json({ success: true, count: DEMO_NOTIFS.length })
}
