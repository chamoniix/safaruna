import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requirePelerin } from '@/lib/require-account';

export async function GET() {
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const convs = await prisma.conversation.findMany({
    where: { pelerinId: access.actor.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      guideProfile: {
        include: {
          guideAccount: { select: { displayName: true, firstName: true, lastName: true, email: true } }
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
        where: { conversationId: c.id, senderType: 'GUIDE', readAt: null },
      })
    )
  );

  return NextResponse.json({
    conversations: convs.map((c, i) => {
      const g = c.guideProfile.guideAccount;
      const guideName = g?.displayName
        || `${g?.firstName ?? ''} ${g?.lastName ?? ''}`.trim()
        || g?.email
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
  const access = await requirePelerin();
  if (!access.ok) return access.response;

  const { guideProfileId } = await req.json();
  if (!guideProfileId) return NextResponse.json({ error: 'guideProfileId requis' }, { status: 400 });

  const existing = await prisma.conversation.findFirst({
    where: { pelerinId: access.actor.id, guideProfileId },
  });
  if (existing) return NextResponse.json({ conversationId: existing.id });

  const conv = await prisma.conversation.create({
    data: { pelerinId: access.actor.id, guideProfileId },
  });

  return NextResponse.json({ conversationId: conv.id }, { status: 201 });
}
