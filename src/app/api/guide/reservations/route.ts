import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  const guideProfile = await prisma.guideProfile.findUnique({
    where: { userId: session.user.id },
  })
  if (!guideProfile) {
    return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 })
  }

  const reservations = await prisma.reservation.findMany({
    where: { guideProfileId: guideProfile.id },
    include: {
      pelerin: {
        select: { name: true, firstName: true, lastName: true, email: true },
      },
      package: true,
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ reservations })
}
