import { randomUUID } from 'node:crypto'
import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import * as Sentry from '@sentry/nextjs'
import { z } from 'zod'
import { APPLICATION_PHOTO_KINDS } from '@/lib/guide-application-media'
import { createApplicationPhotoReceipt } from '@/lib/guide-application-photo-receipt'
import { GuidePhotoError, readPhotoBody, validateGuidePhoto } from '@/lib/guide-photo'
import { guideApplicationPhotoRatelimit } from '@/lib/ratelimit'

export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' }

export async function POST(request: NextRequest) {
  if (request.headers.get('origin') !== request.nextUrl.origin || request.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'Origine non autorisée.' }, { status: 403, headers })
  }
  try {
    const kind = z.enum(APPLICATION_PHOTO_KINDS).safeParse(request.nextUrl.searchParams.get('kind'))
    let rawEmail = ''
    try { rawEmail = decodeURIComponent(request.headers.get('x-guide-email') || '') } catch { /* Invalid header */ }
    const email = z.string().email().max(254).safeParse(rawEmail.trim().toLowerCase())
    if (!kind.success || !email.success) throw new GuidePhotoError('Photo ou adresse e-mail invalide.', 400)
    const token = process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN
    if (!token || !process.env.ENCRYPTION_KEY || !guideApplicationPhotoRatelimit) {
      throw new GuidePhotoError('L’envoi des photos est momentanément indisponible. Réessayez plus tard.', 503)
    }
    // Unlike generic API limits, anonymous storage uploads must fail closed.
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown'
    let permitted
    try { permitted = await guideApplicationPhotoRatelimit.limit(ip) }
    catch { throw new GuidePhotoError('L’envoi des photos est momentanément indisponible. Réessayez plus tard.', 503) }
    if (!permitted.success) return NextResponse.json({ error: 'Trop d’envois de photos. Réessayez plus tard.' }, {
      status: 429, headers: { ...headers, 'Retry-After': String(Math.max(1, Math.ceil((permitted.reset - Date.now()) / 1000))) },
    })
    const bytes = await readPhotoBody(request)
    const contentType = request.headers.get('content-type') || ''
    const metadata = await validateGuidePhoto(bytes, contentType)
    const path = `guide-applications/${randomUUID()}/${kind.data}.${metadata.format}`
    // Mint first: configuration errors cannot leave an uploaded file without a receipt.
    const receipt = createApplicationPhotoReceipt(email.data, kind.data, path)
    await put(path, bytes, { token, access: 'private', contentType, addRandomSuffix: false, allowOverwrite: false })
    return NextResponse.json({ receipt }, { headers })
  } catch (error) {
    if (error instanceof GuidePhotoError) return NextResponse.json({ error: error.message }, { status: error.status, headers })
    Sentry.captureException(error, { tags: { area: 'guide-application-photo-upload' } })
    return NextResponse.json({ error: 'La photo n’a pas pu être envoyée. Réessayez.' }, { status: 503, headers })
  }
}
