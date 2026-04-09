import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email  = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id    as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({ where: email ? { email } : { id: userId } });
  if (!user) return NextResponse.json({ conversations: [] });

  const convs = await prisma.conversation.findMany({
    where: { pelerinId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      guideProfile: {
        include: {
          user: { select: { name: true, firstName: true, lastName: true, email: true } }
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      }
    }
  });

  // Count unread per conversation (messages from guide not yet read)
  const unreadCounts = await Promise.all(
    convs.map(c =>
      prisma.message.count({
        where: { conversationId: c.id, senderId: { not: user.id }, readAt: null },
      })
    )
  );

  return NextResponse.json({
    conversations: convs.map((c, i) => {
      const g = c.guideProfile.user;
      const guideName = g.name
        || `${g.firstName ?? ''} ${g.lastName ?? ''}`.trim()
        || g.email
        || '—';
      const last = c.messages[0];
      return {
        id: c.id,
        guideName,
        guideSlug: c.guideProfile.slug,
        lastMessage: last?.content ?? null,
        lastMessageAt: last ? new Date(last.createdAt).toLocaleDateString('fr-FR') : null,
        unreadCount: unreadCounts[i],
        updatedAt: new Date(c.updatedAt).toLocaleDateString('fr-FR'),
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email  = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id    as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({ where: email ? { email } : { id: userId } });
  if (!user) return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });

  const { guideProfileId } = await req.json();
  if (!guideProfileId) return NextResponse.json({ error: 'guideProfileId requis' }, { status: 400 });

  const existing = await prisma.conversation.findFirst({
    where: { pelerinId: user.id, guideProfileId },
  });
  if (existing) return NextResponse.json({ conversationId: existing.id });

  const conv = await prisma.conversation.create({
    data: { pelerinId: user.id, guideProfileId },
  });

  return NextResponse.json({ conversationId: conv.id }, { status: 201 });
}
