import prisma from '../src/lib/prisma'

async function main() {
  const guides = await prisma.user.findMany({
    where: { role: 'GUIDE', guideProfile: { isNot: null } },
    include: { guideProfile: { select: { id: true, guideAccountId: true, status: true } } },
  })

  for (const guide of guides) {
    if (!guide.email || !guide.guideProfile) continue
    const status = guide.guideProfile.status === 'SUSPENDED' ? 'SUSPENDED' : 'ACTIVE'
    const account = await prisma.guideAccount.upsert({
      where: { email: guide.email.toLowerCase() },
      update: {
        passwordHash: guide.passwordHash,
        emailVerified: guide.emailVerified,
        displayName: guide.name,
        firstName: guide.firstName,
        lastName: guide.lastName,
        phoneWhatsapp: guide.phoneWhatsapp,
        country: guide.country,
        image: guide.image,
        legacyUserId: guide.id,
        registeredAt: guide.createdAt,
        status,
      },
      create: {
        email: guide.email.toLowerCase(),
        passwordHash: guide.passwordHash,
        emailVerified: guide.emailVerified,
        displayName: guide.name,
        firstName: guide.firstName,
        lastName: guide.lastName,
        phoneWhatsapp: guide.phoneWhatsapp,
        country: guide.country,
        image: guide.image,
        legacyUserId: guide.id,
        registeredAt: guide.createdAt,
        status,
      },
    })
    if (guide.guideProfile.guideAccountId !== account.id) {
      await prisma.guideProfile.update({ where: { id: guide.guideProfile.id }, data: { guideAccountId: account.id } })
    }
    console.log(`GuideAccount synchronisé : ${guide.email}`)
  }
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
