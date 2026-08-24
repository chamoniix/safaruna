import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin';
import prisma from '@/lib/prisma';
import { decrypt } from '@/lib/crypto';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const actor = await getAdminActor(req);
  if (!actor)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

  const { slug } = await params;

  try {
    const guide = await prisma.guideProfile.findUnique({
      where: { slug },
      include: {
        guideAccount: {
          select: {
            id: true, displayName: true, firstName: true,
            lastName: true, email: true, registeredAt: true,
            phoneWhatsapp: true, image: true
          }
        },
        languages: true,
        reservations: {
          take: 10,
          orderBy: { createdAt: 'desc' },
        },
        availabilities: {
          orderBy: { date: 'asc' },
          take: 30,
        },
        places: true,
      },
    });

    if (!guide)
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });

    // Stats séparées — sans filtres imbriqués
    const totalReservations = await prisma.reservation.count({
      where: { guideProfileId: guide.id },
    });

    const revenueAgg = await prisma.reservation.aggregate({
      where: { guideProfileId: guide.id, status: 'COMPLETED' },
      _sum: { totalPrice: true },
    });

    // Conversations séparées — sans include imbriqué complexe
    const conversations = await prisma.conversation.findMany({
      where: { guideProfileId: guide.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        pelerin: {
          select: {
            name: true, firstName: true,
            lastName: true, email: true
          }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    return NextResponse.json({
      permissions: {
        canManagePricing: actor.role === 'SUPERADMIN',
      },
      guide: {
        id: guide.id,
        slug: guide.slug,
        bio: guide.bio,
        city: guide.city,
        gender: guide.gender,
        servesMakkah: guide.servesMakkah,
        servesMadinah: guide.servesMadinah,
        acceptingBookings: guide.acceptingBookings,
        makkahNetUpTo6Cents: guide.makkahNetUpTo6Cents,
        makkahNetUpTo15Cents: guide.makkahNetUpTo15Cents,
        makkahNetUpTo32Cents: guide.makkahNetUpTo32Cents,
        madinahNetUpTo6Cents: guide.madinahNetUpTo6Cents,
        madinahNetUpTo15Cents: guide.madinahNetUpTo15Cents,
        madinahNetUpTo32Cents: guide.madinahNetUpTo32Cents,
        nationality: guide.nationality,
        experienceYears: guide.experienceYears,
        status: guide.status,
        createdByType: guide.createdByType,
        createdByEmail: guide.createdByEmail,
        createdAt: guide.createdAt,
        approvedByEmail: guide.approvedByEmail,
        approvedAt: guide.approvedAt,
        responseTimeAvg: guide.responseTimeAvg,
        completionRate: guide.completionRate,
        user: {
          id: guide.guideAccount?.id || guide.id,
          name: guide.guideAccount?.displayName || null,
          firstName: guide.guideAccount?.firstName || null,
          lastName: guide.guideAccount?.lastName || null,
          email: guide.guideAccount?.email || null,
          createdAt: guide.guideAccount?.registeredAt || guide.createdAt,
          phoneWhatsapp: guide.guideAccount?.phoneWhatsapp || null,
          image: guide.guideAccount?.image || null,
        },
        languages: guide.languages,
        reservations: guide.reservations.map(r => ({
          id: r.id,
          refNumber: r.refNumber,
          startDate: r.startDate,
          nbPeople: r.nbPeople,
          totalPrice: r.totalPrice,
          status: r.status,
          createdAt: r.createdAt,
        })),
        ibanMasked: (() => {
          if (!guide.ibanEncrypted) return null
          try {
            const plain = decrypt(guide.ibanEncrypted)
            return '••••' + plain.slice(-4)
          } catch {
            // Legacy plaintext IBAN (before encryption migration)
            return '••••' + guide.ibanEncrypted.slice(-4)
          }
        })(),
        availabilities: guide.availabilities.map(a => ({
          id: a.id,
          date: a.date.toISOString().split('T')[0],
          status: a.status,
        })),
        conversations: conversations.map(c => ({
          id: c.id,
          pelerinName: c.pelerin.name
            || `${c.pelerin.firstName ?? ''} ${c.pelerin.lastName ?? ''}`.trim()
            || c.pelerin.email || '—',
          lastMessage: c.messages[0]?.content?.slice(0, 80) || '',
          lastMessageAt: c.messages[0]
            ? new Date(c.messages[0].createdAt).toLocaleDateString('fr-FR')
            : '',
        })),
        places: guide.places.map(p => ({
          id: p.id,
          placeKey: p.placeKey,
          isActive: p.isActive,
        })),
        interviewScore: guide.interviewScore,
        interviewNotes: guide.interviewNotes,
        interviewDate: guide.interviewDate
          ? guide.interviewDate.toLocaleDateString('fr-FR')
          : null,
        interviewedBy: guide.interviewedBy,
        stats: {
          totalReservations,
          totalRevenue: Math.round(revenueAgg._sum.totalPrice || 0),
          avgRating: null,
        },
      },
    });
  } catch (err) {
    console.error('[admin/guides/slug GET]', err);
    return NextResponse.json(
      { error: 'Erreur serveur' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const actor = await getAdminActor(req);
  if (!actor)
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  const auditContext = getAdminAuditContext(req);

  const { slug } = await params;
  const body = await req.json();
  if (body.email !== undefined) {
    return NextResponse.json(
      { error: 'L’adresse e-mail doit être modifiée et vérifiée par le guide.' },
      { status: 403 },
    );
  }
  if (body.status !== undefined) {
    return NextResponse.json(
      { error: 'Utilisez l’action dédiée pour activer ou suspendre le guide.' },
      { status: 400 },
    );
  }
  const pricingFields = [
    'makkahNetUpTo6Cents', 'makkahNetUpTo15Cents', 'makkahNetUpTo32Cents',
    'madinahNetUpTo6Cents', 'madinahNetUpTo15Cents', 'madinahNetUpTo32Cents',
  ];
  if (actor.role !== 'SUPERADMIN' && pricingFields.some(key => body[key] !== undefined)) {
    return NextResponse.json(
      { error: 'Seul le Superadmin peut modifier les tarifs.' },
      { status: 403 },
    );
  }
  const audit = (
    action: string,
    target: string,
    options: {
      detail?: Record<string, unknown>
      before?: Prisma.InputJsonValue
      after?: Prisma.InputJsonValue
    } = {},
  ) => prisma.auditLog.create({
    data: {
      actor: actor.email,
      actorRole: actor.role,
      actorAdminId: actor.id,
      action,
      target,
      detail: adminAuditDetail(auditContext, options.detail),
      before: options.before,
      after: options.after,
      ...adminAuditFields(auditContext),
    },
  });

  try {
    const guide = await prisma.guideProfile.findUnique({
      where: { slug },
      include: {
        guideAccount: { select: { firstName: true, lastName: true, phoneWhatsapp: true, email: true } },
      },
    });
    if (!guide)
      return NextResponse.json({ error: 'Guide introuvable' }, { status: 404 });

    if (body.firstName !== undefined || body.lastName !== undefined ||
        body.phoneWhatsapp !== undefined) {
      if (!guide.guideAccountId) {
        return NextResponse.json({ error: 'Compte guide introuvable' }, { status: 409 });
      }
      const identityData = {
        ...(body.firstName !== undefined && { firstName: body.firstName }),
        ...(body.lastName !== undefined && { lastName: body.lastName }),
        ...(body.phoneWhatsapp !== undefined && { phoneWhatsapp: body.phoneWhatsapp }),
      };
      await prisma.guideAccount.update({
          where: { id: guide.guideAccountId },
          data: {
            ...identityData,
            ...((body.firstName !== undefined || body.lastName !== undefined) && {
              displayName: `${body.firstName ?? ''} ${body.lastName ?? ''}`.trim() || undefined,
            }),
          },
        });
      const fields = ['firstName', 'lastName', 'phoneWhatsapp'].filter(key => body[key] !== undefined);
      await audit('GUIDE_IDENTITY_UPDATED', guide.id, {
        detail: { fields },
        before: {
          ...(body.firstName !== undefined && { firstName: guide.guideAccount?.firstName }),
          ...(body.lastName !== undefined && { lastName: guide.guideAccount?.lastName }),
          ...(body.phoneWhatsapp !== undefined && { phoneWhatsapp: guide.guideAccount?.phoneWhatsapp }),
        },
        after: identityData,
      });
      return NextResponse.json({ success: true });
    }

    if (body.interviewScore !== undefined || body.interviewNotes !== undefined) {
      await prisma.guideProfile.update({
        where: { slug },
        data: {
          ...(body.interviewScore !== undefined && {
            interviewScore: Number(body.interviewScore),
          }),
          ...(body.interviewNotes !== undefined && {
            interviewNotes: body.interviewNotes,
          }),
          ...(body.interviewDate !== undefined && {
            interviewDate: new Date(body.interviewDate),
          }),
          interviewedBy: actor.email,
        },
      });
      await audit('GUIDE_INTERVIEW_UPDATED', guide.id, {
        before: {
          interviewScore: guide.interviewScore,
          interviewNotes: guide.interviewNotes,
          interviewDate: guide.interviewDate?.toISOString() || null,
          interviewedBy: guide.interviewedBy,
        },
        after: {
          ...(body.interviewScore !== undefined && { interviewScore: Number(body.interviewScore) }),
          ...(body.interviewNotes !== undefined && { interviewNotes: body.interviewNotes }),
          ...(body.interviewDate !== undefined && { interviewDate: new Date(body.interviewDate).toISOString() }),
          interviewedBy: actor.email,
        },
      });
      return NextResponse.json({ success: true });
    }

    // Ajouter une langue
    if (body.addLanguage) {
      await prisma.guideLanguage.create({
        data: {
          guideProfileId: guide.id,
          languageCode: body.addLanguage.code,
          level: body.addLanguage.level || 'NATIVE',
        }
      })
      await audit('GUIDE_LANGUAGE_ADDED', guide.id, { after: body.addLanguage })
      return NextResponse.json({ success: true })
    }

    // Supprimer une langue
    if (body.deleteLanguageId) {
      const deletedLanguage = await prisma.guideLanguage.findUnique({ where: { id: body.deleteLanguageId } })
      if (!deletedLanguage || deletedLanguage.guideProfileId !== guide.id) {
        return NextResponse.json({ error: 'Langue introuvable' }, { status: 404 })
      }
      await prisma.guideLanguage.delete({
        where: { id: body.deleteLanguageId }
      })
      await audit('GUIDE_LANGUAGE_DELETED', guide.id, {
        before: { languageCode: deletedLanguage.languageCode, level: deletedLanguage.level },
        after: { deleted: true },
      })
      return NextResponse.json({ success: true })
    }

    // Toggle lieu actif/inactif
    if (body.togglePlace) {
      const existing = await prisma.guidePlace.findFirst({
        where: { guideProfileId: guide.id, placeKey: body.togglePlace },
      })
      if (existing) {
        await prisma.guidePlace.update({
          where: { id: existing.id },
          data: { isActive: !existing.isActive },
        })
      } else {
        await prisma.guidePlace.create({
          data: { guideProfileId: guide.id, placeKey: body.togglePlace, isActive: true },
        })
      }
      await audit('GUIDE_PLACE_TOGGLED', guide.id, {
        detail: { placeKey: body.togglePlace },
        before: { isActive: existing?.isActive ?? null },
        after: { isActive: existing ? !existing.isActive : true },
      })
      return NextResponse.json({ success: true })
    }

    const profileFields = [
      'bio', 'city', 'gender', 'servesMakkah', 'servesMadinah', 'acceptingBookings',
      'makkahNetUpTo6Cents', 'makkahNetUpTo15Cents', 'makkahNetUpTo32Cents',
      'madinahNetUpTo6Cents', 'madinahNetUpTo15Cents', 'madinahNetUpTo32Cents',
      'nationality', 'experienceYears',
    ] as const;
    const changedProfileFields = profileFields.filter(key => body[key] !== undefined);
    const beforeProfile = Object.fromEntries(changedProfileFields.map(key => [key, guide[key]]));

    await prisma.$transaction([
      prisma.guideProfile.update({
        where: { slug },
        data: {
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.city !== undefined && { city: body.city }),
        ...(body.gender !== undefined && { gender: body.gender }),
        ...(body.servesMakkah !== undefined && { servesMakkah: Boolean(body.servesMakkah) }),
        ...(body.servesMadinah !== undefined && { servesMadinah: Boolean(body.servesMadinah) }),
        ...(body.acceptingBookings !== undefined && { acceptingBookings: Boolean(body.acceptingBookings) }),
        ...(body.makkahNetUpTo6Cents !== undefined && { makkahNetUpTo6Cents: Math.max(0, Math.round(Number(body.makkahNetUpTo6Cents))) }),
        ...(body.makkahNetUpTo15Cents !== undefined && { makkahNetUpTo15Cents: Math.max(0, Math.round(Number(body.makkahNetUpTo15Cents))) }),
        ...(body.makkahNetUpTo32Cents !== undefined && { makkahNetUpTo32Cents: Math.max(0, Math.round(Number(body.makkahNetUpTo32Cents))) }),
        ...(body.madinahNetUpTo6Cents !== undefined && { madinahNetUpTo6Cents: Math.max(0, Math.round(Number(body.madinahNetUpTo6Cents))) }),
        ...(body.madinahNetUpTo15Cents !== undefined && { madinahNetUpTo15Cents: Math.max(0, Math.round(Number(body.madinahNetUpTo15Cents))) }),
        ...(body.madinahNetUpTo32Cents !== undefined && { madinahNetUpTo32Cents: Math.max(0, Math.round(Number(body.madinahNetUpTo32Cents))) }),
        ...(body.nationality !== undefined && { nationality: body.nationality }),
        ...(body.experienceYears !== undefined && {
          experienceYears: Number(body.experienceYears)
        }),
        },
      }),
    ]);
    const afterProfile = Object.fromEntries(changedProfileFields.map(key => {
      if (key === 'servesMakkah' || key === 'servesMadinah' || key === 'acceptingBookings') {
        return [key, Boolean(body[key])];
      }
      if (key.endsWith('Cents')) return [key, Math.max(0, Math.round(Number(body[key])))];
      if (key === 'experienceYears') return [key, Number(body[key])];
      return [key, body[key]];
    }));
    await audit('GUIDE_PROFILE_UPDATED', guide.id, {
      detail: { fields: changedProfileFields },
      before: beforeProfile,
      after: afterProfile,
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[admin/guides/slug PATCH]', err);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
