import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const guide = await prisma.guideProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            name: true, firstName: true,
            lastName: true, image: true, email: true,
          },
        },
        packages: true,
        places: { where: { isActive: true } },
      },
    })

    if (!guide)
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })

    const placePrices = await prisma.placePrice.findMany()
    const priceMap: Record<string, number> = {}
    placePrices.forEach(p => { priceMap[p.placeKey] = p.price })

    const name =
      guide.user.name ||
      `${guide.user.firstName ?? ''} ${guide.user.lastName ?? ''}`.trim()

    return NextResponse.json({
      guide: {
        id: guide.id,
        slug: guide.slug,
        name,
        city: guide.city,
        bio: guide.bio,
        image: guide.user.image || null,
        status: guide.status,
      },
      activePlaces: guide.places.map(p => p.placeKey),
      placePrices: priceMap,
      packages: guide.packages.map(p => ({
        id: p.id,
        name: p.name,
        pricePerPerson: p.pricePerPerson,
        durationDays: p.durationDays,
      })),
    })
  } catch (err) {
    console.error('[guide/public/slug GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
