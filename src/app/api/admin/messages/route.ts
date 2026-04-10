import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/admin-auth';
import prisma from '@/lib/prisma';

async function checkAdmin(req: NextRequest) {
  const session = req.cookies.get('admin_session')?.value;
  const secret = process.env.ADMIN_JWT_SECRET ?? '';
  return session && await verifyAdminToken(session, secret);
}

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const conversations = await prisma.conversation.findMany({
    orderBy: { updatedAt: 'desc' },
    take: 100,
    include: {
      pelerin: { select: { name: true, firstName: true, lastName: true, email: true } },
      guideProfile: { include: { user: { select: { name: true, firstName: true } } } },
      messages: { orderBy: { createdAt: 'desc' }, take: 1 },
      _count: { select: { messages: true } },
    },
  });

  const today = new Date().toDateString();

  return NextResponse.json({
    conversations: conversations.map(c => {
      const p = c.pelerin;
      const gu = c.guideProfile.user;
      return {
        id: c.id,
        pelerinName: p.name || `${p.firstName ?? ''} ${p.lastName ?? ''}`.trim() || p.email || '—',
        guideName: gu.name || gu.firstName || '—',
        lastMessage: c.messages[0]?.content?.slice(0, 100) || '',
        lastMessageAt: c.messages[0]
          ? new Date(c.messages[0].createdAt).toLocaleDateString('fr-FR')
          : new Date(c.updatedAt).toLocaleDateString('fr-FR'),
        totalMessages: c._count.messages,
        updatedAt: new Date(c.updatedAt).toLocaleDateString('fr-FR'),
      };
    }),
    stats: {
      total: conversations.length,
      today: conversations.filter(c => c.messages[0] && new Date(c.messages[0].createdAt).toDateString() === today).length,
    },
  });
}
