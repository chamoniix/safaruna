import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'node:crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 12  // GCM standard
const TAG_LENGTH = 16

function getKey(): Buffer {
  const secret = process.env.ENCRYPTION_KEY
  if (!secret) throw new Error('[SECURITY] ENCRYPTION_KEY manquant')
  // Derive a 32-byte key from the secret using scrypt
  return scryptSync(secret, 'safaruma-iban-salt', 32)
}

/**
 * Encrypt a plaintext string.
 * Returns a base64 string: iv(12) + tag(16) + ciphertext, all concatenated.
 */
export function encrypt(plaintext: string): string {
  const key = getKey()
  const iv = randomBytes(IV_LENGTH)
  const cipher = createCipheriv(ALGORITHM, key, iv)

  const encrypted = Buffer.concat([
    cipher.update(plaintext, 'utf8'),
    cipher.final(),
  ])
  const tag = cipher.getAuthTag()

  return Buffer.concat([iv, tag, encrypted]).toString('base64')
}

/**
 * Decrypt a base64 string produced by encrypt().
 */
export function decrypt(ciphertext: string): string {
  const key = getKey()
  const buf = Buffer.from(ciphertext, 'base64')

  const iv  = buf.subarray(0, IV_LENGTH)
  const tag = buf.subarray(IV_LENGTH, IV_LENGTH + TAG_LENGTH)
  const enc = buf.subarray(IV_LENGTH + TAG_LENGTH)

  const decipher = createDecipheriv(ALGORITHM, key, iv)
  decipher.setAuthTag(tag)

  return Buffer.concat([decipher.update(enc), decipher.final()]).toString('utf8')
}
