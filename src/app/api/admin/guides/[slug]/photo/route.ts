import { NextRequest } from 'next/server'
import { revalidatePath } from 'next/cache'
import { put } from '@vercel/blob'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { adminAuditDetail, adminAuditFields, getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import { apiRatelimit, checkRateLimitKey } from '@/lib/ratelimit'
import { createGuidePhotoHandlers, GuidePhotoError } from '@/lib/guide-photo'

export const runtime = 'nodejs'

const select = {
  id: true, slug: true,
  guideAccount: { select: { id: true, image: true, updatedAt: true } },
} as const

const handlers = createGuidePhotoHandlers({
  getActor: request => getAdminActor(request as NextRequest),
  findGuide: slug => prisma.guideProfile.findUnique({ where: { slug }, select }),
  limit: (_request, actor) => checkRateLimitKey(apiRatelimit, `guide-photo:${actor.id}`),
  async upload(path, bytes, contentType) {
    if (!process.env.BLOB_STORE_ID) throw new GuidePhotoError('Stockage des photos non configuré.', 503)
    // The SDK uses Vercel OIDC automatically. No permanent token or public client credentials.
    return put(path, bytes, { access: 'public', contentType, addRandomSuffix: true, allowOverwrite: false })
  },
  async publish({ request, actor, guide, url, bytes, width, height }) {
    const account = guide.guideAccount!
    const context = getAdminAuditContext(request as NextRequest)
    const updated = await prisma.$transaction(async tx => {
      const current = await tx.guideProfile.findUnique({ where: { id: guide.id }, select })
      if (current?.guideAccount?.id !== account.id) throw new GuidePhotoError('Le compte associé au guide a changé.', 409)
      const changed = await tx.guideAccount.updateMany({
        where: { id: account.id, image: account.image, updatedAt: account.updatedAt },
        data: { image: url },
      })
      if (changed.count !== 1) throw new GuidePhotoError('La fiche a changé. Rechargez la photo avant de publier.', 409)
      await tx.auditLog.create({ data: {
        actor: actor.email, actorRole: actor.role, actorAdminId: actor.id,
        action: 'GUIDE_PHOTO_PUBLISHED', target: guide.id,
        before: { image: account.image }, after: { image: url },
        detail: adminAuditDetail(context, { guideAccountId: account.id, bytes, width, height }),
        ...adminAuditFields(context),
      } })
      return tx.guideProfile.findUniqueOrThrow({ where: { id: guide.id }, select })
    })
    if (updated.slug) revalidatePath(`/guides/${updated.slug}`)
    return updated
  },
  report(error, uploadedUrl) {
    Sentry.captureException(error, { tags: { area: 'guide-photo-publication' }, extra: { uploadedUrl } })
  },
})

type Context = { params: Promise<{ slug: string }> }
export async function GET(request: NextRequest, context: Context) {
  return handlers.GET(request, (await context.params).slug)
}
export async function POST(request: NextRequest, context: Context) {
  return handlers.POST(request, (await context.params).slug)
}
