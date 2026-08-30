import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

export async function GET() {
  const access = await requireGuide()
  if (!access.ok) return access.response
  const guideProfileId = access.actor.guideProfileId

  const reservations = await prisma.reservation.findMany({
    where: {
      OR: [
        { guideProfileId },
        { missions: { some: { guideProfileId } } },
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
      missions: { where: { guideProfileId }, orderBy: { startDate: 'asc' } },
      guideEarnings: {
        where: { guideProfileId },
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
      guideConfirmationStatus: reservation.missions.every(mission => mission.guideConfirmationStatus === 'CONFIRMED') ? 'CONFIRMED' : 'PENDING',
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
