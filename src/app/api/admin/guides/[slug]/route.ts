import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

async function checkAdmin(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_JWT_SECRET ?? '';
  return session && await verifyAdminToken(session, secret);
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { slug } = await params;

  const guide = await prisma.guideProfile.findUnique({
    where: { slug },
    include: {
      user: { select: { id: true, name: true, firstName: true, lastName: true, email: true, createdAt: true } },
      languages: true,
      packages: true,
      reservations: {
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: { reviews: { select: { ratingOverall: true } } },
      },
    },
  });

  if (!guide) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });

  const totalReservations = await prisma.reservation.count({ where: { guideProfileId: guide.id } });
  const revenueAgg = await prisma.reservation.aggregate({
    where: { guideProfileId: guide.id, status: { in: ['CONFIRMED', 'COMPLETED'] } },
    _sum: { totalPrice: true },
  });
  const allRatings = await prisma.review.findMany({
    where: { reservation: { guideProfileId: guide.id } },
    select: { ratingOverall: true },
  });
  const avgRating = allRatings.length
    ? Math.round((allRatings.reduce((s, r) => s + r.ratingOverall, 0) / allRatings.length) * 10) / 10
    : null;

  return NextResponse.json({
    guide: {
      id: guide.id,
      slug: guide.slug,
      bio: guide.bio,
      city: guide.city,
      nationality: guide.nationality,
      experienceYears: guide.experienceYears,
      status: guide.status,
      responseTimeAvg: guide.responseTimeAvg,
      completionRate: guide.completionRate,
      user: guide.user,
      languages: guide.languages,
      packages: guide.packages,
      reservations: guide.reservations.map(r => ({
        id: r.id,
        refNumber: r.refNumber,
        startDate: r.startDate,
        nbPeople: r.nbPeople,
        totalPrice: r.totalPrice,
        status: r.status,
        createdAt: r.createdAt,
      })),
      stats: {
        totalReservations,
        totalRevenue: Math.round(revenueAgg._sum.totalPrice || 0),
        avgRating,
      },
    },
  });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { slug } = await params;

  const body = await req.json();

  // Update package price
  if (body.packageId && body.pricePerPerson !== undefined) {
    await prisma.package.update({
      where: { id: body.packageId },
      data: { pricePerPerson: Number(body.pricePerPerson) },
    });
    return NextResponse.json({ success: true });
  }

  // Update guide profile
  const guide = await prisma.guideProfile.findUnique({ where: { slug } });
  if (!guide) return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });

  await prisma.guideProfile.update({
    where: { slug },
    data: {
      ...(body.bio !== undefined        && { bio: body.bio }),
      ...(body.city !== undefined       && { city: body.city }),
      ...(body.nationality !== undefined && { nationality: body.nationality }),
      ...(body.experienceYears !== undefined && { experienceYears: Number(body.experienceYears) }),
      ...(body.status !== undefined     && { status: body.status }),
    },
  });

  return NextResponse.json({ success: true });
}
