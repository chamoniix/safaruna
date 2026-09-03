import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { requireGuide } from '@/lib/require-account';
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth';
import { guideProfileChangesObjectSchema, NoGuideProfileChangesError, publicPendingRequest, submitGuideProfileChanges } from '@/lib/guide-profile-changes';

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
  const displayName = account.displayName || `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() || account.email || '—';

  return NextResponse.json({
    profile: {
      id: account.id,
      name: displayName,
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
    },
  });
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
