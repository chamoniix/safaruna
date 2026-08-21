import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireGuide } from '@/lib/require-account';

export async function GET() {
  const access = await requireGuide();
  if (!access.ok) return access.response;
  const guideProfileId = access.actor.guideProfileId;

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
        where: { conversationId: c.id, senderType: 'PELERIN', readAt: null },
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
