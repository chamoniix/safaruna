import { NextRequest, NextResponse } from 'next/server';
import {
  sendWelcomePelerin,
  sendWelcomeGuide,
  sendReservationConfirmation,
  sendMessageNotification,
  sendDepartureReminder,
} from '@/lib/email';

export async function POST(req: NextRequest) {
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
