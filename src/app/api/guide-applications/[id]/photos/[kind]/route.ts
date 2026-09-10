import { NextRequest } from 'next/server'
import { get } from '@vercel/blob'
import * as Sentry from '@sentry/nextjs'
import prisma from '@/lib/prisma'
import { getAdminActor } from '@/lib/check-admin'
import { requireGuide } from '@/lib/require-account'
import { APPLICATION_PHOTO_KINDS, applicationMediaSelect, applicationPhotoPath, type ApplicationPhotoKind } from '@/lib/guide-application-media'

export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Cookie' }
const denied = (status: number) => Response.json({ error: status === 401 ? 'Non autorisé.' : 'Photo indisponible.' }, { status, headers })

export async function GET(request: NextRequest, context: { params: Promise<{ id: string; kind: string }> }) {
  try {
    const admin = await getAdminActor(request)
    let guideProfileId: string | null = null
    if (!admin) {
      const guide = await requireGuide()
      if (!guide.ok) return denied(401)
      guideProfileId = guide.actor.guideProfileId
    }
    const { id, kind } = await context.params
    if (!APPLICATION_PHOTO_KINDS.includes(kind as ApplicationPhotoKind)) return denied(404)
    const application = await prisma.guideApplication.findFirst({
      where: { id, ...(!admin && { createdGuideProfileId: guideProfileId, status: 'APPROVED' }) },
      select: applicationMediaSelect,
    })
    if (!application) return denied(404)
    const path = applicationPhotoPath(application, kind as ApplicationPhotoKind)
    if (!path) return denied(404)
    const token = process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN
    if (!token) return denied(503)
    const blob = await get(path, { token, access: 'private', useCache: false })
    if (blob?.statusCode !== 200) return denied(404)
    const extension = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }[blob.blob.contentType]
    if (!extension) return denied(415)
    return new Response(blob.stream, { headers: {
      ...headers, 'Content-Type': blob.blob.contentType,
      'Content-Disposition': `${request.nextUrl.searchParams.get('download') === '1' ? 'attachment' : 'inline'}; filename="${kind}.${extension}"`,
    } })
  } catch (error) {
    Sentry.captureException(error, { tags: { area: 'guide-application-photo-read' } })
    return denied(503)
  }
}
