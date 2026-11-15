import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { centsToEuros, publicGuideServicePriceCents } from '@/lib/guide-pricing'
import { getPlatformPricing } from '@/lib/platform-pricing'
import { getEffectivePlaceCatalog, publicPlaceCatalog } from '@/lib/place-catalog'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const [guide, pricing, placeCatalog] = await Promise.all([
      prisma.guideProfile.findFirst({
        where: { slug, status: 'ACTIVE' },
        include: {
          guideAccount: {
            select: {
              displayName: true, firstName: true,
              lastName: true, image: true, email: true,
            },
          },
          packages: true,
          places: { where: { isActive: true } },
        },
      }),
      getPlatformPricing(),
      getEffectivePlaceCatalog(),
    ])

    if (!guide || !guide.guideAccount)
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 })

    const name =
      guide.guideAccount.displayName ||
      `${guide.guideAccount.firstName ?? ''} ${guide.guideAccount.lastName ?? ''}`.trim()

    return NextResponse.json({
      guide: {
        id: guide.id,
        slug: guide.slug,
        name,
        city: guide.city,
        gender: guide.gender,
        servesMakkah: guide.servesMakkah,
        servesMadinah: guide.servesMadinah,
        bio: guide.bio,
        image: guide.guideAccount.image || null,
        status: guide.status,
        acceptingBookings: guide.acceptingBookings,
        bookable: guide.acceptingBookings && (guide.servesMakkah || guide.servesMadinah),
        prices: {
          makkah: {
            group1To4: centsToEuros(publicGuideServicePriceCents(4)),
            group5To14: centsToEuros(publicGuideServicePriceCents(14)),
            group15Plus: centsToEuros(publicGuideServicePriceCents(15)),
          },
          madinah: {
            group1To4: centsToEuros(publicGuideServicePriceCents(4)),
            group5To14: centsToEuros(publicGuideServicePriceCents(14)),
            group15Plus: centsToEuros(publicGuideServicePriceCents(15)),
          },
        },
      },
      activePlaces: guide.places.map(p => p.placeKey).filter(key => placeCatalog.some(place => place.key === key && place.isActive)),
      placeCatalog: publicPlaceCatalog(placeCatalog, pricing.guideServiceMarkupBps),
      pricing,
      placePrices: {},
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
