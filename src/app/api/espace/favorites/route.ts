import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import prisma from '@/lib/prisma'
import { analyticsCountry, analyticsDevice, recordAnalyticsEvent } from '@/lib/analytics'
import { requirePelerin } from '@/lib/require-account'

const noStoreHeaders = {
  'Cache-Control': 'private, no-store, max-age=0',
  'X-Content-Type-Options': 'nosniff',
}

const mutationSchema = z.object({
  guideSlug: z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}).strict()

function response(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: noStoreHeaders })
}

function sameOrigin(req: NextRequest) {
  const origin = req.headers.get('origin')
  return !origin || origin === req.nextUrl.origin
}

async function readMutation(req: NextRequest) {
  const contentLength = Number(req.headers.get('content-length') ?? '0')
  if (contentLength > 1_024) return null
  return mutationSchema.safeParse(await req.json().catch(() => null))
}

function guideName(account: {
  displayName: string | null
  firstName: string | null
  lastName: string | null
}) {
  return account.displayName || `${account.firstName ?? ''} ${account.lastName ?? ''}`.trim() || 'Guide SAFARUMA'
}

export async function GET() {
  const access = await requirePelerin()
  if (!access.ok) return access.response

  try {
    const favorites = await prisma.guideFavorite.findMany({
      where: {
        userId: access.actor.id,
        guideProfile: { status: 'ACTIVE', slug: { not: null }, guideAccount: { is: { status: 'ACTIVE' } } },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        createdAt: true,
        guideProfile: {
          select: {
            slug: true,
            city: true,
            experienceYears: true,
            acceptingBookings: true,
            servesMakkah: true,
            servesMadinah: true,
            guideAccount: {
              select: { displayName: true, firstName: true, lastName: true, image: true },
            },
            languages: { orderBy: { languageCode: 'asc' }, select: { languageCode: true } },
            reviews: {
              where: { status: 'APPROVED' },
              select: { ratingOverall: true },
            },
          },
        },
      },
    })

    return response({
      favorites: favorites.flatMap(favorite => {
        const guide = favorite.guideProfile
        if (!guide.slug || !guide.guideAccount) return []
        const reviewCount = guide.reviews.length
        const rating = reviewCount > 0
          ? Math.round((guide.reviews.reduce((sum, review) => sum + review.ratingOverall, 0) / reviewCount) * 10) / 10
          : null
        return [{
          slug: guide.slug,
          name: guideName(guide.guideAccount),
          city: guide.city,
          experienceYears: guide.experienceYears,
          languages: guide.languages.map(language => language.languageCode),
          image: guide.guideAccount.image,
          rating,
          reviewCount,
          bookable: guide.acceptingBookings && (guide.servesMakkah || guide.servesMadinah),
          savedAt: favorite.createdAt.toISOString(),
        }]
      }),
    })
  } catch (error) {
    console.error('[favorites GET]', error)
    return response({ error: 'Chargement des favoris impossible.' }, 503)
  }
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return response({ error: 'Origine non autorisée' }, 403)

  const access = await requirePelerin()
  if (!access.ok) return access.response

  const parsed = await readMutation(req)
  if (!parsed?.success) return response({ error: 'Guide invalide' }, 400)

  try {
    const guide = await prisma.guideProfile.findFirst({
      where: { slug: parsed.data.guideSlug, status: 'ACTIVE', guideAccount: { is: { status: 'ACTIVE' } } },
      select: { id: true, slug: true },
    })
    if (!guide?.slug) return response({ error: 'Guide introuvable' }, 404)

    const saved = await prisma.guideFavorite.createMany({
      data: [{ userId: access.actor.id, guideProfileId: guide.id }],
      skipDuplicates: true,
    })

    if (saved.count > 0) {
      await recordAnalyticsEvent({
        eventName: 'guide_favorite_added',
        userId: access.actor.id,
        path: `/guides/${guide.slug}`,
        country: analyticsCountry(req.headers.get('x-vercel-ip-country')),
        device: analyticsDevice(req.headers.get('user-agent')),
        metadata: { guideSlug: guide.slug },
      })
    }

    return response({ success: true, favorite: true }, saved.count > 0 ? 201 : 200)
  } catch (error) {
    console.error('[favorites POST]', error)
    return response({ error: 'Enregistrement du favori impossible.' }, 503)
  }
}

export async function DELETE(req: NextRequest) {
  if (!sameOrigin(req)) return response({ error: 'Origine non autorisée' }, 403)

  const access = await requirePelerin()
  if (!access.ok) return access.response

  const parsed = await readMutation(req)
  if (!parsed?.success) return response({ error: 'Guide invalide' }, 400)

  try {
    const guide = await prisma.guideProfile.findUnique({
      where: { slug: parsed.data.guideSlug },
      select: { id: true, slug: true },
    })
    if (!guide?.slug) return response({ success: true, favorite: false })

    const removed = await prisma.guideFavorite.deleteMany({
      where: { userId: access.actor.id, guideProfileId: guide.id },
    })

    if (removed.count > 0) {
      await recordAnalyticsEvent({
        eventName: 'guide_favorite_removed',
        userId: access.actor.id,
        path: `/guides/${guide.slug}`,
        country: analyticsCountry(req.headers.get('x-vercel-ip-country')),
        device: analyticsDevice(req.headers.get('user-agent')),
        metadata: { guideSlug: guide.slug },
      })
    }

    return response({ success: true, favorite: false })
  } catch (error) {
    console.error('[favorites DELETE]', error)
    return response({ error: 'Suppression du favori impossible.' }, 503)
  }
}
