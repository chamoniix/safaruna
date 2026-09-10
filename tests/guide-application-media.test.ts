import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
import sharp from 'sharp'
import { NextRequest } from 'next/server'
import * as media from '../src/lib/guide-application-media'
import * as receipt from '../src/lib/guide-application-photo-receipt'
import * as photo from '../src/lib/guide-photo'

process.env.ENCRYPTION_KEY = 'test-only-application-receipt-key-not-a-production-secret'
const path = 'guide-applications/12345678-1234-1234-1234-123456789abc/profile.png'
const email = 'guide@example.invalid'
const record: media.ApplicationMediaRecord = {
  id: 'application-a', profilePhotoPath: path, hasPersonalVehicle: true,
  vehicleModel: 'Modèle de test', vehicleYear: 2022, vehiclePassengerSeats: 4,
  vehicleColor: 'Blanc', vehicleSeatsConfirmed: true,
  vehicleDashboardPhotoPath: null, vehicleSeatsPhotoPath: null, vehicleExteriorPhotoPath: null,
}

test('receipt cannot be forged, moved to another email/slot, expired or replaced with a URL', () => {
  const token = receipt.createApplicationPhotoReceipt(email, 'profile', path, 1000)
  assert.equal(receipt.readApplicationPhotoReceipt(token, ' GUIDE@example.invalid ', 'profile', 2000), path)
  for (const [value, targetEmail, kind, now] of [
    [token.slice(0, -5) + 'xxxx', email, 'profile', 2000],
    [token, 'other@example.invalid', 'profile', 2000],
    [token, email, 'dashboard', 2000],
    [token, email, 'profile', 3_601_000],
    ['https://attacker.invalid/photo.png', email, 'profile', 2000],
  ] as const) assert.throws(() => receipt.readApplicationPhotoReceipt(value, targetEmail, kind, now), photo.GuidePhotoError)
  const arbitrary = receipt.createApplicationPhotoReceipt(email, 'profile', 'https://attacker.invalid/image.png', 1000)
  assert.throws(() => receipt.readApplicationPhotoReceipt(arbitrary, email, 'profile', 2000))
})

test('portrait required, vehicle photos optional, passenger-seat confirmation enforced', () => {
  assert.equal(media.applicationMediaSchema.safeParse({ hasPersonalVehicle: false }).success, false)
  assert.equal(media.applicationMediaSchema.safeParse({ hasPersonalVehicle: false, profilePhotoReceipt: 'receipt' }).success, true)
  const valid = { ...record, profilePhotoReceipt: 'receipt' }
  assert.equal(media.applicationMediaSchema.safeParse(valid).success, true)
  for (const key of ['vehicleModel', 'vehicleYear', 'vehiclePassengerSeats', 'vehicleColor', 'vehicleSeatsConfirmed']) {
    assert.equal(media.applicationMediaSchema.safeParse({ ...valid, [key]: undefined }).success, false, key)
  }
  assert.equal(media.applicationMediaSchema.safeParse({ ...valid, vehicleSeatsConfirmed: false }).success, false)
  assert.equal(media.applicationMediaSchema.safeParse({ ...valid, vehiclePassengerSeats: 0 }).success, false)
  assert.equal(media.applicationMediaSchema.safeParse({ ...valid, vehiclePassengerSeats: 4.5 }).success, false)
})

test('dashboard DTO contains only authenticated media routes, not private Blob paths', () => {
  const view = media.applicationMediaView(record)
  assert.equal(view.photos.profile, '/api/guide-applications/application-a/photos/profile')
  assert.equal(view.photos.dashboard, null)
  assert.equal(view.vehiclePassengerSeats, 4)
  assert.equal(JSON.stringify(view).includes(path), false)
  const legacy = media.applicationMediaView({ ...record, profilePhotoPath: null, hasPersonalVehicle: null })
  assert.equal(legacy.photos.profile, null)
  assert.equal(legacy.hasPersonalVehicle, null)
})

// Execute the actual route with external I/O mocked; no production data/files/emails.
function loadRoute(file: string, overrides: Record<string, unknown>) {
  const output = ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const localRequire = createRequire(import.meta.url)
  const exported: Record<string, (...args: unknown[]) => Promise<Response>> = {}
  new Function('require', 'exports', output)((id: string) => id in overrides ? overrides[id] : localRequire(id), exported)
  return exported
}

function readFixture() {
  let admin: { role: string } | null = null
  let owner: string | null = null
  let exists = true
  const calls = { db: 0, blob: 0, where: {} as Record<string, unknown>, options: {} as Record<string, unknown> }
  const route = loadRoute('src/app/api/guide-applications/[id]/photos/[kind]/route.ts', {
    '@/lib/check-admin': { getAdminActor: async () => admin },
    '@/lib/require-account': { requireGuide: async () => owner ? { ok: true, actor: { guideProfileId: owner } } : { ok: false } },
    '@/lib/prisma': { guideApplication: { findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      calls.db++; calls.where = where
      return exists && (!where.createdGuideProfileId || where.createdGuideProfileId === 'guide-owner') ? record : null
    } } },
    '@/lib/guide-application-media': media,
    '@vercel/blob': { get: async (pathname: string, options: Record<string, unknown>) => {
      calls.blob++; assert.equal(pathname, path); calls.options = options
      return { statusCode: 200, blob: { contentType: 'image/png' }, stream: new ReadableStream({ start(c) { c.enqueue(new Uint8Array([1, 2])); c.close() } }) }
    } },
    '@sentry/nextjs': { captureException: () => {} },
  })
  const read = (kind = 'profile', query = '') => route.GET(new NextRequest(`https://safaruma.com/api/guide-applications/application-a/photos/${kind}${query}`), { params: Promise.resolve({ id: 'application-a', kind }) })
  return { read, calls, admin(role: string) { admin = { role } }, guide(id: string) { owner = id }, missing() { exists = false } }
}

test('private reads deny anonymous/pilgrim before DB lookup and deny another guide before Blob', async () => {
  const f = readFixture()
  assert.equal((await f.read()).status, 401)
  assert.equal(f.calls.db, 0); assert.equal(f.calls.blob, 0)
  f.guide('other-guide')
  const denied = await f.read()
  assert.equal(denied.status, 404); assert.equal(f.calls.blob, 0)
  assert.equal(denied.headers.get('cache-control'), 'private, no-store')
})

test('owner access is linked by immutable profile id and approved application, not email', async () => {
  process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN = 'test-private-token'
  const f = readFixture(); f.guide('guide-owner')
  const result = await f.read()
  assert.equal(result.status, 200)
  assert.deepEqual(f.calls.where, { id: 'application-a', createdGuideProfileId: 'guide-owner', status: 'APPROVED' })
  assert.deepEqual(f.calls.options, { token: 'test-private-token', access: 'private', useCache: false })
  assert.equal(result.headers.get('cache-control'), 'private, no-store')
  assert.equal(result.headers.get('vary'), 'Cookie')
  assert.equal(result.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(result.headers.get('location'), null)
  assert.deepEqual([...new Uint8Array(await result.arrayBuffer())], [1, 2])
})

test('Admin and Superadmin can read and download; unknown slots/absent photos denied', async () => {
  for (const role of ['ADMIN', 'SUPERADMIN']) {
    const f = readFixture(); f.admin(role)
    const result = await f.read('profile', '?download=1')
    assert.equal(result.status, 200)
    assert.equal(result.headers.get('content-disposition'), 'attachment; filename="profile.png"')
    assert.deepEqual(f.calls.where, { id: 'application-a' })
    assert.equal((await f.read('unknown')).status, 404)
    assert.equal((await f.read('dashboard')).status, 404)
    f.missing(); assert.equal((await f.read()).status, 404)
  }
})

function uploadFixture() {
  const calls = { uploads: 0, reports: 0, options: {} as Record<string, unknown> }
  let allowed = true
  let brokenLimiter = false
  const route = loadRoute('src/app/api/guide/inscription/photos/route.ts', {
    '@/lib/guide-application-media': media,
    '@/lib/guide-application-photo-receipt': receipt,
    '@/lib/guide-photo': photo,
    '@/lib/ratelimit': { guideApplicationPhotoRatelimit: { limit: async () => {
      if (brokenLimiter) throw new Error('Unavailable')
      return { success: allowed, reset: Date.now() + 60000 }
    } } },
    '@vercel/blob': { put: async (_path: string, _body: unknown, options: Record<string, unknown>) => { calls.uploads++; calls.options = options } },
    '@sentry/nextjs': { captureException: () => { calls.reports++ } },
  })
  const upload = async (extra: Record<string, string> = {}, kind = 'profile', body?: Uint8Array) => route.POST(new NextRequest(`https://safaruma.com/api/guide/inscription/photos?kind=${kind}`, {
    method: 'POST', headers: { origin: 'https://safaruma.com', 'content-type': 'image/png', 'x-guide-email': email, ...extra },
    body: new Uint8Array(body || await sharp({ create: { width: 10, height: 10, channels: 3, background: '#fff' } }).png().toBuffer()),
  }))
  return { upload, calls, limit() { allowed = false }, breakLimiter() { brokenLimiter = true } }
}

test('upload is private, preserves no-overwrite and returns receipt only', async () => {
  const f = uploadFixture()
  const result = await f.upload()
  assert.equal(result.status, 200)
  const body = await result.json()
  assert.deepEqual(Object.keys(body), ['receipt'])
  assert.match(receipt.readApplicationPhotoReceipt(body.receipt, email, 'profile'), /^guide-applications\//)
  assert.deepEqual(f.calls.options, { token: 'test-private-token', access: 'private', contentType: 'image/png', addRandomSuffix: false, allowOverwrite: false })
})

test('upload rejects CSRF, invalid format/email/slot, oversize before storage', async () => {
  const f = uploadFixture()
  assert.equal((await f.upload({ origin: 'https://attacker.invalid' })).status, 403)
  assert.equal((await f.upload({ 'sec-fetch-site': 'cross-site' })).status, 403)
  assert.equal((await f.upload({ 'x-guide-email': '%' })).status, 400)
  assert.equal((await f.upload({}, 'arbitrary')).status, 400)
  assert.equal((await f.upload({ 'content-type': 'image/svg+xml' })).status, 415)
  assert.equal((await f.upload({}, 'profile', new Uint8Array(photo.MAX_GUIDE_PHOTO_BYTES + 1))).status, 413)
  assert.equal(f.calls.uploads, 0)
})

test('upload fails closed when rate limit exceeded, unavailable, or store missing', async () => {
  const f = uploadFixture(); f.limit()
  assert.equal((await f.upload()).status, 429)
  f.breakLimiter(); assert.equal((await f.upload()).status, 503)
  const token = process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN
  delete process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN
  try { assert.equal((await uploadFixture().upload()).status, 503) } finally { process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN = token }
  assert.equal(f.calls.uploads, 0)
})

test('migration is additive and approval/PATCH cannot publish or edit submitted private photos', () => {
  const sql = readFileSync('prisma/migrations/20260910100000_guide_application_private_photos/migration.sql', 'utf8')
  assert.doesNotMatch(sql, /DROP|DELETE|NOT NULL|UPDATE/i)
  assert.equal((sql.match(/ADD COLUMN/g) || []).length, 10)
  const approval = readFileSync('src/app/api/admin/guide-applications/route.ts', 'utf8')
  assert.match(approval, /status: 'DRAFT'/)
  assert.doesNotMatch(approval, /image:\s*application\.profilePhotoPath/)
  const guidePatch = readFileSync('src/app/api/guide/profil/route.ts', 'utf8').split('export async function PATCH')[1]
  assert.doesNotMatch(guidePatch, /profilePhotoPath|hasPersonalVehicle|vehicleModel|vehicleSeatsPhotoPath/)
})
