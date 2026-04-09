import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email = (session.user as any).email as string | undefined;
  if (!email) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const { reservationId, rating, comment } = await req.json();

  if (!reservationId || typeof rating !== 'number' || rating < 1 || rating > 5 || !comment?.trim()) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { reviews: { select: { id: true } } },
  });

  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  if (reservation.pelerinId !== user.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  if (reservation.status !== 'COMPLETED') return NextResponse.json({ error: 'La réservation doit être terminée pour laisser un avis' }, { status: 400 });
  if (reservation.reviews.length > 0) return NextResponse.json({ error: 'Un avis existe déjà pour cette réservation' }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      reservationId,
      pelerinId: user.id,
      ratingOverall: Math.round(rating),
      comment: comment.trim(),
    },
  });

  return NextResponse.json({ id: review.id, ratingOverall: review.ratingOverall, comment: review.comment });
}
