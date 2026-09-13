import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireGuide } from '@/lib/require-account';
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth';
import { guideProfileChangesObjectSchema, NoGuideProfileChangesError, publicPendingRequest, submitGuideProfileChanges } from '@/lib/guide-profile-changes';
import { applicationMediaSelect, applicationMediaView } from '@/lib/guide-application-media';
import { Prisma } from '@prisma/client';
import { z } from 'zod';
import { dossierAction, readGuideDossier } from '@/lib/guide-dossier';
import { GUIDE_DOSSIER_ACKNOWLEDGEMENTS } from '@/lib/guide-payout-policy';
import { apiRatelimit, checkRateLimit } from '@/lib/ratelimit';

const privateHeaders = { 'Cache-Control': 'private, no-store' };
const confirmationsSchema = z.object({
  confirmations: z.array(z.object({
    section: z.enum(['bank', 'rates', 'terms', 'calendar']),
    revision: z.string().regex(/^[a-f0-9]{64}$/),
  }).strict()).min(1).max(4).refine(items => new Set(items.map(item => item.section)).size === items.length),
}).strict();

const profilPatchSchema = guideProfileChangesObjectSchema.pick({
  firstName: true,
  lastName: true,
  phoneWhatsapp: true,
  country: true,
  bio: true,
  city: true,
  gender: true,
  nationality: true,
  experienceYears: true,
  languages: true,
  pricingCorrectionRequest: true,
  personalCorrectionRequest: true,
  languagesCorrectionRequest: true,
}).refine(value => Object.keys(value).length > 0, 'Aucune modification transmise.');

export async function GET() {
  const access = await requireGuide();
  if (!access.ok) return access.response;

  const account = await prisma.guideAccount.findUnique({
    where: { id: access.actor.id },
    include: {
      guideProfile: {
        include: {
          languages: { select: { id: true, languageCode: true, level: true } },
          changeRequests: {
            where: { status: 'PENDING' },
            orderBy: { updatedAt: 'desc' },
            take: 1,
            select: { id: true, changes: true, createdAt: true, updatedAt: true },
          },
        },
      },
    },
  });

  if (!account) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!account.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const gp = account.guideProfile;
  const application = await prisma.guideApplication.findFirst({
    where: { createdGuideProfileId: gp.id, status: 'APPROVED' },
    orderBy: { createdAt: 'desc' }, select: applicationMediaSelect,
  });
  const displayName = account.displayName || `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() || account.email || '—';
  let dossier;
  try {
    dossier = await readGuideDossier(prisma, access.actor.id);
  } catch (error) {
    if (error instanceof Error && error.message === 'DOSSIER_NOT_FOUND') return NextResponse.json({ error: 'Dossier introuvable.' }, { status: 404, headers: privateHeaders });
    if (error instanceof Error && error.message === 'DOSSIER_FORBIDDEN') return NextResponse.json({ error: 'Accès au dossier non autorisé.' }, { status: 403, headers: privateHeaders });
    throw error;
  }

  return NextResponse.json({
    profile: {
      id: account.id,
      name: displayName,
      image: account.image || null,
      applicationMedia: application ? applicationMediaView(application) : null,
      firstName: account.firstName,
      lastName: account.lastName,
      email: account.email || '—',
      phoneWhatsapp: account.phoneWhatsapp,
      country: account.country,
      slug: gp.slug,
      status: gp.status,
      bio: gp.bio,
      city: gp.city,
      gender: gp.gender,
      servesMakkah: gp.servesMakkah,
      servesMadinah: gp.servesMadinah,
      acceptingBookings: gp.acceptingBookings,
      makkahNetUpTo6Cents: gp.makkahNetUpTo6Cents,
      makkahNetUpTo15Cents: gp.makkahNetUpTo15Cents,
      makkahNetUpTo32Cents: gp.makkahNetUpTo32Cents,
      madinahNetUpTo6Cents: gp.madinahNetUpTo6Cents,
      madinahNetUpTo15Cents: gp.madinahNetUpTo15Cents,
      madinahNetUpTo32Cents: gp.madinahNetUpTo32Cents,
      nationality: gp.nationality,
      experienceYears: gp.experienceYears,
      languages: gp.languages,
      pendingChangeRequest: publicPendingRequest(gp.changeRequests[0] || null),
      createdAt: new Date(account.registeredAt).toLocaleDateString('fr-FR'),
      dossier: dossier.view,
    },
  }, { headers: privateHeaders });
}

// This records the Guide's own declarations only. It neither approves bank
// ownership nor activates a profile, changes prices or initiates a transfer.
export async function POST(req: NextRequest) {
  if (!hasTrustedGuideAuthOrigin(req)) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403, headers: privateHeaders });
  const access = await requireGuide();
  if (!access.ok) return access.response;
  const limited = await checkRateLimit(req, apiRatelimit);
  if (limited) return limited;
  const parsed = confirmationsSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Sélectionnez les confirmations à enregistrer.' }, { status: 400, headers: privateHeaders });
  const context = getGuideRequestContext(req);
  try {
    const dossier = await prisma.$transaction(async tx => {
      const current = await readGuideDossier(tx, access.actor.id);
      for (const requested of parsed.data.confirmations) {
        const section = current.view.confirmations.find(item => item.section === requested.section)!;
        if (section.revision !== requested.revision) throw new Error('DOSSIER_CHANGED');
        if (!section.ready) throw new Error('DOSSIER_INCOMPLETE');
        if (section.confirmed) continue;
        await tx.auditLog.create({ data: {
          actor: access.actor.email, actorRole: 'GUIDE', target: current.guideProfileId,
          action: dossierAction(requested.section), ip: context.ip, userAgent: context.userAgent,
          detail: JSON.stringify({ guideAccountId: access.actor.id, section: requested.section, country: context.country, city: context.city, device: context.device, browser: context.browser }),
          after: { revision: section.revision, acknowledgement: GUIDE_DOSSIER_ACKNOWLEDGEMENTS[requested.section], snapshot: current.snapshots[requested.section] } as Prisma.InputJsonObject,
        } });
      }
      return (await readGuideDossier(tx, access.actor.id)).view;
    }, { isolationLevel: Prisma.TransactionIsolationLevel.Serializable });
    return NextResponse.json({ ok: true, dossier }, { headers: privateHeaders });
  } catch (error) {
    if (error instanceof Error && error.message === 'DOSSIER_NOT_FOUND') return NextResponse.json({ error: 'Dossier introuvable.' }, { status: 404, headers: privateHeaders });
    if (error instanceof Error && error.message === 'DOSSIER_FORBIDDEN') return NextResponse.json({ error: 'Accès au dossier non autorisé.' }, { status: 403, headers: privateHeaders });
    if (error instanceof Error && error.message === 'DOSSIER_INCOMPLETE') return NextResponse.json({ error: 'Complétez les informations de la rubrique avant de la confirmer.' }, { status: 400, headers: privateHeaders });
    if ((error instanceof Error && error.message === 'DOSSIER_CHANGED') || (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034')) {
      return NextResponse.json({ error: 'Le dossier a changé. Rechargez la page et vérifiez les informations avant de confirmer.' }, { status: 409, headers: privateHeaders });
    }
    throw error;
  }
}

export async function PATCH(req: NextRequest) {
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 });
  }
  const access = await requireGuide();
  if (!access.ok) return access.response;

  const raw = await req.json();
  const parsed = profilPatchSchema.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Données invalides' }, { status: 400 });
  }
  let pendingRequest;
  try {
    pendingRequest = await submitGuideProfileChanges({
      actor: access.actor,
      changes: parsed.data,
      context: getGuideRequestContext(req),
    });
  } catch (error) {
    if (error instanceof NoGuideProfileChangesError) {
      return NextResponse.json({ error: 'Aucune modification à envoyer.' }, { status: 400 });
    }
    throw error;
  }

  return NextResponse.json({
    ok: true,
    pendingApproval: true,
    pendingChangeRequest: publicPendingRequest(pendingRequest),
  });
}
