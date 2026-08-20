import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';

export async function POST(req: NextRequest) {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const { reservationId, rating, comment } = await req.json();

  if (!reservationId || typeof rating !== 'number' || rating < 1 || rating > 5 || !comment?.trim()) {
    return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
  }

  if (comment.length > 2000) {
    return NextResponse.json({ error: 'Commentaire trop long (max 2000 caractères)' }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: { reviews: { select: { id: true } } },
  });

  if (!reservation) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  if (reservation.pelerinId !== access.actor.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
  if (reservation.status !== 'COMPLETED') return NextResponse.json({ error: 'La réservation doit être terminée pour laisser un avis' }, { status: 400 });
  if (reservation.reviews.length > 0) return NextResponse.json({ error: 'Un avis existe déjà pour cette réservation' }, { status: 409 });

  const review = await prisma.review.create({
    data: {
      reservationId,
      pelerinId: access.actor.id,
      ratingOverall: Math.round(rating),
      comment: comment.trim(),
    },
  });

  return NextResponse.json({ id: review.id, ratingOverall: review.ratingOverall, comment: review.comment });
}
