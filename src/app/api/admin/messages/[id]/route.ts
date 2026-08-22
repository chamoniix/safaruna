import { NextRequest, NextResponse } from 'next/server';
import { checkAdmin } from '@/lib/check-admin';
import prisma from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!await checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const { id } = await params;

  const conv = await prisma.conversation.findUnique({
    where: { id },
    include: {
      pelerin: { select: { name: true, firstName: true, email: true } },
      guideProfile: { include: { guideAccount: { select: { displayName: true, firstName: true, email: true } } } },
      messages: {
        orderBy: { createdAt: 'asc' },
        include: {
          senderPelerin: { select: { name: true, firstName: true } },
          senderGuideAccount: { select: { displayName: true, firstName: true } },
        },
      },
    },
  });

  if (!conv) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });

  const p = conv.pelerin;
  const gu = conv.guideProfile.guideAccount;

  return NextResponse.json({
    id: conv.id,
    pelerin: { name: p.name || p.firstName || '—', email: p.email || '—' },
    guide: { name: gu?.displayName || gu?.firstName || '—', email: gu?.email || '—' },
    messages: conv.messages.map(m => {
      const isFromGuide = m.senderType === 'GUIDE';
      const senderName = isFromGuide
        ? m.senderGuideAccount?.displayName || m.senderGuideAccount?.firstName || '—'
        : m.senderPelerin?.name || m.senderPelerin?.firstName || '—';

      return {
        id: m.id,
        content: m.content,
        senderName,
        senderRole: m.senderType,
        isFromGuide,
        createdAt: new Date(m.createdAt).toLocaleString('fr-FR'),
        readAt: m.readAt ? new Date(m.readAt).toLocaleString('fr-FR') : null,
      };
    }),
  });
}
