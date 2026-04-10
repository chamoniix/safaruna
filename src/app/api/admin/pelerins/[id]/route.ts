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
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id },
    include: {
      reservations: {
        orderBy: { createdAt: 'desc' },
        include: {
          guideProfile: {
            include: { user: { select: { name: true, firstName: true, lastName: true } } }
          },
          package: { select: { name: true, durationDays: true } },
          reviews: { select: { ratingOverall: true, comment: true } },
        }
      },
      reviews: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      notifications: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
      conversationsAsPelerin: {
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: {
          guideProfile: { include: { user: { select: { name: true, firstName: true } } } },
          messages: { orderBy: { createdAt: 'desc' }, take: 1 },
        },
      },
    }
  });

  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const totalSpent = user.reservations
    .filter(r => r.status === 'COMPLETED')
    .reduce((sum, r) => sum + r.totalPrice, 0);

  const avgRating = user.reviews.length > 0
    ? user.reviews.reduce((sum, r) => sum + r.ratingOverall, 0) / user.reviews.length
    : null;

  return NextResponse.json({
    id: user.id,
    name: user.name || `${user.firstName ?? ''} ${user.lastName ?? ''}`.trim() || user.email || '—',
    email: user.email || '—',
    firstName: user.firstName,
    lastName: user.lastName,
    country: user.country,
    phoneWhatsapp: user.phoneWhatsapp,
    createdAt: new Date(user.createdAt).toLocaleDateString('fr-FR'),
    lastLogin: user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('fr-FR') : null,
    role: user.role,
    stats: {
      totalReservations: user.reservations.length,
      completedReservations: user.reservations.filter(r => r.status === 'COMPLETED').length,
      totalSpent: Math.round(totalSpent),
      avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
    },
    reservations: user.reservations.map(r => ({
      id: r.id,
      refNumber: r.refNumber,
      guideName: r.guideProfile.user.name ||
        `${r.guideProfile.user.firstName ?? ''} ${r.guideProfile.user.lastName ?? ''}`.trim() || '—',
      packageName: r.package.name,
      durationDays: r.package.durationDays,
      startDate: new Date(r.startDate).toLocaleDateString('fr-FR'),
      nbPeople: r.nbPeople,
      totalPrice: r.totalPrice,
      status: r.status,
      createdAt: new Date(r.createdAt).toLocaleDateString('fr-FR'),
      review: r.reviews[0] ? {
        rating: r.reviews[0].ratingOverall,
        comment: r.reviews[0].comment,
      } : null,
    })),
    notifications: user.notifications.map(n => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      createdAt: new Date(n.createdAt).toLocaleDateString('fr-FR'),
      readAt: n.readAt ? new Date(n.readAt).toLocaleDateString('fr-FR') : null,
    })),
    conversations: user.conversationsAsPelerin.map(c => ({
      id: c.id,
      guideName: c.guideProfile.user.name || c.guideProfile.user.firstName || '—',
      lastMessage: c.messages[0]?.content?.slice(0, 80) || '',
      lastMessageAt: c.messages[0] ? new Date(c.messages[0].createdAt).toLocaleDateString('fr-FR') : '',
    })),
  });
}
