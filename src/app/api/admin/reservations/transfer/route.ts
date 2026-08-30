import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import { baseTemplate, badge, btn, divider, escapeHtml, heading, p, sendEmail } from '@/lib/email';

const DAY_MS = 86_400_000;

function eachDate(start: Date, end: Date) {
  const dates: Date[] = [];
  for (let date = new Date(start); date <= end; date = new Date(date.getTime() + DAY_MS)) dates.push(date);
  return dates;
}

class TransferConflictError extends Error {}

export async function POST(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const auditContext = getAdminAuditContext(req);

  const { reservationId, newGuideProfileId, motif } = await req.json();

  if (!reservationId || !newGuideProfileId || !motif) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      pelerin: { select: { name: true, firstName: true, lastName: true, email: true } },
      guideProfile: { include: { guideAccount: { select: { displayName: true, firstName: true, lastName: true } } } },
      package: { select: { name: true } },
    },
  });

  if (!reservation)
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });

  const assignedMissions = await prisma.reservationMission.findMany({
    where: { reservationId, guideProfileId: reservation.guideProfileId },
    orderBy: { startDate: 'asc' },
  });
  if (assignedMissions.length === 0)
    return NextResponse.json({ error: 'Aucune mission transférable pour ce guide.' }, { status: 409 });

  const newGuide = await prisma.guideProfile.findUnique({
    where: { id: newGuideProfileId },
    include: { guideAccount: { select: { email: true, displayName: true, firstName: true, lastName: true, status: true } } },
  });

  if (!newGuide || newGuide.status !== 'ACTIVE' || newGuide.guideAccount?.status !== 'ACTIVE')
    return NextResponse.json({ error: 'Nouveau guide introuvable' }, { status: 404 });
  if (newGuideProfileId === reservation.guideProfileId)
    return NextResponse.json({ error: 'Ce guide est déjà affecté à cette réservation.' }, { status: 409 });
  if (assignedMissions.some(mission => mission.city === 'MAKKAH' && !newGuide.servesMakkah))
    return NextResponse.json({ error: 'Le nouveau guide n’est pas actif à Makkah.' }, { status: 409 });
  if (assignedMissions.some(mission => mission.city === 'MADINAH' && !newGuide.servesMadinah))
    return NextResponse.json({ error: 'Le nouveau guide n’est pas actif à Médine.' }, { status: 409 });

  const noteEntry = `[Transfert admin ${new Date().toLocaleDateString('fr-FR')}] ${motif}`;
  const newNotes = reservation.notes
    ? `${noteEntry}\n${reservation.notes}`
    : noteEntry;

  const confirmationRequestedAt = new Date();
  try {
    await prisma.$transaction(async tx => {
      for (const mission of assignedMissions) {
        const dates = eachDate(mission.startDate, mission.endDate);
        const [conflict, hold] = await Promise.all([
          tx.availability.findFirst({
            where: {
              guideProfileId: newGuideProfileId,
              date: { in: dates },
              OR: [
                { status: 'BOOKED' },
                { status: 'UNAVAILABLE', city: { in: [mission.city, 'BOTH'] } },
              ],
            },
            select: { id: true },
          }),
          tx.reservationHold.findFirst({
            where: { guideProfileId: newGuideProfileId, date: { in: dates }, expiresAt: { gt: new Date() } },
            select: { id: true },
          }),
        ]);
        if (conflict || hold) throw new TransferConflictError(mission.city);
      }

      await tx.reservation.update({ where: { id: reservationId }, data: { guideProfileId: newGuideProfileId, notes: newNotes } });
      await tx.reservationMission.updateMany({
        where: { reservationId, guideProfileId: reservation.guideProfileId },
        data: {
          guideProfileId: newGuideProfileId,
          guideConfirmationStatus: 'PENDING',
          guideConfirmationRequestedAt: confirmationRequestedAt,
          guideConfirmedAt: null,
        },
      });
      await tx.guideEarning.updateMany({
        where: { reservationId, guideProfileId: reservation.guideProfileId },
        data: { guideProfileId: newGuideProfileId },
      });
      await tx.availability.deleteMany({ where: { reservationId, guideProfileId: reservation.guideProfileId } });
      for (const mission of assignedMissions) {
        for (const date of eachDate(mission.startDate, mission.endDate)) {
          await tx.availability.upsert({
            where: { guideProfileId_date_city: { guideProfileId: newGuideProfileId, date, city: mission.city } },
            update: { status: 'BOOKED', reservationId },
            create: { guideProfileId: newGuideProfileId, date, city: mission.city, status: 'BOOKED', reservationId },
          });
        }
      }
      await tx.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: 'RESERVATION_GUIDE_TRANSFERRED',
          target: reservation.refNumber,
          detail: adminAuditDetail(auditContext),
          before: { guideProfileId: reservation.guideProfileId },
          after: { guideProfileId: newGuideProfileId, motif, guideConfirmationStatus: 'PENDING' },
          ...adminAuditFields(auditContext),
        },
      });
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (error instanceof TransferConflictError || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')) {
      return NextResponse.json({ error: 'La disponibilité du nouveau guide a changé. Rechargez la page puis réessayez.' }, { status: 409 });
    }
    throw error;
  }

  const pelerinEmail = reservation.pelerin.email;
  const pelerinName = reservation.pelerin.name
    || `${reservation.pelerin.firstName ?? ''} ${reservation.pelerin.lastName ?? ''}`.trim()
    || 'Pèlerin';
  const newGuideName = newGuide.guideAccount?.displayName
    || `${newGuide.guideAccount?.firstName ?? ''} ${newGuide.guideAccount?.lastName ?? ''}`.trim()
    || 'Guide';

  if (pelerinEmail) {
    sendEmail({
      category: 'RESERVATION_GUIDE_TRANSFER',
      retryable: true,
      idempotencyKey: `reservation-guide-transfer:${reservation.id}:${newGuideProfileId}:${pelerinEmail.toLowerCase()}`,
      reference: { type: 'RESERVATION', id: reservation.id },
      to: { email: pelerinEmail, name: pelerinName },
      subject: `Votre guide a été modifié — Réservation ${reservation.refNumber}`,
      html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:40px 16px;">
<tr><td align="center"><table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
<tr><td style="background:#1A1209;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
  <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:white;letter-spacing:0.08em;">SAFAR<span style="color:#C9A84C;">U</span>MA</span>
</td></tr>
<tr><td style="background:white;padding:40px;border:1px solid #E8DFC8;border-top:none;">
  <h1 style="font-family:Georgia,serif;font-size:22px;color:#1A1209;margin:0 0 16px;">Modification de votre réservation</h1>
  <p style="font-size:14px;color:#4A3F30;line-height:1.7;">Bonjour ${escapeHtml(pelerinName)},</p>
  <p style="font-size:14px;color:#4A3F30;line-height:1.7;">Votre guide pour la réservation <strong>${escapeHtml(reservation.refNumber)}</strong> a été modifié. Votre nouveau guide est <strong>${escapeHtml(newGuideName)}</strong>.</p>
  <p style="font-size:14px;color:#4A3F30;line-height:1.7;">Si vous avez des questions, contactez-nous à <a href="mailto:contact@safaruma.com" style="color:#C9A84C;">contact@safaruma.com</a>.</p>
</td></tr>
<tr><td style="background:#F5F0E8;border:1px solid #E8DFC8;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
  <p style="margin:0;font-size:11px;color:#9A8D7A;">SAFARUMA — <a href="https://safaruma.com" style="color:#C9A84C;text-decoration:none;">safaruma.com</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`,
    }).catch(e => console.error('[transfer] email error', e));
  }

  if (newGuide.guideAccount?.email) {
    await sendEmail({
      category: 'RESERVATION_GUIDE_TRANSFER',
      retryable: true,
      idempotencyKey: `reservation-guide-transfer:new-guide:${reservation.id}:${newGuideProfileId}`,
      reference: { type: 'RESERVATION', id: reservation.id },
      to: { email: newGuide.guideAccount.email, name: newGuideName },
      subject: `[SAFARUMA] Réservation transférée à confirmer — ${reservation.refNumber}`,
      html: baseTemplate(`
        ${heading('Une réservation vous a été transférée')}
        ${badge('ACTION REQUISE', '#D97706')}
        ${p(`La réservation payée <strong>${escapeHtml(reservation.refNumber)}</strong> vous est maintenant affectée.`)}
        ${p(`Ville(s) : ${escapeHtml(assignedMissions.map(mission => mission.city === 'MAKKAH' ? 'Makkah' : 'Médine').join(' · '))}<br>Voyageurs : ${reservation.nbPeople}`)}
        ${divider()}
        ${btn('Confirmer la réservation', `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/guide/demandes?reservation=${encodeURIComponent(reservation.refNumber)}`)}
      `),
    });
  }

  return NextResponse.json({ success: true, newGuideName });
}
