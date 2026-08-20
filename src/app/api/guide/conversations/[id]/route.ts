import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit';
import { requireGuide } from '@/lib/require-account';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const access = await requireGuide();
  if (!access.ok) return access.response;
  const guideProfileId = access.actor.guideProfileId;

  const { id } = await params;

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      pelerin: { select: { id: true, name: true, firstName: true, lastName: true } },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conv) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
  if (conv.guideProfileId !== guideProfileId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  // Mark pèlerin messages as read
  const now = new Date();
  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: conv.pelerin.id }, readAt: null },
    data: { readAt: now },
  });

  const p = conv.pelerin;
  const pelerinName = p.name || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || '—';

  const fmt = (d: Date) => {
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('fr-FR');
    return `${time} · ${date}`;
  };

  return NextResponse.json({
    conversation: {
      id: conv.id,
      pelerinName,
    },
    messages: conv.messages.map(m => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      isFromMe: m.senderId === access.actor.legacyUserId,
      createdAt: fmt(new Date(m.createdAt)),
      readAt: m.readAt,
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const limited = await checkRateLimit(req, apiRatelimit);
  if (limited) return limited;

  const access = await requireGuide();
  if (!access.ok) return access.response;
  const guideProfileId = access.actor.guideProfileId;

  const { id } = await params;

  const conv = await prisma.conversation.findUnique({ where: { id } });
  if (!conv) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
  if (conv.guideProfileId !== guideProfileId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

  const now = new Date();

  const [message] = await Promise.all([
    prisma.message.create({
      data: { conversationId: id, senderId: access.actor.legacyUserId, content: content.trim() },
    }),
    prisma.conversation.update({
      where: { id },
      data: { updatedAt: now },
    }),
  ]);

  const time = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const date = now.toLocaleDateString('fr-FR');

  return NextResponse.json({
    message: {
      id: message.id,
      content: message.content,
      createdAt: `${time} · ${date}`,
      isFromMe: true,
    },
  }, { status: 201 });
}
