import prisma from '../src/lib/prisma'

async function main() {
  const profiles = await prisma.guideProfile.findMany({
    select: {
      id: true,
      slug: true,
      guideAccountId: true,
      guideAccount: { select: { id: true, email: true } },
    },
  })

  const orphanProfiles = profiles.filter(profile => !profile.guideAccountId || !profile.guideAccount)
  if (orphanProfiles.length > 0) {
    throw new Error(`Profils sans GuideAccount : ${orphanProfiles.map(profile => profile.slug || profile.id).join(', ')}`)
  }

  for (const profile of profiles) console.log(`GuideAccount vérifié : ${profile.guideAccount!.email}`)
}

main()
  .catch(error => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
