import prisma from '../src/lib/prisma'
import bcrypt from 'bcryptjs'

async function main() {
  const email = 'naim@safaruma.com'
  const hash  = await bcrypt.hash('Guide2025!', 10)

  const user = await prisma.user.upsert({
    where: { email },
    update: { passwordHash: hash },
    create: {
      email,
      name: 'Naim Laamari',
      firstName: 'Naim',
      lastName: 'Laamari',
      role: 'GUIDE',
      passwordHash: hash,
    },
  })

  // Create GuideProfile if missing
  const existing = await prisma.guideProfile.findUnique({ where: { userId: user.id } })
  if (!existing) {
    await prisma.guideProfile.create({
      data: {
        userId: user.id,
        slug: 'naim-laamari',
        status: 'ACTIVE',
      },
    })
    console.log('  → Profil guide créé (slug: naim-laamari)')
  }

  console.log(`✅ Mot de passe mis à jour pour ${email} (id: ${user.id})`)
  await prisma.$disconnect()
}

main()
