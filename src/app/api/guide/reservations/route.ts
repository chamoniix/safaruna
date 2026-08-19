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
    where: {
      OR: [
        { guideProfileId: guideProfile.id },
        { missions: { some: { guideProfileId: guideProfile.id } } },
      ],
    },
    select: {
      id: true,
      refNumber: true,
      startDate: true,
      endDate: true,
      nbPeople: true,
      status: true,
      selectedPlaces: true,
      selectedCities: true,
      gender: true,
      langue: true,
      arrivalPoint: true,
      cityOrder: true,
      guideBedProvided: true,
      ihramAlert: true,
      createdAt: true,
      pelerin: {
        select: { name: true, firstName: true, lastName: true, email: true },
      },
      package: { select: { name: true, durationDays: true } },
      missions: { where: { guideProfileId: guideProfile.id }, orderBy: { startDate: 'asc' } },
      guideEarnings: {
        where: { guideProfileId: guideProfile.id },
        select: {
          serviceNetCents: true,
          placesNetCents: true,
          transportNetCents: true,
          hotelNetCents: true,
          totalNetCents: true,
          status: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({
    reservations: reservations.map(reservation => ({
      ...reservation,
      guideEarning: reservation.guideEarnings[0]
        ? {
            service: reservation.guideEarnings[0].serviceNetCents / 100,
            places: reservation.guideEarnings[0].placesNetCents / 100,
            transport: reservation.guideEarnings[0].transportNetCents / 100,
            hotel: reservation.guideEarnings[0].hotelNetCents / 100,
            total: reservation.guideEarnings[0].totalNetCents / 100,
            status: reservation.guideEarnings[0].status,
          }
        : null,
      guideEarnings: undefined,
    })),
  })
}
