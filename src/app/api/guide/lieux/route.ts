import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function getGuideProfile(session: any) {
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: { guideProfile: true }
  })
  return user?.guideProfile || null
}

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const guideProfile = await getGuideProfile(session)
  if (!guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 })

  const places = await prisma.guidePlace.findMany({
    where: { guideProfileId: guideProfile.id }
  })

  const placesMap: Record<string, boolean> = {}
  places.forEach(p => { placesMap[p.placeKey] = p.isActive })

  return NextResponse.json({ places: placesMap })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const guideProfile = await getGuideProfile(session)
  if (!guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 })

  const { placeKey } = await req.json()

  const existing = await prisma.guidePlace.findFirst({
    where: { guideProfileId: guideProfile.id, placeKey }
  })

  if (existing) {
    await prisma.guidePlace.update({
      where: { id: existing.id },
      data: { isActive: !existing.isActive }
    })
  } else {
    await prisma.guidePlace.create({
      data: {
        guideProfileId: guideProfile.id,
        placeKey,
        isActive: true,
      }
    })
  }

  return NextResponse.json({ success: true })
}
