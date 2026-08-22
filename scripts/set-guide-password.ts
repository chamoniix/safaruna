import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const email = 'naim@safaruma.com'
  const hash  = await bcrypt.hash('Guide2025!', 10)

  const account = await prisma.guideAccount.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: {
      email,
      displayName: 'Naim Laamari',
      firstName: 'Naim',
      lastName: 'Laamari',
      passwordHash: hash,
      guideProfile: {
        create: {
          slug: 'naim-laamari',
          status: 'ACTIVE',
        },
      },
    },
    include: { guideProfile: { select: { id: true } } },
  })

  if (!account.guideProfile) {
    await prisma.guideProfile.create({
      data: {
        guideAccountId: account.id,
        slug: 'naim-laamari',
        status: 'ACTIVE',
      },
    })
    console.log('  → Profil guide créé (slug: naim-laamari)')
  }

  console.log(`✅ Mot de passe mis à jour pour ${email} (id: ${account.id})`)
  await prisma.$disconnect()
}

main()
