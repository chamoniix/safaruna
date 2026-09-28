import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';

export async function POST(req: NextRequest) {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const { password } = await req.json().catch(() => ({ password: undefined }));

  const user = await prisma.user.findUnique({ where: { id: access.actor.id } });
  if (!user) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  if (user.passwordHash) {
    if (!password || typeof password !== 'string') {
      return NextResponse.json({ error: 'Mot de passe requis' }, { status: 400 });
    }
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe incorrect' }, { status: 403 });
    }
  }

  const activeReservation = await prisma.reservation.findFirst({
    where: { pelerinId: user.id, status: { in: ['PENDING', 'CONFIRMED'] } },
    select: { id: true },
  });
  if (activeReservation) {
    return NextResponse.json(
      { error: 'Vous avez une réservation en cours. La suppression du compte n’est pas possible tant qu’elle n’est pas terminée ou annulée.' },
      { status: 409 },
    );
  }

  try {
    await prisma.$transaction([
      prisma.user.update({ where: { id: user.id }, data: { bannedAt: new Date() } }),
      prisma.accountDeletionRequest.create({ data: { userId: user.id } }),
      prisma.auditLog.create({
        data: {
          actor: user.email || user.id,
          actorRole: 'CLIENT',
          action: 'PELERIN_DELETION_REQUESTED',
          target: user.id,
        },
      }),
    ]);
  } catch (error) {
    // Contrainte unique partielle en base : une demande PENDING existe déjà pour cet utilisateur.
    // Idempotent — le compte est déjà banni/en cours de traitement, on ne relance pas la demande.
    if (!(error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002')) {
      throw error;
    }
  }

  return NextResponse.json({ success: true });
}
