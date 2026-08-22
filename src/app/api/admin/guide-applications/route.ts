import { randomBytes } from 'node:crypto'
import bcrypt from 'bcryptjs'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import { sendGuideAccess } from '@/lib/email'
import prisma from '@/lib/prisma'

const updateSchema = z.object({
  applicationId: z.string().min(1),
  status: z.enum(['IN_REVIEW', 'APPROVED', 'REJECTED']),
  reviewNotes: z.string().max(2000).optional(),
})

function slugBase(firstName: string, lastName: string) {
  return `${firstName} ${lastName}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'guide'
}

async function availableSlug(firstName: string, lastName: string) {
  const base = slugBase(firstName, lastName)
  let slug = base
  let suffix = 1
  while (await prisma.guideProfile.findUnique({ where: { slug }, select: { id: true } })) {
    slug = `${base}-${suffix++}`
  }
  return slug
}

function temporaryPassword() {
  return `${randomBytes(12).toString('base64url')}Aa1!`
}

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const statusParam = req.nextUrl.searchParams.get('status')
  const status = ['PENDING', 'IN_REVIEW', 'APPROVED', 'REJECTED'].includes(statusParam || '')
    ? statusParam as 'PENDING' | 'IN_REVIEW' | 'APPROVED' | 'REJECTED'
    : undefined
  const query = (req.nextUrl.searchParams.get('q') || '').trim().slice(0, 120)
  const requestedPage = Number(req.nextUrl.searchParams.get('page') || '1')
  const page = Number.isInteger(requestedPage) ? Math.max(1, requestedPage) : 1
  const pageSize = 10
  const where = {
    ...(status && { status }),
    ...(query && {
      OR: [
        { email: { contains: query, mode: 'insensitive' as const } },
        { firstName: { contains: query, mode: 'insensitive' as const } },
        { lastName: { contains: query, mode: 'insensitive' as const } },
        { whatsapp: { contains: query, mode: 'insensitive' as const } },
      ],
    }),
  }

  const [applications, total, statusCounts] = await Promise.all([
    prisma.guideApplication.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        whatsapp: true,
        city: true,
        gender: true,
        serviceCities: true,
        nationality: true,
        dateOfBirth: true,
        bio: true,
        experienceYears: true,
        education: true,
        languages: true,
        masteredPlaces: true,
        acceptedCharteAt: true,
        status: true,
        reviewNotes: true,
        reviewedByEmail: true,
        reviewedAt: true,
        createdGuideProfileId: true,
        submittedCountry: true,
        submittedDevice: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.guideApplication.count({ where }),
    prisma.guideApplication.groupBy({ by: ['status'], _count: { _all: true } }),
  ])

  return NextResponse.json({
    applications,
    pagination: { page, pageSize, total, pages: Math.max(1, Math.ceil(total / pageSize)) },
    counts: Object.fromEntries(statusCounts.map(row => [row.status, row._count._all])),
  })
}

export async function PATCH(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const auditContext = getAdminAuditContext(req)

  const parsed = updateSchema.safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400 })
  const { applicationId, status, reviewNotes } = parsed.data
  const application = await prisma.guideApplication.findUnique({ where: { id: applicationId } })
  if (!application) return NextResponse.json({ error: 'Candidature introuvable' }, { status: 404 })
  if (application.status === 'APPROVED') {
    return NextResponse.json({ error: 'Cette candidature est déjà validée' }, { status: 409 })
  }

  if (status === 'REJECTED') {
    await prisma.$transaction(async tx => {
      await tx.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: 'GUIDE_APPLICATION_REJECTED',
          target: applicationId,
          detail: adminAuditDetail(auditContext, { email: application.email }),
          before: { status: application.status, reviewNotes: application.reviewNotes },
          after: { status: 'REJECTED', reviewNotes: reviewNotes?.trim() || null, deleted: true },
          ...adminAuditFields(auditContext),
        },
      })
      await tx.emailIdentity.deleteMany({
        where: { email: application.email, kind: 'GUIDE_APPLICATION' },
      })
      await tx.guideApplication.delete({ where: { id: applicationId } })
    })
    return NextResponse.json({ success: true, deleted: true, applicationId })
  }

  if (status === 'IN_REVIEW') {
    const updated = await prisma.$transaction(async tx => {
      const item = await tx.guideApplication.update({
        where: { id: applicationId },
        data: {
          status,
          reviewNotes: reviewNotes?.trim() || null,
          reviewedByAdminId: actor.id,
          reviewedByEmail: actor.email,
          reviewedAt: new Date(),
        },
      })
      await tx.auditLog.create({
        data: {
          actor: actor.email,
          actorRole: actor.role,
          actorAdminId: actor.id,
          action: `GUIDE_APPLICATION_${status}`,
          target: applicationId,
          detail: adminAuditDetail(auditContext, { email: application.email }),
          before: { status: application.status, reviewNotes: application.reviewNotes },
          after: { status, reviewNotes: reviewNotes?.trim() || null },
          ...adminAuditFields(auditContext),
        },
      })
      return item
    })
    return NextResponse.json({ application: updated })
  }

  const [identity, existing, existingGuideAccount] = await Promise.all([
    prisma.emailIdentity.findUnique({ where: { email: application.email }, select: { kind: true } }),
    prisma.user.findUnique({ where: { email: application.email }, select: { id: true } }),
    prisma.guideAccount.findUnique({ where: { email: application.email }, select: { id: true } }),
  ])
  if (existing || existingGuideAccount) return NextResponse.json({ error: 'Un compte existe déjà avec cet email' }, { status: 409 })
  if (identity?.kind !== 'GUIDE_APPLICATION') {
    return NextResponse.json({ error: 'La réservation de cette adresse e-mail est invalide' }, { status: 409 })
  }

  const slug = await availableSlug(application.firstName, application.lastName)
  const password = temporaryPassword()
  const passwordHash = await bcrypt.hash(password, 12)
  const now = new Date()

  const result = await prisma.$transaction(async tx => {
    const user = await tx.user.create({
      data: {
        email: application.email,
        name: `${application.firstName} ${application.lastName}`.trim(),
        firstName: application.firstName,
        lastName: application.lastName,
        phoneWhatsapp: application.whatsapp,
        country: application.nationality,
        passwordHash,
        role: 'GUIDE',
        emailVerified: now,
        guideProfile: {
          create: {
            slug,
            bio: application.bio,
            city: application.city,
            gender: application.gender,
            servesMakkah: application.serviceCities.includes('MAKKAH'),
            servesMadinah: application.serviceCities.includes('MADINAH'),
            nationality: application.nationality,
            dateOfBirth: application.dateOfBirth,
            experienceYears: application.experienceYears,
            ibanEncrypted: application.ibanEncrypted,
            status: 'DRAFT',
            createdByType: actor.role,
            createdByAdminId: actor.id,
            createdByEmail: actor.email,
            approvedByAdminId: actor.id,
            approvedByEmail: actor.email,
            approvedAt: now,
            languages: {
              create: application.languages.map(languageCode => ({ languageCode, level: 'NATIVE' })),
            },
          },
        },
      },
      include: { guideProfile: { select: { id: true } } },
    })
    const guideAccount = await tx.guideAccount.create({
      data: {
        email: application.email.toLowerCase(),
        passwordHash,
        emailVerified: now,
        displayName: `${application.firstName} ${application.lastName}`.trim(),
        firstName: application.firstName,
        lastName: application.lastName,
        phoneWhatsapp: application.whatsapp,
        country: application.nationality,
        legacyUserId: user.id,
        registeredAt: user.createdAt,
      },
    })
    await tx.guideProfile.update({
      where: { id: user.guideProfile!.id },
      data: { guideAccountId: guideAccount.id },
    })
    await tx.emailIdentity.update({
      where: { email: application.email },
      data: { kind: 'GUIDE' },
    })
    await tx.guideApplication.update({
      where: { id: applicationId },
      data: {
        status: 'APPROVED',
        reviewNotes: reviewNotes?.trim() || null,
        reviewedByAdminId: actor.id,
        reviewedByEmail: actor.email,
        reviewedAt: now,
        createdGuideProfileId: user.guideProfile?.id,
      },
    })
    await tx.auditLog.create({
      data: {
        actor: actor.email,
        actorRole: actor.role,
        actorAdminId: actor.id,
        action: 'GUIDE_APPLICATION_APPROVED',
        target: applicationId,
        detail: adminAuditDetail(auditContext, { email: application.email, userId: user.id, guideProfileId: user.guideProfile?.id, slug }),
        before: { status: application.status, reviewNotes: application.reviewNotes },
        after: {
          status: 'APPROVED',
          reviewNotes: reviewNotes?.trim() || null,
          guideProfileId: user.guideProfile?.id,
          approvedByEmail: actor.email,
        },
        ...adminAuditFields(auditContext),
      },
    })
    return user
  })

  try {
    await sendGuideAccess({
      to: application.email,
      name: `${application.firstName} ${application.lastName}`.trim(),
      email: application.email,
      password,
      loginUrl: 'https://safaruma.com/guide/connexion',
      profileActive: false,
    })
  } catch (error) {
    console.error('[guide-application approval email]', error)
  }

  return NextResponse.json({
    success: true,
    applicationId,
    userId: result.id,
    guideProfileId: result.guideProfile?.id,
    slug,
  })
}
