import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import prisma from '@/lib/prisma'
import { requireGuide } from '@/lib/require-account'

export async function GET(req: NextRequest) {
  const access = await requireGuide({ published: true })
  if (!access.ok) return access.response
  const guideProfileId = access.actor.guideProfileId
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const requestedPage = Number(req.nextUrl.searchParams.get('transferPage') ?? '1')
  const transferPage = Number.isSafeInteger(requestedPage) ? Math.min(100000, Math.max(1, requestedPage)) : 1
  const pageSize = 10
  const completedWhere: Prisma.GuideEarningWhereInput = { guideProfileId, status: { not: 'CANCELLED' }, reservation: { status: 'COMPLETED' } }
  const sentWhere: Prisma.TransferWhereInput = { guideProfileId, status: 'PAID', confirmedAt: { not: null }, recordedEarningId: { not: null } }

  const [earnings, prochainVirement, total, month, upcomingTotal, paidTotal, sentTotal, transfers, transferCount] = await Promise.all([
    prisma.guideEarning.findMany({
      where: completedWhere,
      orderBy: [{ reservation: { startDate: 'desc' } }, { id: 'desc' }],
      take: 10,
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
      // Legacy indication only. Manual preparations are not promised transfers.
      where: { guideProfileId, status: 'PENDING', recordedEarningId: null },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.guideEarning.aggregate({ where: completedWhere, _sum: { totalNetCents: true }, _count: { _all: true } }),
    prisma.guideEarning.aggregate({ where: { ...completedWhere, reservation: { status: 'COMPLETED', startDate: { gte: startOfMonth } } }, _sum: { totalNetCents: true } }),
    prisma.guideEarning.aggregate({ where: { guideProfileId, status: { not: 'CANCELLED' }, reservation: { status: 'CONFIRMED' } }, _sum: { totalNetCents: true } }),
    prisma.guideEarning.aggregate({ where: { guideProfileId, status: 'PAID' }, _sum: { totalNetCents: true } }),
    prisma.transfer.aggregate({ where: sentWhere, _sum: { amountCents: true } }),
    prisma.transfer.findMany({ where: sentWhere, orderBy: [{ sentAt: 'desc' }, { id: 'desc' }],
      skip: (transferPage - 1) * pageSize, take: pageSize,
      select: { id: true, amountCents: true, currency: true, bankReference: true, sentAt: true, confirmedAt: true,
        recordedEarning: { select: { reservation: { select: { refNumber: true } } } },
      },
    }),
    prisma.transfer.count({ where: sentWhere }),
  ])

  const history = earnings.map(earning => {
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
      totalNet: (total._sum.totalNetCents ?? 0) / 100,
      netMois: (month._sum.totalNetCents ?? 0) / 100,
      upcomingNet: (upcomingTotal._sum.totalNetCents ?? 0) / 100,
      paidNet: (paidTotal._sum.totalNetCents ?? 0) / 100,
      sentNet: (sentTotal._sum.amountCents ?? 0) / 100,
      nbMissions: total._count._all,
    },
    prochainVirement: prochainVirement
      ? { amount: prochainVirement.net, period: prochainVirement.period, status: prochainVirement.status }
      : null,
    history,
    transfers: { page: transferPage, pages: Math.max(1, Math.ceil(transferCount / pageSize)), total: transferCount,
      rows: transfers.map(transfer => ({
        id: transfer.id, refNumber: transfer.recordedEarning!.reservation.refNumber,
        amountCents: transfer.amountCents, currency: transfer.currency, bankReference: transfer.bankReference,
        sentAt: transfer.sentAt, confirmedAt: transfer.confirmedAt,
      })),
    },
  }, { headers: { 'Cache-Control': 'private, no-store' } })
}
