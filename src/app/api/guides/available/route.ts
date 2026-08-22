import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { centsToEuros, guideServiceRetailCents } from '@/lib/guide-pricing'

type ServiceCity = 'MAKKAH' | 'MADINAH' | 'BOTH'

function parseCity(value: string | null): ServiceCity | '' {
  return value === 'MAKKAH' || value === 'MADINAH' || value === 'BOTH' ? value : ''
}

function parseDate(value: string | null): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const date = new Date(`${value}T12:00:00.000Z`)
  return Number.isNaN(date.getTime()) ? null : date
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = parseCity(searchParams.get('city'))
  const langue = searchParams.get('langue') || ''
  const gender = searchParams.get('gender') || ''
  const startDate = parseDate(searchParams.get('startDate'))
  const endDate = parseDate(searchParams.get('endDate'))

  if ((startDate && !endDate) || (!startDate && endDate) || (startDate && endDate && endDate < startDate)) {
    return NextResponse.json({ error: 'Période invalide' }, { status: 400 })
  }

  try {
    const guides = await prisma.guideProfile.findMany({
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
    })

    const guideIds = guides.map(guide => guide.id)
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
        rating: null,
        reviewCount: 0,
      }
    })

    return NextResponse.json({ guides: result })
  } catch (err) {
    console.error('[guides/available GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
