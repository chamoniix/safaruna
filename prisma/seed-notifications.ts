import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Trouver le premier utilisateur PELERIN
  const user = await prisma.user.findFirst({ where: { role: 'PELERIN' } })
  if (!user) { console.log('Aucun pèlerin trouvé'); return; }

  await prisma.notification.deleteMany({ where: { userId: user.id } })

  await prisma.notification.createMany({
    data: [
      { userId: user.id, type: 'guide', title: 'Naïm LAAMARI a accepté votre demande', message: 'Votre guide officiel SAFARUMA est confirmé pour le 10 juin 2026. Il vous contactera sous 2h.', readAt: null },
      { userId: user.id, type: 'reminder', title: 'Votre Omra est dans 14 jours', message: 'Checklist : il vous reste 6 étapes à compléter avant le départ.', readAt: null },
      { userId: user.id, type: 'spiritual', title: 'N\'attendez pas que tout soit parfait', message: 'Peut-être que c\'est ce voyage qui sera la cause de votre transformation. Réservez dès maintenant.', readAt: null },
      { userId: user.id, type: 'promo', title: 'Ramadan 2026 — Places limitées', message: 'Il reste 3 créneaux disponibles avec Rachid Al-Madani pour Ramadan.', readAt: new Date() },
      { userId: user.id, type: 'academy', title: 'Nouveau module disponible', message: 'Le module "Comprendre le Tawaf" vient d\'être publié. 32 minutes pour préparer ce rituel essentiel.', readAt: new Date() },
    ],
  })

  console.log(`5 notifications créées pour ${user.email}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
