import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit';

async function resolveGuideProfileId(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  if (!session?.user) return null;
  const email  = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id    as string | undefined;
  if (!email && !userId) return null;
  const user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId },
    include: { guideProfile: { select: { id: true } } },
  });
  return user?.guideProfile?.id ?? null;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guideProfileId = await resolveGuideProfileId();
  if (!guideProfileId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

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

  // Get guide's own userId to determine isFromMe
  const guideUser = await prisma.guideProfile.findUnique({
    where: { id: guideProfileId },
    select: { userId: true },
  });

  return NextResponse.json({
    conversation: {
      id: conv.id,
      pelerinName,
    },
    messages: conv.messages.map(m => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      isFromMe: m.senderId === guideUser?.userId,
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

  const guideProfileId = await resolveGuideProfileId();
  if (!guideProfileId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { id } = await params;

  const conv = await prisma.conversation.findUnique({ where: { id } });
  if (!conv) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
  if (conv.guideProfileId !== guideProfileId) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

  const guideUser = await prisma.guideProfile.findUnique({
    where: { id: guideProfileId },
    select: { userId: true },
  });
  if (!guideUser) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 });

  const now = new Date();

  const [message] = await Promise.all([
    prisma.message.create({
      data: { conversationId: id, senderId: guideUser.userId, content: content.trim() },
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
