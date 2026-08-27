import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import { DEFAULT_PLATFORM_PRICING, getPlatformPricing, PLATFORM_PRICING_SETTINGS_ID } from '@/lib/platform-pricing';
import prisma from '@/lib/prisma';

const updateSchema = z.object({
  guideServiceMarkupPercent: z.number().min(0).max(100),
  travelMarkupPercent: z.number().min(0).max(100),
});

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const [guides, revenueByGuide, pricing] = await Promise.all([
    prisma.guideProfile.findMany({
      include: {
        guideAccount: { select: { displayName: true, firstName: true, lastName: true } },
        _count: { select: { reservations: true } },
      },
      orderBy: { guideAccount: { displayName: 'asc' } },
    }),
    prisma.reservation.groupBy({
      by: ['guideProfileId'],
      _sum: { totalPrice: true, commissionAmount: true },
      where: { status: { in: ['CONFIRMED', 'COMPLETED'] } },
    }),
    getPlatformPricing(),
  ]);

  const revenueMap = new Map(
    revenueByGuide.map(r => [r.guideProfileId, r._sum])
  );

  return NextResponse.json({
    guides: guides.map(g => ({
      id: g.id,
      slug: g.slug,
      name: g.guideAccount?.displayName || `${g.guideAccount?.firstName ?? ''} ${g.guideAccount?.lastName ?? ''}`.trim() || '—',
      totalReservations: g._count.reservations,
      totalRevenue: Math.round(revenueMap.get(g.id)?.totalPrice ?? 0),
      totalCommission: Math.round(revenueMap.get(g.id)?.commissionAmount ?? 0),
    })),
    canEdit: actor.role === 'SUPERADMIN',
    guideServiceMarkupPercent: pricing.guideServiceMarkupBps / 100,
    travelMarkupPercent: pricing.travelMarkupBps / 100,
  });
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req);
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  if (actor.role !== 'SUPERADMIN') {
    return NextResponse.json({ error: 'Seul le Superadmin peut modifier les majorations.' }, { status: 403 });
  }

  const parsed = updateSchema.safeParse(await req.json());
  if (!parsed.success) {
    return NextResponse.json({ error: 'Les majorations doivent être comprises entre 0 et 100 %.' }, { status: 400 });
  }

  const after = {
    guideServiceMarkupBps: Math.round(parsed.data.guideServiceMarkupPercent * 100),
    travelMarkupBps: Math.round(parsed.data.travelMarkupPercent * 100),
  };
  const auditContext = getAdminAuditContext(req);

  await prisma.$transaction(async tx => {
    const current = await tx.platformPricingSettings.findUnique({
      where: { id: PLATFORM_PRICING_SETTINGS_ID },
      select: { guideServiceMarkupBps: true, travelMarkupBps: true },
    });
    const before = current ?? DEFAULT_PLATFORM_PRICING;
    await tx.platformPricingSettings.upsert({
      where: { id: PLATFORM_PRICING_SETTINGS_ID },
      update: after,
      create: { id: PLATFORM_PRICING_SETTINGS_ID, ...after },
    });
    await tx.auditLog.create({
      data: {
        actor: actor.email,
        actorRole: actor.role,
        actorAdminId: actor.id,
        action: 'PLATFORM_MARKUPS_UPDATED',
        target: PLATFORM_PRICING_SETTINGS_ID,
        detail: adminAuditDetail(auditContext),
        before,
        after,
        ...adminAuditFields(auditContext),
      },
    });
  });

  return NextResponse.json({
    success: true,
    guideServiceMarkupPercent: after.guideServiceMarkupBps / 100,
    travelMarkupPercent: after.travelMarkupBps / 100,
  });
}
