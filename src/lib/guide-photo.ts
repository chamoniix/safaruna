import { createHash, randomUUID } from 'node:crypto'
import sharp from 'sharp'

export const MAX_GUIDE_PHOTO_BYTES = 4_000_000
const MAX_PHOTO_PIXELS = 40_000_000
const FORMATS = { 'image/jpeg': 'jpeg', 'image/png': 'png', 'image/webp': 'webp' } as const

export class GuidePhotoError extends Error {
  constructor(message: string, readonly status: number) { super(message) }
}

export type PhotoActor = { id: string | null; email: string; role: 'SUPERADMIN' | 'ADMIN' }
export type PhotoGuide = {
  id: string
  slug: string | null
  guideAccount: { id: string; image: string | null; updatedAt: Date } | null
}

export function photoState(guide: PhotoGuide, actor: PhotoActor) {
  const account = guide.guideAccount
  // Same fallback as the existing public profile; no migration of Naim's file in lot 1.
  const image = account?.image || (guide.slug === 'naim-laamari' ? '/images/landing/guide-naim-laamari.jpg' : null)
  const version = createHash('sha256').update(JSON.stringify([
    guide.id, account?.id, account?.image, account?.updatedAt.toISOString(),
  ])).digest('hex')
  return { image, version: `"${version}"`, canPublish: actor.role === 'SUPERADMIN' && Boolean(account) }
}

export async function readPhotoBody(request: Request): Promise<Buffer> {
  const size = request.headers.get('content-length')
  if (size && (!/^\d+$/.test(size) || Number(size) > MAX_GUIDE_PHOTO_BYTES)) {
    throw new GuidePhotoError('La photo doit peser au maximum 4 Mo.', 413)
  }
  if (!request.body) throw new GuidePhotoError('Choisissez une photo.', 400)
  const reader = request.body.getReader()
  const chunks: Uint8Array[] = []
  let bytes = 0
  try {
    while (true) {
      const part = await reader.read()
      if (part.done) break
      bytes += part.value.byteLength
      if (bytes > MAX_GUIDE_PHOTO_BYTES) {
        await reader.cancel()
        throw new GuidePhotoError('La photo doit peser au maximum 4 Mo.', 413)
      }
      chunks.push(part.value)
    }
  } finally { reader.releaseLock() }
  if (!bytes) throw new GuidePhotoError('Le fichier est vide.', 400)
  return Buffer.concat(chunks)
}

export async function validateGuidePhoto(bytes: Buffer, contentType: string) {
  if (!(contentType in FORMATS)) throw new GuidePhotoError('Formats acceptés : JPEG, PNG et WebP.', 415)
  try {
    const image = sharp(bytes, { limitInputPixels: MAX_PHOTO_PIXELS, failOn: 'warning' })
    const metadata = await image.metadata()
    if (metadata.format !== FORMATS[contentType as keyof typeof FORMATS]
      || !metadata.width || !metadata.height
      || metadata.width > 12_000 || metadata.height > 12_000
      || (metadata.pages ?? 1) !== 1) {
      throw new Error('Invalid format, dimensions or animation')
    }
    // Decode the entire image to reject truncated/corrupt files. No compression or rewriting.
    await image.stats()
    return { width: metadata.width, height: metadata.height, format: metadata.format }
  } catch {
    throw new GuidePhotoError('Photo invalide : utilisez une image fixe JPEG, PNG ou WebP, limitée à 40 mégapixels et 12 000 pixels par côté.', 400)
  }
}

type PhotoDependencies = {
  getActor(request: Request): Promise<PhotoActor | null>
  findGuide(slug: string): Promise<PhotoGuide | null>
  limit(request: Request, actor: PhotoActor): Promise<Response | null>
  upload(path: string, bytes: Buffer, contentType: string): Promise<{ url: string }>
  publish(input: {
    request: Request; actor: PhotoActor; guide: PhotoGuide; url: string
    bytes: number; width: number; height: number
  }): Promise<PhotoGuide>
  report(error: unknown, uploadedUrl: string | null): void
}

const json = (data: unknown, status = 200) => Response.json(data, {
  status, headers: { 'Cache-Control': 'private, no-store' },
})

export function createGuidePhotoHandlers(deps: PhotoDependencies) {
  async function load(request: Request, slug: string, writing = false) {
    const actor = await deps.getActor(request)
    if (!actor) throw new GuidePhotoError('Non autorisé.', 401)
    if (writing && actor.role !== 'SUPERADMIN') throw new GuidePhotoError('Seul le Superadmin peut publier une photo.', 403)
    if (writing && (request.headers.get('origin') !== new URL(request.url).origin
      || request.headers.get('sec-fetch-site') === 'cross-site')) {
      throw new GuidePhotoError('Origine non autorisée.', 403)
    }
    const guide = await deps.findGuide(slug)
    if (!guide) throw new GuidePhotoError('Guide introuvable.', 404)
    return { actor, guide }
  }

  function failure(error: unknown, uploadedUrl: string | null = null) {
    if (!(error instanceof GuidePhotoError) || uploadedUrl) deps.report(error, uploadedUrl)
    if (error instanceof GuidePhotoError) return json({ error: error.message }, error.status)
    return json({ error: 'La publication n’a pas pu être confirmée. Vérifiez la photo actuelle avant de réessayer.' }, 500)
  }

  return {
    async GET(request: Request, slug: string) {
      try {
        const { actor, guide } = await load(request, slug)
        return json(photoState(guide, actor))
      } catch (error) { return failure(error) }
    },
    async POST(request: Request, slug: string) {
      let uploadedUrl: string | null = null
      try {
        const { actor, guide } = await load(request, slug, true)
        if (!guide.guideAccount) throw new GuidePhotoError('Ce guide ne possède pas de compte associé.', 409)
        const limited = await deps.limit(request, actor)
        if (limited) return limited
        const expectedVersion = request.headers.get('if-match')
        if (!expectedVersion) throw new GuidePhotoError('Rechargez la photo avant de publier.', 428)
        if (expectedVersion !== photoState(guide, actor).version) {
          throw new GuidePhotoError('La fiche a changé. Rechargez la photo avant de publier.', 409)
        }
        const contentType = request.headers.get('content-type') || ''
        if (!(contentType in FORMATS)) throw new GuidePhotoError('Formats acceptés : JPEG, PNG et WebP.', 415)
        const bytes = await readPhotoBody(request)
        const metadata = await validateGuidePhoto(bytes, contentType)
        const blob = await deps.upload(`guide-photos/${guide.id}/${randomUUID()}.${metadata.format}`, bytes, contentType)
        uploadedUrl = blob.url
        // Re-check the session after the upload (it might have been revoked meanwhile).
        const currentActor = await deps.getActor(request)
        if (!currentActor || currentActor.role !== 'SUPERADMIN' || currentActor.id !== actor.id) {
          throw new GuidePhotoError('Votre session a changé. Reconnectez-vous avant de publier.', 403)
        }
        const updated = await deps.publish({ request, actor, guide, url: blob.url,
          bytes: bytes.length, width: metadata.width, height: metadata.height })
        return json({ ...photoState(updated, actor), message: 'La nouvelle photo a été publiée.' })
      } catch (error) {
        // Never delete on an ambiguous database failure: the transaction may have committed.
        // Retain the uploaded asset and report it for reconciliation; old photos are never deleted.
        return failure(error, uploadedUrl)
      }
    },
  }
}
