import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireGuide } from '@/lib/require-account';
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth';
import { guideProfileProposalSchema, NoGuideProfileChangesError, publicPendingRequest, safeProfileChanges, profileChangeRevision, submitGuideProfileChanges } from '@/lib/guide-profile-changes';
import { readGuideProfileMedia } from '@/lib/guide-profile-media';
import { GuidePhotoError } from '@/lib/guide-photo';
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

const profilPatchSchema = guideProfileProposalSchema;

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
            select: { id: true, changes: true, before: true, createdAt: true, updatedAt: true },
          },
        },
      },
    },
  });

  if (!account) return NextResponse.json({ error: 'Introuvable' }, { status: 404 });
  if (!account.guideProfile) return NextResponse.json({ error: 'Profil guide introuvable' }, { status: 404 });

  const gp = account.guideProfile;
  const [media, latestDecision, lastReturn] = await Promise.all([
    readGuideProfileMedia(prisma, gp.id),
    prisma.guideProfileChangeRequest.findFirst({
      where: { guideProfileId: gp.id, status: { in: ['APPROVED', 'REJECTED'] } },
      orderBy: [{ reviewedAt: 'desc' }, { id: 'desc' }],
      select: { id: true, status: true, reviewNotes: true, reviewedAt: true, changes: true, before: true, updatedAt: true },
    }),
    prisma.auditLog.findFirst({ where: { target: gp.id, action: 'GUIDE_PROFILE_RETURNED_TO_DRAFT' }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], select: { detail: true, createdAt: true } }),
  ]);
  let profileReturn: { reason: string; at: Date } | null = null;
  if (lastReturn) {
    try {
      const detail = JSON.parse(lastReturn.detail || '{}');
      if (typeof detail.reason === 'string') profileReturn = { reason: detail.reason, at: lastReturn.createdAt };
    } catch { /* Ignore malformed legacy audit metadata. */ }
  }
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
      applicationMedia: media.view,
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
      latestProfileDecision: latestDecision ? { id: latestDecision.id, status: latestDecision.status, reviewNotes: latestDecision.reviewNotes, reviewedAt: latestDecision.reviewedAt, changes: safeProfileChanges(latestDecision.changes, latestDecision.id), revision: profileChangeRevision(latestDecision) } : null,
      profileReturn,
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

  const limited = await checkRateLimit(req, apiRatelimit);
  if (limited) return limited;
  const raw = await req.json().catch(() => null);
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
    if (error instanceof Error && error.message === 'BANK_UNAVAILABLE') return NextResponse.json({ error: 'Les coordonnées bancaires ne peuvent pas être enregistrées actuellement. Réessayez ultérieurement.' }, { status: 503, headers: privateHeaders });
    if (error instanceof z.ZodError || error instanceof GuidePhotoError) {
      return NextResponse.json({ error: 'La proposition contient des informations ou médias invalides.' }, { status: 400, headers: privateHeaders });
    }
    if (error instanceof Error && error.message === 'PROFILE_FORBIDDEN') return NextResponse.json({ error: 'Accès au profil non autorisé.' }, { status: 403, headers: privateHeaders });
    if (error instanceof Error && error.message === 'RESUBMIT_NOT_FOUND') return NextResponse.json({ error: 'Demande à reprendre introuvable.' }, { status: 404, headers: privateHeaders });
    if ((error instanceof Error && error.message === 'PROFILE_CHANGED') || (error instanceof Prisma.PrismaClientKnownRequestError && ['P2034', 'P2002'].includes(error.code))) {
      return NextResponse.json({ error: 'Le dossier a changé. Rechargez la page avant de renvoyer votre demande.' }, { status: 409, headers: privateHeaders });
    }
    throw error;
  }

  return NextResponse.json({
    ok: true,
    pendingApproval: true,
    pendingChangeRequest: publicPendingRequest(pendingRequest),
  }, { headers: privateHeaders });
}
