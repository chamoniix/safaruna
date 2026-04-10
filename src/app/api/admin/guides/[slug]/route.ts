import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

async function checkAdmin(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_JWT_SECRET ?? '';
  return session && await verifyAdminToken(session, secret);
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { slug } = await params;

  try {
    const guide = await prisma.guideProfile.findUnique({
      where: { slug },
      include: {
        user: {
          select: {
            id: true, name: true, firstName: true,
            lastName: true, email: true, createdAt: true
          }
        },
        languages: true,
        packages: true,
        reservations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        availabilities: {
          orderBy: { date: 'asc' },
          take: 30,
        },
      },
    });

    if (!guide)
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });

    // Stats séparées — sans filtres imbriqués
    const totalReservations = await prisma.reservation.count({
      where: { guideProfileId: guide.id },
    });

    const revenueAgg = await prisma.reservation.aggregate({
      where: { guideProfileId: guide.id, status: 'COMPLETED' },
      _sum: { totalPrice: true },
    });

    // Conversations séparées — sans include imbriqué complexe
    const conversations = await prisma.conversation.findMany({
      where: { guideProfileId: guide.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        pelerin: {
          select: {
            name: true, firstName: true,
            lastName: true, email: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

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
        commissionRate: (guide as any).commissionRate ?? 0.12,
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
        iban: guide.ibanEncrypted || null,
        availabilities: guide.availabilities.map(a => ({
          id: a.id,
          date: a.date.toISOString().split('T')[0],
          status: a.status,
        })),
        conversations: conversations.map(c => ({
          id: c.id,
          pelerinName: c.pelerin.name
            || `${c.pelerin.firstName ?? ''} ${c.pelerin.lastName ?? ''}`.trim()
            || c.pelerin.email || '—',
          lastMessage: c.messages[0]?.content?.slice(0, 80) || '',
          lastMessageAt: c.messages[0]
            ? new Date(c.messages[0].createdAt).toLocaleDateString('fr-FR')
            : '',
        })),
        stats: {
          totalReservations,
          totalRevenue: Math.round(revenueAgg._sum.totalPrice || 0),
          avgRating: null,
        },
      },
    });
  } catch (err) {
    console.error('[admin/guides/slug GET]', err);
    return NextResponse.json(
      { error: 'Erreur serveur', details: String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { slug } = await params;
  const body = await req.json();

  try {
    if (body.packageId && body.pricePerPerson !== undefined) {
      await prisma.package.update({
        where: { id: body.packageId },
        data: { pricePerPerson: Number(body.pricePerPerson) },
      });
      return NextResponse.json({ success: true });
    }

    const guide = await prisma.guideProfile.findUnique({ where: { slug } });
    if (!guide)
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });

    await prisma.guideProfile.update({
      where: { slug },
      data: {
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.nationality !== undefined && { nationality: body.nationality }),
        ...(body.experienceYears !== undefined && {
          experienceYears: Number(body.experienceYears)
        }),
        ...(body.status !== undefined && { status: body.status }),
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/guides/slug PATCH]', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
