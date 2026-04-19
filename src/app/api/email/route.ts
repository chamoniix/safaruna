import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomePelerin,
  sendWelcomeGuide,
  sendGuideAccess,
  sendReservationConfirmation,
  sendMessageNotification,
  sendDepartureReminder,
} from '@/lib/email';

export async function POST(req: NextRequest) {
  // ── Vérification : clé interne serveur uniquement ──
  const internalKey = req.headers.get('x-internal-key');
  const validKey = process.env.INTERNAL_API_KEY;

  if (!validKey) {
    console.error('[SECURITY] INTERNAL_API_KEY manquant — route email désactivée');
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }
  if (!internalKey || internalKey !== validKey) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { type } = body;

    switch (type) {
      case 'welcome_pelerin': {
        const { email, name } = body;
        if (!email || !name) return NextResponse.json({ error: 'Missing email or name' }, { status: 400 });
        await sendWelcomePelerin(email, name);
        break;
      }
      case 'welcome_guide': {
        const { email, name } = body;
        if (!email || !name) return NextResponse.json({ error: 'Missing email or name' }, { status: 400 });
        await sendWelcomeGuide(email, name);
        break;
      }
      case 'guide_access': {
        const { email: to, name, email: guideEmail, password, loginUrl } = body;
        if (!to || !name || !password) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        await sendGuideAccess({ to, name, email: guideEmail, password, loginUrl: loginUrl ?? 'https://safaruma.com/guide/connexion' });
        break;
      }
      case 'reservation_confirmation': {
        const { email, pelerinName, guideName, departureDate, nights, amount, reservationId } = body;
        if (!email || !reservationId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        await sendReservationConfirmation({ to: email, pelerinName, guideName, departureDate, nights, amount, reservationId });
        break;
      }
      case 'message_notification': {
        const { email, recipientName, senderName, preview, conversationId } = body;
        if (!email || !conversationId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        await sendMessageNotification({ to: email, recipientName, senderName, preview, conversationId });
        break;
      }
      case 'departure_reminder': {
        const { email, pelerinName, guideName, guidePhone, departureDate, reservationId } = body;
        if (!email || !reservationId) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        await sendDepartureReminder({ to: email, pelerinName, guideName, guidePhone, departureDate, reservationId });
        break;
      }
      default:
        return NextResponse.json({ error: `Unknown email type: ${type}` }, { status: 400 });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[/api/email]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
