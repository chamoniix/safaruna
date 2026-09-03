import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { adminAuditDetail, adminAuditFields, checkAdmin, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import { assertMissionsAvailable, eachBookingDate, GuideAvailabilityConflictError } from '@/lib/guide-availability';
import prisma from '@/lib/prisma';
import { sendReservationConfirmation, sendEmail } from '@/lib/email';

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const reservations = await prisma.reservation.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      pelerin: { select: { name: true, firstName: true, lastName: true, email: true } },
      guideProfile: { select: { guideAccount: { select: { displayName: true, firstName: true, lastName: true } } } },
      package: { select: { name: true, durationDays: true } },
      missions: {
        orderBy: { startDate: 'asc' },
        select: {
          id: true,
          city: true,
          guideConfirmationStatus: true,
          guideConfirmationRequestedAt: true,
          guideConfirmedAt: true,
          guideProfile: { select: { guideAccount: { select: { displayName: true, firstName: true, lastName: true } } } },
        },
      },
      paymentAttempts: {
        orderBy: { createdAt: 'desc' },
        take: 1,
        select: {
          provider: true, status: true, amountCents: true, currency: true,
          providerCheckoutId: true, providerPaymentId: true,
          checkoutExpiresAt: true, paidAt: true, failureCode: true, createdAt: true,
        },
      },
      paymentTransactions: {
        where: { type: 'CHARGE' },
        orderBy: { occurredAt: 'desc' },
        take: 1,
        select: {
          provider: true, providerTransactionId: true, status: true,
          amountCents: true, currency: true, occurredAt: true,
        },
      },
    },
  });

  return NextResponse.json({
    reservations: reservations.map(r => {
      const confirmedMissions = r.missions.filter(mission => mission.guideConfirmationStatus === 'CONFIRMED').length;
      const hasNoResponse = r.missions.some(mission => mission.guideConfirmationStatus === 'NO_RESPONSE');
      const hasDeclined = r.missions.some(mission => mission.guideConfirmationStatus === 'DECLINED');
      const guideConfirmationStatus = r.missions.length === 0
        ? 'NONE'
        : hasNoResponse ? 'NO_RESPONSE'
        : hasDeclined ? 'DECLINED'
        : confirmedMissions === r.missions.length
          ? 'CONFIRMED'
          : confirmedMissions > 0 ? 'PARTIAL' : 'PENDING';
      return {
      id: r.id,
      refNumber: r.refNumber,
      pelerin: r.pelerin.name
        || `${r.pelerin.firstName ?? ''} ${r.pelerin.lastName ?? ''}`.trim()
        || r.pelerin.email || '—',
      guide: r.guideProfile.guideAccount?.displayName
        || `${r.guideProfile.guideAccount?.firstName ?? ''} ${r.guideProfile.guideAccount?.lastName ?? ''}`.trim()
        || '—',
      packageName: r.package.name,
      durationDays: r.package.durationDays,
      startDate: new Date(r.startDate).toLocaleDateString('fr-FR'),
      nbPeople: r.nbPeople,
      basePrice: r.basePrice,
      commissionAmount: r.commissionAmount,
      totalPrice: r.totalPrice,
      status: r.status,
      payment: r.paymentAttempts[0] ? {
        ...r.paymentAttempts[0],
        transaction: r.paymentTransactions[0] ?? null,
      } : r.stripePaymentId ? {
        provider: 'STRIPE',
        status: 'SUCCEEDED',
        amountCents: Math.round(r.totalPrice * 100),
        currency: 'EUR',
        providerCheckoutId: null,
        providerPaymentId: r.stripePaymentId,
        checkoutExpiresAt: null,
        paidAt: null,
        failureCode: null,
        createdAt: r.createdAt,
        transaction: null,
      } : null,
      guideConfirmationStatus,
      missions: r.missions.map(mission => {
        const account = mission.guideProfile.guideAccount;
        return {
          id: mission.id,
          city: mission.city,
          guide: account?.displayName || `${account?.firstName ?? ''} ${account?.lastName ?? ''}`.trim() || '—',
          status: mission.guideConfirmationStatus,
          requestedAt: mission.guideConfirmationRequestedAt,
          confirmedAt: mission.guideConfirmedAt,
        };
      }),
      createdAt: new Date(r.createdAt).toLocaleDateString('fr-FR'),
      };
    }),
  });
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const auditContext = getAdminAuditContext(req);

  const { reservationId, status, motif } = await req.json();

  const validStatuses = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];
  if (!validStatuses.includes(status))
    return NextResponse.json({ error: 'Statut invalide' }, { status: 400 });

  const existing = await prisma.reservation.findUnique({
    where: { id: reservationId },
    select: {
      notes: true,
      status: true,
      stripePaymentId: true,
      refNumber: true,
      paymentAttempts: {
        where: { status: 'SUCCEEDED' },
        select: { id: true },
        take: 1,
      },
      missions: {
        select: { guideProfileId: true, city: true, startDate: true, endDate: true },
      },
    },
  });
  if (!existing) return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });
  if (status === 'CONFIRMED' && existing.paymentAttempts.length === 0 && !existing.stripePaymentId) {
    return NextResponse.json({ error: 'Une réservation sans paiement vérifié ne peut pas être confirmée.' }, { status: 409 });
  }
  const existingNotes = existing?.notes || '';
  const noteEntry = `[${actor.email} ${new Date().toLocaleDateString('fr-FR')}] ${motif || 'Modification admin'}`;
  const newNotes = existingNotes ? `${noteEntry}\n${existingNotes}` : noteEntry;

  let reservation;
  try {
    reservation = await prisma.$transaction(async tx => {
    if (status === 'CONFIRMED' && existing.status === 'CANCELLED') {
      const missions = existing.missions.map(mission => ({
        guideProfileId: mission.guideProfileId,
        city: mission.city as 'MAKKAH' | 'MADINAH',
        dates: eachBookingDate(mission.startDate, mission.endDate),
      }));
      await assertMissionsAvailable(tx, missions);
      for (const mission of missions) {
        await tx.availability.createMany({
          data: mission.dates.map(date => ({
            guideProfileId: mission.guideProfileId,
            date,
            city: mission.city,
            status: 'BOOKED' as const,
            reservationId,
          })),
        });
      }
    }

    const updated = await tx.reservation.update({
      where: { id: reservationId },
      data: { status, notes: newNotes },
      include: {
        pelerin: { select: { name: true, firstName: true, lastName: true, email: true } },
        guideProfile: {
          include: {
            guideAccount: { select: { displayName: true, firstName: true, lastName: true, email: true, phoneWhatsapp: true } },
          },
        },
        package: { select: { name: true, durationDays: true } },
        guideEarnings: {
          select: { guideProfileId: true, totalNetCents: true },
        },
      },
    });

    if (status === 'CANCELLED' && existing.status !== 'CANCELLED') {
      await tx.availability.deleteMany({ where: { reservationId } });
    }

    await tx.auditLog.create({
      data: {
        actor: actor.email,
        actorRole: actor.role,
        actorAdminId: actor.id,
        action: 'RESERVATION_STATUS_UPDATED',
        target: existing.refNumber,
        detail: adminAuditDetail(auditContext),
        before: { status: existing.status },
        after: { status, motif: motif || null },
        ...adminAuditFields(auditContext),
      },
    });

    return updated;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
  } catch (error) {
    if (
      error instanceof GuideAvailabilityConflictError
      || (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code))
    ) {
      return NextResponse.json(
        { error: 'Le guide n’est plus disponible sur toutes les dates de cette réservation.' },
        { status: 409 },
      );
    }
    throw error;
  }

  if (status === 'CONFIRMED' && existing?.status !== 'CONFIRMED') {
    const p = reservation.pelerin;
    const gu = reservation.guideProfile.guideAccount;
    const pelerinName = p.name || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || 'Pèlerin';
    const guideName   = gu?.displayName || `${gu?.firstName ?? ''} ${gu?.lastName ?? ''}`.trim() || 'Guide';
    const departure   = new Date(reservation.startDate).toLocaleDateString('fr-FR');
    const primaryEarning = reservation.guideEarnings.find(earning => earning.guideProfileId === reservation.guideProfileId);
    const netGuide = primaryEarning?.totalNetCents
      ? primaryEarning.totalNetCents / 100
      : 0;

    // Email au pèlerin
    if (p.email) {
      sendReservationConfirmation({
        to: p.email,
        pelerinName,
        guideName,
        departureDate: departure,
        nights: reservation.package.durationDays,
        amount: reservation.totalPrice,
        reservationId: reservation.refNumber,
      }).catch(e => console.error('[reservations PATCH] pelerin email error', e));
    }

    // Email au guide
    if (gu?.email) {
      sendEmail({
        category: 'RESERVATION_CONFIRMATION_GUIDE',
        retryable: true,
        idempotencyKey: `reservation-confirmation:guide:${reservation.id}:${gu.email.toLowerCase()}`,
        reference: { type: 'RESERVATION', id: reservation.id },
        to: { email: gu.email, name: guideName },
        subject: `Nouvelle réservation confirmée — ${reservation.refNumber}`,
        html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>SAFARUMA</title></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:40px 16px;">
<tr><td align="center"><table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
<tr><td style="background:#1A1209;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
  <div style="height:3px;background:linear-gradient(90deg,#C9A84C,#F0D897,#C9A84C);border-radius:2px;margin-bottom:20px;"></div>
  <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:white;letter-spacing:0.08em;">SAFAR<span style="color:#C9A84C;">U</span>MA</span>
</td></tr>
<tr><td style="background:white;padding:40px;border:1px solid #E8DFC8;border-top:none;">
  <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:400;color:#1A1209;margin:0 0 8px;">Nouvelle réservation !</h1>
  <span style="display:inline-block;background:#4CAF9A22;color:#4CAF9A;font-size:11px;font-weight:700;letter-spacing:0.08em;padding:4px 12px;border-radius:20px;">CONFIRMÉE</span>
  <p style="font-size:14px;color:#4A3F30;line-height:1.7;margin:12px 0;">Vous avez une nouvelle réservation confirmée de <strong>${pelerinName}</strong>.</p>
  <div style="height:1px;background:#E8DFC8;margin:24px 0;"></div>
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;width:40%;">Référence</td><td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:600;">${reservation.refNumber}</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Date départ</td><td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:600;">${departure}</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Personnes</td><td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:600;">${reservation.nbPeople}</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;">Votre net</td><td style="padding:8px 0;font-size:13px;color:#1D5C3A;font-weight:700;">${netGuide} €</td></tr>
  </table>
  <div style="height:1px;background:#E8DFC8;margin:24px 0;"></div>
  <div style="text-align:center;padding:8px 0;">
    <a href="https://safaruma.com/guide/missions" style="display:inline-block;background:#1A1209;color:#F0D897;padding:12px 28px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;letter-spacing:0.04em;">Voir dans mon espace</a>
  </div>
</td></tr>
<tr><td style="background:#F5F0E8;border:1px solid #E8DFC8;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
  <p style="margin:0;font-size:11px;color:#9A8D7A;">SAFARUMA — <a href="https://safaruma.com" style="color:#C9A84C;text-decoration:none;">safaruma.com</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`,
      }).catch(e => console.error('[reservations PATCH] guide email error', e));
    }

    // Email à l'admin
    sendEmail({
      category: 'RESERVATION_CONFIRMATION_ADMIN',
      retryable: true,
      idempotencyKey: `reservation-confirmation:admin:${reservation.id}`,
      reference: { type: 'RESERVATION', id: reservation.id },
      to: { email: 'admin@safaruma.com', name: 'Admin SAFARUMA' },
      subject: `[Admin] Nouvelle réservation ${reservation.refNumber}`,
      html: `<!DOCTYPE html><html lang="fr"><head><meta charset="UTF-8"><title>SAFARUMA Admin</title></head>
<body style="margin:0;padding:0;background:#FAF7F0;font-family:Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#FAF7F0;padding:40px 16px;">
<tr><td align="center"><table width="580" cellpadding="0" cellspacing="0" style="max-width:580px;width:100%;">
<tr><td style="background:#1A1209;border-radius:16px 16px 0 0;padding:28px 40px;text-align:center;">
  <span style="font-family:Georgia,serif;font-size:22px;font-weight:700;color:white;">SAFAR<span style="color:#C9A84C;">U</span>MA <span style="font-size:14px;color:rgba(255,255,255,0.5);">Admin</span></span>
</td></tr>
<tr><td style="background:white;padding:40px;border:1px solid #E8DFC8;border-top:none;">
  <h1 style="font-family:Georgia,serif;font-size:22px;color:#1A1209;margin:0 0 16px;">Nouvelle réservation confirmée</h1>
  <table cellpadding="0" cellspacing="0" width="100%">
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;width:40%;">Référence</td><td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:700;font-family:monospace;">${reservation.refNumber}</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;">Pèlerin</td><td style="padding:8px 0;font-size:13px;color:#1A1209;">${pelerinName} (${p.email ?? '—'})</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;">Guide</td><td style="padding:8px 0;font-size:13px;color:#1A1209;">${guideName} (${gu?.email ?? '—'})</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;">Départ</td><td style="padding:8px 0;font-size:13px;color:#1A1209;">${departure} · ${reservation.package.durationDays}j</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;">Personnes</td><td style="padding:8px 0;font-size:13px;color:#1A1209;">${reservation.nbPeople}</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;">Montant total</td><td style="padding:8px 0;font-size:13px;color:#1A1209;font-weight:700;">${reservation.totalPrice} €</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;">Commission</td><td style="padding:8px 0;font-size:13px;color:#DC2626;font-weight:700;">${reservation.commissionAmount} €</td></tr>
    <tr><td colspan="2"><div style="height:1px;background:#E8DFC8;"></div></td></tr>
    <tr><td style="padding:8px 0;font-size:12px;color:#7A6D5A;font-weight:700;text-transform:uppercase;">Net guide</td><td style="padding:8px 0;font-size:13px;color:#1D5C3A;font-weight:700;">${netGuide} €</td></tr>
  </table>
  <div style="text-align:center;margin-top:24px;">
    <a href="https://safaruma.com/admin/reservations" style="display:inline-block;background:#1A1209;color:#F0D897;padding:12px 28px;border-radius:50px;font-size:13px;font-weight:700;text-decoration:none;">Voir dans l'admin</a>
  </div>
</td></tr>
</table></td></tr></table>
</body></html>`,
    }).catch(e => console.error('[reservations PATCH] admin email error', e));
  }

  return NextResponse.json({ success: true });
}
