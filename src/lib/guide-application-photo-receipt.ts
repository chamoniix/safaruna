import { decrypt, encrypt } from '@/lib/crypto'
import { GuidePhotoError } from '@/lib/guide-photo'
import { type ApplicationPhotoKind } from '@/lib/guide-application-media'

const PHOTO_PATH = /^guide-applications\/[0-9a-f-]{36}\/(profile|dashboard|seats|exterior)\.(jpeg|png|webp)$/
const RECEIPT_DURATION = 60 * 60 * 1000

// Authenticated encryption binds an upload to its intended email and photo slot.
// Only the server can mint receipts; raw client-supplied Blob URLs are never accepted.
export function createApplicationPhotoReceipt(email: string, kind: ApplicationPhotoKind, path: string, now = Date.now()) {
  return encrypt(JSON.stringify({ purpose: 'guide-application-photo-v1', email: email.trim().toLowerCase(), kind, path, expires: now + RECEIPT_DURATION }))
}

export function readApplicationPhotoReceipt(receipt: string, email: string, kind: ApplicationPhotoKind, now = Date.now()): string {
  try {
    const value = JSON.parse(decrypt(receipt))
    if (value.purpose !== 'guide-application-photo-v1' || value.email !== email.trim().toLowerCase()
      || value.kind !== kind || typeof value.expires !== 'number' || value.expires <= now
      || typeof value.path !== 'string' || !PHOTO_PATH.test(value.path)
      || !value.path.split('/')[2].startsWith(`${kind}.`)) throw new Error('Invalid receipt')
    return value.path
  } catch {
    throw new GuidePhotoError('La photo n’a pas pu être vérifiée. Renvoyez votre candidature pour la charger à nouveau.', 400)
  }
}
