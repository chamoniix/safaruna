import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { centsToEuros, guideServiceRetailCents } from '@/lib/guide-pricing'
import { getPlatformPricing } from '@/lib/platform-pricing'
import { parseBookingDate } from '@/lib/guide-availability'

type ServiceCity = 'MAKKAH' | 'MADINAH' | 'BOTH'

function parseCity(value: string | null): ServiceCity | '' {
  return value === 'MAKKAH' || value === 'MADINAH' || value === 'BOTH' ? value : ''
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = parseCity(searchParams.get('city'))
  const langue = searchParams.get('langue') || ''
  const gender = searchParams.get('gender') || ''
  const startDateValue = searchParams.get('startDate')
  const endDateValue = searchParams.get('endDate')
  const startDate = parseBookingDate(startDateValue)
  const endDate = parseBookingDate(endDateValue)

  if (
    (startDateValue !== null && !startDate)
    || (endDateValue !== null && !endDate)
    || (startDate && !endDate)
    || (!startDate && endDate)
    || (startDate && endDate && endDate < startDate)
  ) {
    return NextResponse.json({ error: 'Période invalide' }, { status: 400 })
  }

  try {
    const [guides, pricing] = await Promise.all([prisma.guideProfile.findMany({
      where: {
        status: 'ACTIVE',
        acceptingBookings: true,
        ...(langue ? { languages: { some: { languageCode: langue } } } : {}),
        ...(gender === 'HOMME' || gender === 'FEMME' ? { gender } : {}),
        ...(city === 'MAKKAH' ? { servesMakkah: true } : {}),
        ...(city === 'MADINAH' ? { servesMadinah: true } : {}),
        ...(city === 'BOTH' || city === '' ? { OR: [{ servesMakkah: true }, { servesMadinah: true }] } : {}),
      },
      include: {
        guideAccount: { select: { displayName: true, firstName: true, lastName: true, image: true } },
        languages: true,
        places: { where: { isActive: true }, select: { placeKey: true } },
      },
    }), getPlatformPricing()])

    const guideIds = guides.map(guide => guide.id)
    const reviewStats = guideIds.length > 0
      ? await prisma.review.groupBy({
          by: ['guideProfileId'],
          where: { guideProfileId: { in: guideIds }, status: 'APPROVED' },
          _avg: { ratingOverall: true },
          _count: { ratingOverall: true },
        })
      : []
    const reviewStatsByGuide = new Map(reviewStats.map(stat => [stat.guideProfileId, stat]))
    const conflictCity = city === 'MAKKAH' || city === 'MADINAH' ? city : null
    const [conflicts, holds] = startDate && endDate && conflictCity && guideIds.length > 0
      ? await Promise.all([
          prisma.availability.findMany({
            where: {
              guideProfileId: { in: guideIds },
              date: { gte: startDate, lte: endDate },
              OR: [
                { status: 'BOOKED' },
                { status: 'UNAVAILABLE', city: { in: [conflictCity, 'BOTH'] } },
              ],
            },
            select: { guideProfileId: true },
          }),
          prisma.reservationHold.findMany({
            where: {
              guideProfileId: { in: guideIds },
              date: { gte: startDate, lte: endDate },
              expiresAt: { gt: new Date() },
            },
            select: { guideProfileId: true },
          }),
        ])
      : [[], []]

    const blockedIds = new Set([...conflicts, ...holds].map(item => item.guideProfileId))
    const result = guides.filter(guide => !blockedIds.has(guide.id) && guide.guideAccount).map(guide => {
      const name = guide.guideAccount!.displayName || `${guide.guideAccount!.firstName ?? ''} ${guide.guideAccount!.lastName ?? ''}`.trim()
      const stats = reviewStatsByGuide.get(guide.id)
      return {
        slug: guide.slug,
        name,
        city: guide.city,
        gender: guide.gender,
        serviceCities: [
          ...(guide.servesMakkah ? ['MAKKAH'] : []),
          ...(guide.servesMadinah ? ['MADINAH'] : []),
        ],
        bio: guide.bio,
        image: guide.guideAccount!.image || null,
        experienceYears: guide.experienceYears,
        languages: guide.languages.map(language => language.languageCode),
        activePlaces: guide.places.map(place => place.placeKey),
        prices: {
          makkah: {
            upTo6: centsToEuros(guideServiceRetailCents(guide, 'MAKKAH', 6, pricing.guideServiceMarkupBps)),
            upTo15: centsToEuros(guideServiceRetailCents(guide, 'MAKKAH', 15, pricing.guideServiceMarkupBps)),
            upTo32: centsToEuros(guideServiceRetailCents(guide, 'MAKKAH', 32, pricing.guideServiceMarkupBps)),
          },
          madinah: {
            upTo6: centsToEuros(guideServiceRetailCents(guide, 'MADINAH', 6, pricing.guideServiceMarkupBps)),
            upTo15: centsToEuros(guideServiceRetailCents(guide, 'MADINAH', 15, pricing.guideServiceMarkupBps)),
            upTo32: centsToEuros(guideServiceRetailCents(guide, 'MADINAH', 32, pricing.guideServiceMarkupBps)),
          },
        },
        rating: stats?._count.ratingOverall ? Math.round((stats._avg.ratingOverall ?? 0) * 10) / 10 : null,
        reviewCount: stats?._count.ratingOverall ?? 0,
      }
    })

    return NextResponse.json({ guides: result })
  } catch (err) {
    console.error('[guides/available GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
