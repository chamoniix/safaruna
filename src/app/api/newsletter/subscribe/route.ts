import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Corps de requête invalide' }, { status: 400 });
  }

  const email = typeof (body as Record<string, unknown>).email === 'string'
    ? ((body as Record<string, unknown>).email as string).trim().toLowerCase()
    : '';

  if (!email || !EMAIL_RE.test(email)) {
    return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
  }

  // Check if already subscribed
  const existing = await prisma.newsletterSubscription.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ already: true }, { status: 200 });
  }

  // Create subscription
  const subscription = await prisma.newsletterSubscription.create({
    data: { email, source: 'blog' },
  });

  // Update User.newsletterOptIn if a matching user exists
  await prisma.user.updateMany({
    where: { email },
    data: { newsletterOptIn: true },
  });

  // Sync to Brevo (non-blocking)
  let brevoOk = false;
  try {
    const listId = process.env.BREVO_NEWSLETTER_LIST_ID
      ? Number(process.env.BREVO_NEWSLETTER_LIST_ID)
      : undefined;

    const brevoBody: Record<string, unknown> = {
      email,
      updateEnabled: true,
      attributes: { SOURCE: 'blog_safaruma' },
    };
    if (listId !== undefined && !isNaN(listId)) {
      brevoBody.listIds = [listId];
    }

    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'api-key': process.env.BREVO_API_KEY ?? '',
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(brevoBody),
    });

    brevoOk = brevoRes.ok || brevoRes.status === 204;
  } catch (err) {
    console.error('[newsletter] Brevo sync failed', err);
  }

  if (brevoOk) {
    await prisma.newsletterSubscription.update({
      where: { id: subscription.id },
      data: { brevoSynced: true },
    });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}
