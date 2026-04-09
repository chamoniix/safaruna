import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email  = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id    as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({ where: email ? { email } : { id: userId } });
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const { id } = await params;

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      guideProfile: {
        include: {
          user: { select: { name: true, firstName: true, lastName: true } }
        }
      },
      messages: { orderBy: { createdAt: 'asc' } },
    },
  });

  if (!conv) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
  if (conv.pelerinId !== user.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  // Mark guide's messages as read
  const now = new Date();
  await prisma.message.updateMany({
    where: { conversationId: id, senderId: { not: user.id }, readAt: null },
    data: { readAt: now },
  });

  const g = conv.guideProfile.user;
  const guideName = g.name || `${g.firstName ?? ''} ${g.lastName ?? ''}`.trim() || '—';

  const fmt = (d: Date) => {
    const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const date = d.toLocaleDateString('fr-FR');
    return `${time} · ${date}`;
  };

  return NextResponse.json({
    conversation: {
      id: conv.id,
      guideName,
      guideSlug: conv.guideProfile.slug,
    },
    messages: conv.messages.map(m => ({
      id: m.id,
      content: m.content,
      senderId: m.senderId,
      isFromMe: m.senderId === user.id,
      createdAt: fmt(new Date(m.createdAt)),
      readAt: m.readAt,
    })),
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email  = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id    as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({ where: email ? { email } : { id: userId } });
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const { id } = await params;

  const conv = await prisma.conversation.findUnique({ where: { id } });
  if (!conv) return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
  if (conv.pelerinId !== user.id) return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });

  const { content } = await req.json();
  if (!content?.trim()) return NextResponse.json({ error: 'Message vide' }, { status: 400 });

  const now = new Date();

  const [message] = await Promise.all([
    prisma.message.create({
      data: { conversationId: id, senderId: user.id, content: content.trim() },
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
