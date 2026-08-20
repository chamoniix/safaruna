import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

export async function GET() {
  const access = await requireGuide()
  if (!access.ok) return access.response
  const guideProfileId = access.actor.guideProfileId
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)

  const [earnings, prochainVirement] = await Promise.all([
    prisma.guideEarning.findMany({
      where: { guideProfileId, status: { not: 'CANCELLED' } },
      orderBy: { reservation: { startDate: 'desc' } },
      take: 100,
      include: {
        reservation: {
          select: {
            id: true,
            refNumber: true,
            status: true,
            startDate: true,
            nbPeople: true,
            pelerin: { select: { name: true, firstName: true, lastName: true } },
            package: { select: { name: true } },
          },
        },
      },
    }),
    prisma.transfer.findFirst({
      where: { guideProfileId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  const completed = earnings.filter(earning => earning.reservation.status === 'COMPLETED')
  const upcoming = earnings.filter(earning => earning.reservation.status === 'CONFIRMED')
  const paid = earnings.filter(earning => earning.status === 'PAID')
  const netTotalCents = completed.reduce((sum, earning) => sum + earning.totalNetCents, 0)
  const netMonthCents = completed
    .filter(earning => earning.reservation.startDate >= startOfMonth)
    .reduce((sum, earning) => sum + earning.totalNetCents, 0)
  const upcomingNetCents = upcoming.reduce((sum, earning) => sum + earning.totalNetCents, 0)
  const paidNetCents = paid.reduce((sum, earning) => sum + earning.totalNetCents, 0)

  const history = completed.slice(0, 10).map(earning => {
    const reservation = earning.reservation
    const pelerin = reservation.pelerin
    return {
      id: earning.id,
      refNumber: reservation.refNumber,
      pelerinName: pelerin.name || `${pelerin.firstName ?? ''} ${pelerin.lastName ?? ''}`.trim() || '—',
      packageName: reservation.package.name,
      nbPeople: reservation.nbPeople,
      startDate: reservation.startDate.toLocaleDateString('fr-FR'),
      serviceNet: earning.serviceNetCents / 100,
      placesNet: earning.placesNetCents / 100,
      transportNet: earning.transportNetCents / 100,
      hotelNet: earning.hotelNetCents / 100,
      net: earning.totalNetCents / 100,
      paymentStatus: earning.status,
    }
  })

  return NextResponse.json({
    stats: {
      totalNet: netTotalCents / 100,
      netMois: netMonthCents / 100,
      upcomingNet: upcomingNetCents / 100,
      paidNet: paidNetCents / 100,
      nbMissions: completed.length,
    },
    prochainVirement: prochainVirement
      ? { amount: prochainVirement.net, period: prochainVirement.period, status: prochainVirement.status }
      : null,
    history,
  })
}
