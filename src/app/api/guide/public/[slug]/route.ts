import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { centsToEuros, guideServiceRetailCents } from '@/lib/guide-pricing'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  try {
    const guide = await prisma.guideProfile.findFirst({
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
    })

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
            upTo6: centsToEuros(guideServiceRetailCents(guide, 'MAKKAH', 6)),
            upTo15: centsToEuros(guideServiceRetailCents(guide, 'MAKKAH', 15)),
            upTo32: centsToEuros(guideServiceRetailCents(guide, 'MAKKAH', 32)),
          },
          madinah: {
            upTo6: centsToEuros(guideServiceRetailCents(guide, 'MADINAH', 6)),
            upTo15: centsToEuros(guideServiceRetailCents(guide, 'MADINAH', 15)),
            upTo32: centsToEuros(guideServiceRetailCents(guide, 'MADINAH', 32)),
          },
        },
      },
      activePlaces: guide.places.map(p => p.placeKey),
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
