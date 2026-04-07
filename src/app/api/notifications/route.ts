import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

// GET — récupérer les notifications de l'utilisateur connecté
export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const userId = (session.user as any).id
  if (!userId) return NextResponse.json({ notifications: [] })

  const notifications = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json({ notifications })
}

// PATCH — marquer une ou toutes les notifications comme lues
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const userId = (session.user as any).id
  const { id, all } = await req.json()

  if (all) {
    await prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date() },
    })
  } else if (id) {
    // Vérifier que la notification appartient bien à l'utilisateur connecté
    await prisma.notification.updateMany({
      where: { id, userId },
      data: { readAt: new Date() },
    })
  }

  return NextResponse.json({ success: true })
}
