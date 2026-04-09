import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId },
    include: { guideProfile: true },
  });

  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!user.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const guideProfileId = user.guideProfile.id;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [completedReservations, revenuesMoisResult, prochainVirement] = await Promise.all([
    prisma.reservation.findMany({
      where: { guideProfileId, status: 'COMPLETED' },
      orderBy: { startDate: 'desc' },
      take: 50,
      select: {
        id: true,
        refNumber: true,
        totalPrice: true,
        commissionAmount: true,
        startDate: true,
        nbPeople: true,
        pelerin: { select: { name: true, firstName: true, lastName: true } },
        package: { select: { name: true } },
      },
    }),
    prisma.reservation.aggregate({
      where: { guideProfileId, status: 'COMPLETED', startDate: { gte: startOfMonth } },
      _sum: { totalPrice: true, commissionAmount: true },
    }),
    prisma.transfer.findFirst({
      where: { guideProfileId, status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalBrut = completedReservations.reduce((s, r) => s + r.totalPrice, 0);
  const totalCommissions = completedReservations.reduce((s, r) => s + r.commissionAmount, 0);
  const totalNet = totalBrut - totalCommissions;

  const revenuesMois = revenuesMoisResult._sum.totalPrice ?? 0;
  const commissionsMois = revenuesMoisResult._sum.commissionAmount ?? 0;
  const netMois = revenuesMois - commissionsMois;

  // Group by month (last 10 completed reservations for history table)
  const history = completedReservations.slice(0, 10).map(r => {
    const p = r.pelerin;
    const net = r.totalPrice - r.commissionAmount;
    return {
      id: r.id,
      refNumber: r.refNumber,
      pelerinName: p.name || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || '—',
      packageName: r.package.name,
      nbPeople: r.nbPeople,
      startDate: new Date(r.startDate).toLocaleDateString('fr-FR'),
      totalBrut: Math.round(r.totalPrice),
      commission: Math.round(r.commissionAmount),
      net: Math.round(net),
    };
  });

  return NextResponse.json({
    stats: {
      totalBrut: Math.round(totalBrut),
      totalCommissions: Math.round(totalCommissions),
      totalNet: Math.round(totalNet),
      revenuesMois: Math.round(revenuesMois),
      commissionsMois: Math.round(commissionsMois),
      netMois: Math.round(netMois),
      nbMissions: completedReservations.length,
    },
    prochainVirement: prochainVirement
      ? { amount: Math.round(prochainVirement.net), period: prochainVirement.period, status: prochainVirement.status }
      : null,
    history,
  });
}
