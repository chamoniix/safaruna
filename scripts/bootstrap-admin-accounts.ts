import bcrypt from 'bcryptjs'
import prisma from '../src/lib/prisma'

type BootstrapAccount = {
  email: string
  password: string | undefined
  role: 'SUPERADMIN' | 'ADMIN'
  name: string
}

async function main() {
  const accounts: BootstrapAccount[] = [
    {
      email: (process.env.SUPERADMIN_ACCOUNT_EMAIL || 'superadmin@safaruma.com').trim().toLowerCase(),
      password: process.env.SUPERADMIN_ACCOUNT_PASSWORD,
      role: 'SUPERADMIN',
      name: 'Superadmin SAFARUMA',
    },
    {
      email: (process.env.ADMIN_ACCOUNT_EMAIL || 'admin@safaruma.com').trim().toLowerCase(),
      password: process.env.ADMIN_ACCOUNT_PASSWORD,
      role: 'ADMIN',
      name: 'Admin SAFARUMA',
    },
  ]

  const missing = accounts.filter(account => !account.password).map(account => `${account.role}_ACCOUNT_PASSWORD`)
  if (missing.length) throw new Error(`Variables manquantes : ${missing.join(', ')}`)

  for (const account of accounts) {
    const passwordHash = await bcrypt.hash(account.password!, 12)
    await prisma.adminAccount.upsert({
      where: { email: account.email },
      update: { name: account.name, role: account.role, status: 'ACTIVE', passwordHash },
      create: { email: account.email, name: account.name, role: account.role, status: 'ACTIVE', passwordHash },
    })
    console.log(`${account.role} initialisé : ${account.email}`)
  }
}

main()
  .catch(error => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
