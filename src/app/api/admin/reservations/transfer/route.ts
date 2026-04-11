import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';
import { sendEmail } from '@/lib/email';

async function checkAdmin(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_JWT_SECRET ?? '';
  return session && await verifyAdminToken(session, secret);
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { reservationId, newGuideProfileId, motif } = await req.json();

  if (!reservationId || !newGuideProfileId || !motif) {
    return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
  }

  const reservation = await prisma.reservation.findUnique({
    where: { id: reservationId },
    include: {
      pelerin: { select: { name: true, firstName: true, lastName: true, email: true } },
      guideProfile: { include: { user: { select: { name: true, firstName: true, lastName: true } } } },
      package: { select: { name: true } },
    },
  });

  if (!reservation)
    return NextResponse.json({ error: 'Réservation introuvable' }, { status: 404 });

  const newGuide = await prisma.guideProfile.findUnique({
    where: { id: newGuideProfileId },
    include: { user: { select: { name: true, firstName: true, lastName: true } } },
  });

  if (!newGuide)
    return NextResponse.json({ error: 'Nouveau guide introuvable' }, { status: 404 });

  const noteEntry = `[Transfert admin ${new Date().toLocaleDateString('fr-FR')}] ${motif}`;
  const newNotes = reservation.notes
    ? `${noteEntry}\n${reservation.notes}`
    : noteEntry;

  await prisma.reservation.update({
    where: { id: reservationId },
    data: { guideProfileId: newGuideProfileId, notes: newNotes },
  });

  const pelerinEmail = reservation.pelerin.email;
  const pelerinName = reservation.pelerin.name
    || `${reservation.pelerin.firstName ?? ''} ${reservation.pelerin.lastName ?? ''}`.trim()
    || 'Pèlerin';
  const newGuideName = newGuide.user.name
    || `${newGuide.user.firstName ?? ''} ${newGuide.user.lastName ?? ''}`.trim()
    || 'Guide';

  if (pelerinEmail) {
    sendEmail({
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
  <p style="font-size:14px;color:#4A3F30;line-height:1.7;">Bonjour ${pelerinName},</p>
  <p style="font-size:14px;color:#4A3F30;line-height:1.7;">Votre guide pour la réservation <strong>${reservation.refNumber}</strong> a été modifié. Votre nouveau guide est <strong>${newGuideName}</strong>.</p>
  <p style="font-size:14px;color:#4A3F30;line-height:1.7;">Si vous avez des questions, contactez-nous à <a href="mailto:contact@safaruma.com" style="color:#C9A84C;">contact@safaruma.com</a>.</p>
</td></tr>
<tr><td style="background:#F5F0E8;border:1px solid #E8DFC8;border-top:none;border-radius:0 0 16px 16px;padding:20px 40px;text-align:center;">
  <p style="margin:0;font-size:11px;color:#9A8D7A;">SAFARUMA — <a href="https://safaruma.com" style="color:#C9A84C;text-decoration:none;">safaruma.com</a></p>
</td></tr>
</table></td></tr></table>
</body></html>`,
    }).catch(e => console.error('[transfer] email error', e));
  }

  return NextResponse.json({ success: true, newGuideName });
}
