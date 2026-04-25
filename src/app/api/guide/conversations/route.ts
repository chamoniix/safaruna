import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const email  = (session.user as any).email as string | undefined;
  const userId = (session.user as any).id    as string | undefined;
  if (!email && !userId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const user = await prisma.user.findFirst({
    where: email ? { email } : { id: userId },
    include: { guideProfile: { select: { id: true } } },
  });
  if (!user?.guideProfile) return NextResponse.json({ conversations: [] });

  const guideProfileId = user.guideProfile.id;

  const convs = await prisma.conversation.findMany({
    where: { guideProfileId },
    orderBy: { updatedAt: 'desc' },
    include: {
      pelerin: { select: { name: true, firstName: true, lastName: true, email: true } },
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
    },
  });

  const unreadCounts = await Promise.all(
    convs.map(c =>
      prisma.message.count({
        where: { conversationId: c.id, senderId: { not: user.id }, readAt: null },
      })
    )
  );

  return NextResponse.json({
    conversations: convs.map((c, i) => {
      const p = c.pelerin;
      const pelerinName = p.name
        || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim()
        || p.email
        || '—';
      const last = c.messages[0];
      return {
        id: c.id,
        pelerinName,
        lastMessage: last?.content ?? null,
        lastMessageAt: last ? new Date(last.createdAt).toLocaleDateString('fr-FR') : null,
        unreadCount: unreadCounts[i],
        updatedAt: new Date(c.updatedAt).toLocaleDateString('fr-FR'),
      };
    }),
  });
}
