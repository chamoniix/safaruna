import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import * as applicationMedia from '../src/lib/guide-application-media'
import * as media from '../src/lib/guide-profile-media'
import { createApplicationPhotoReceipt } from '../src/lib/guide-application-photo-receipt'

process.env.ENCRYPTION_KEY = 'test-only-profile-media-receipt-key'
process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN = 'test-private-token'
const email = 'guide@example.invalid'
const path = (kind: string, next = false) => `guide-applications/${next ? 'abcdef12' : '12345678'}-1234-1234-1234-123456789abc/${kind}.png`
const snapshot: media.GuideProfileMediaSnapshot = {
  profilePhotoPath: path('profile'), hasPersonalVehicle: true,
  vehicleModel: 'Test', vehicleYear: 2022, vehiclePassengerSeats: 4,
  vehicleColor: 'Blanc', vehicleSeatsConfirmed: true,
  vehicleDashboardPhotoPath: path('dashboard'), vehicleSeatsPhotoPath: path('seats'),
  vehicleExteriorPhotoPath: path('exterior'),
}

test('media proposals accept only partial receipt-backed fields, not storage paths or unrelated changes', () => {
  assert.equal(media.mediaProposalSchema.safeParse({ vehicleColor: ' Bleu ' }).success, true)
  for (const proposal of [{ profilePhotoPath: path('profile') }, { image: 'https://attacker.invalid' }, { vehicleYear: 2 }, { profilePhotoReceipt: '' }]) {
    assert.equal(media.mediaProposalSchema.safeParse(proposal).success, false)
  }
  assert.equal(media.storedMediaSchema.safeParse(snapshot).success, true)
  assert.equal(media.storedMediaSchema.safeParse({ ...snapshot, profilePhotoPath: 'https://attacker.invalid/photo.png' }).success, false)
  assert.equal(media.storedMediaSchema.safeParse({ ...snapshot, vehicleSeatsPhotoPath: path('profile') }).success, false)
})

test('portrait and one vehicle photo replacement retain every untouched field and the original baseline', () => {
  const before = structuredClone(snapshot)
  const resolved = media.resolveMediaProposal({
    profilePhotoReceipt: createApplicationPhotoReceipt(email, 'profile', path('profile', true)),
    vehicleSeatsPhotoReceipt: createApplicationPhotoReceipt(email, 'seats', path('seats', true)),
    vehicleColor: ' Bleu ',
  }, email, snapshot)
  assert.deepEqual(resolved, { ...snapshot, profilePhotoPath: path('profile', true), vehicleSeatsPhotoPath: path('seats', true), vehicleColor: 'Bleu' })
  assert.deepEqual(snapshot, before)
  assert.equal(JSON.stringify(resolved).includes('Receipt'), false)
})

test('all received receipts are verified for actor, slot, expiry and forgery', () => {
  const valid = createApplicationPhotoReceipt(email, 'profile', path('profile'))
  for (const receipt of [
    createApplicationPhotoReceipt('other@example.invalid', 'profile', path('profile')),
    createApplicationPhotoReceipt(email, 'seats', path('seats')),
    createApplicationPhotoReceipt(email, 'profile', path('profile'), 1),
    valid.slice(0, -5) + 'xxxxx', 'https://attacker.invalid/photo.png',
  ]) assert.throws(() => media.resolveMediaProposal({ profilePhotoReceipt: receipt }, email, snapshot))
  assert.throws(() => media.resolveMediaProposal({ hasPersonalVehicle: false, vehicleSeatsPhotoReceipt: valid }, email, snapshot))
})

test('effective vehicle true validates all merged fields, while optional photos can stay absent', () => {
  assert.equal(media.resolveMediaProposal({ vehicleColor: 'Noir' }, email, snapshot).vehicleColor, 'Noir')
  for (const field of ['vehicleModel', 'vehicleYear', 'vehiclePassengerSeats', 'vehicleColor', 'vehicleSeatsConfirmed'] as const) {
    assert.throws(() => media.resolveMediaProposal({ hasPersonalVehicle: true }, email, { ...snapshot, [field]: null }), field)
  }
  assert.throws(() => media.resolveMediaProposal({ vehicleSeatsConfirmed: false }, email, snapshot))
  const noPhotos = { ...snapshot, vehicleDashboardPhotoPath: null, vehicleSeatsPhotoPath: null, vehicleExteriorPhotoPath: null }
  assert.deepEqual(media.resolveMediaProposal({ hasPersonalVehicle: true }, email, noPhotos), noPhotos)
})

test('No vehicle keeps all baseline details and blobs but hides them in the current DTO', () => {
  const resolved = media.resolveMediaProposal({ hasPersonalVehicle: false, vehicleColor: '',
    vehicleSeatsPhotoReceipt: createApplicationPhotoReceipt(email, 'seats', path('seats', true)),
  }, email, snapshot)
  assert.deepEqual(resolved, { ...snapshot, hasPersonalVehicle: false })
  const view = media.profileMediaView(resolved, 'request-a')
  assert.equal(view.hasPersonalVehicle, false)
  for (const field of ['vehicleModel', 'vehicleYear', 'vehiclePassengerSeats', 'vehicleColor', 'vehicleSeatsConfirmed'] as const) assert.equal(view[field], null)
  assert.deepEqual(view.photos, { profile: '/api/guide-profile-change-requests/request-a/photos/profile', dashboard: null, seats: null, exterior: null })
  assert.deepEqual(media.resolveMediaProposal({ hasPersonalVehicle: true }, email, resolved), snapshot)
})

test('profile DTO exposes private routes only and safely encodes request ids', () => {
  const view = media.profileMediaView(snapshot, 'request/a')
  assert.equal(view.photos.exterior, '/api/guide-profile-change-requests/request%2Fa/photos/exterior')
  assert.equal(JSON.stringify(view).includes('guide-applications/'), false)
  assert.equal(JSON.stringify(view).includes('PhotoPath'), false)
})

function databaseFixture(request: { id: string; changes: unknown } | null, application: applicationMedia.ApplicationMediaRecord | null) {
  const calls: { requests: Record<string, unknown>[]; applications: Record<string, unknown>[] } = { requests: [], applications: [] }
  const db = {
    guideProfileChangeRequest: { findFirst: async (args: Record<string, unknown>) => { calls.requests.push(args); return request } },
    guideApplication: { findFirst: async (args: Record<string, unknown>) => { calls.applications.push(args); return application } },
  } as unknown as Prisma.TransactionClient
  return { db, calls }
}

test('current media uses latest approved full snapshot, ignoring unrelated newer approved changes', async () => {
  const f = databaseFixture({ id: 'request-a', changes: { media: snapshot } }, { ...snapshot, id: 'application-a' })
  const result = await media.readGuideProfileMedia(f.db, 'guide-owner')
  assert.deepEqual(result.snapshot, snapshot)
  assert.equal(result.view?.photos.profile, '/api/guide-profile-change-requests/request-a/photos/profile')
  assert.deepEqual(f.calls.requests[0], {
    where: { guideProfileId: 'guide-owner', status: 'APPROVED', changes: { path: ['media'], not: Prisma.AnyNull } },
    orderBy: [{ reviewedAt: 'desc' }, { createdAt: 'desc' }, { id: 'desc' }], select: { id: true, changes: true },
  })
  assert.equal(f.calls.applications.length, 0)
})

test('media falls back to latest linked approved application then empty snapshot', async () => {
  const application = { ...snapshot, id: 'application-a' }
  const f = databaseFixture(null, application)
  assert.deepEqual(await media.readGuideProfileMedia(f.db, 'guide-owner'), { snapshot, view: applicationMedia.applicationMediaView(application) })
  assert.deepEqual(f.calls.applications[0].where, { createdGuideProfileId: 'guide-owner', status: 'APPROVED' })
  const empty = await media.readGuideProfileMedia(databaseFixture(null, null).db, 'legacy-guide')
  assert.equal(empty.view, null)
  assert.equal(Object.values(empty.snapshot).every(value => value === null), true)
  await assert.rejects(media.readGuideProfileMedia(databaseFixture({ id: 'broken', changes: { media: {} } }, application).db, 'guide-owner'))
})

function readFixture() {
  let admin: { role: string } | null = null
  let owner: string | null = null
  let current: unknown = { media: snapshot }
  let exists = true
  let contentType = 'image/png'
  let blobStatus = 200
  const calls = { db: 0, blob: 0, where: {} as Record<string, unknown>, options: {} as Record<string, unknown> }
  const overrides: Record<string, unknown> = {
    '@/lib/check-admin': { getAdminActor: async () => admin },
    '@/lib/require-account': { requireGuide: async () => owner ? { ok: true, actor: { guideProfileId: owner } } : { ok: false } },
    '@/lib/prisma': { guideProfileChangeRequest: { findFirst: async ({ where }: { where: Record<string, unknown> }) => {
      calls.db++; calls.where = where
      return exists && (!where.guideProfileId || where.guideProfileId === 'guide-owner') ? { changes: current } : null
    } } },
    '@/lib/guide-application-media': applicationMedia,
    '@/lib/guide-profile-media': media,
    '@vercel/blob': { get: async (pathname: string, options: Record<string, unknown>) => {
      calls.blob++; assert.match(pathname, /^guide-applications\//); calls.options = options
      return { statusCode: blobStatus, blob: { contentType }, stream: new ReadableStream({ start(c) { c.enqueue(new Uint8Array([1, 2])); c.close() } }) }
    } },
    '@sentry/nextjs': { captureException: () => {} },
  }
  const output = ts.transpileModule(readFileSync('src/app/api/guide-profile-change-requests/[id]/photos/[kind]/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const localRequire = createRequire(import.meta.url)
  const exported: { GET?: (request: NextRequest, context: { params: Promise<{ id: string; kind: string }> }) => Promise<Response> } = {}
  new Function('require', 'exports', output)((id: string) => id in overrides ? overrides[id] : localRequire(id), exported)
  const read = (kind = 'profile', query = '') => exported.GET!(new NextRequest(`https://safaruma.com/api/guide-profile-change-requests/request-a/photos/${kind}${query}`), { params: Promise.resolve({ id: 'request-a', kind }) })
  return { read, calls, admin(role: string) { admin = { role } }, guide(id: string) { owner = id },
    changes(value: unknown) { current = value }, missing() { exists = false }, mime(value: string) { contentType = value }, blobStatus(value: number) { blobStatus = value } }
}

test('private request photos deny anonymous/inactive/non-guide before DB and another guide before Blob', async () => {
  const f = readFixture()
  assert.equal((await f.read()).status, 401)
  assert.equal(f.calls.db, 0); assert.equal(f.calls.blob, 0)
  f.guide('other-guide')
  assert.equal((await f.read()).status, 404)
  assert.equal(f.calls.blob, 0)
})

test('owning active guide reads pending or historical request media by immutable profile id', async () => {
  const f = readFixture(); f.guide('guide-owner')
  const result = await f.read()
  assert.equal(result.status, 200)
  assert.deepEqual(f.calls.where, { id: 'request-a', guideProfileId: 'guide-owner' })
  assert.deepEqual(f.calls.options, { token: 'test-private-token', access: 'private', useCache: false })
  assert.equal(result.headers.get('cache-control'), 'private, no-store')
  assert.equal(result.headers.get('vary'), 'Cookie')
  assert.equal(result.headers.get('x-content-type-options'), 'nosniff')
  assert.equal(result.headers.get('location'), null)
  assert.deepEqual([...new Uint8Array(await result.arrayBuffer())], [1, 2])
})

test('Admin and Superadmin can download, but neither can read No-vehicle snapshot photos', async () => {
  for (const role of ['ADMIN', 'SUPERADMIN']) {
    const f = readFixture(); f.admin(role)
    const result = await f.read('profile', '?download=1')
    assert.equal(result.status, 200)
    assert.equal(result.headers.get('content-disposition'), 'attachment; filename="profile.png"')
    assert.deepEqual(f.calls.where, { id: 'request-a' })
    f.changes({ media: { ...snapshot, hasPersonalVehicle: false } })
    for (const kind of ['dashboard', 'seats', 'exterior']) assert.equal((await f.read(kind)).status, 404)
    assert.equal(f.calls.blob, 1)
    // An older snapshot retains its own authorized media even after No is approved.
    f.changes({ media: snapshot }); assert.equal((await f.read('seats')).status, 200)
  }
})

test('photo route rejects unknown slots, missing snapshots/photos and arbitrary storage paths before Blob', async () => {
  const f = readFixture(); f.guide('guide-owner')
  assert.equal((await f.read('unknown')).status, 404)
  assert.equal(f.calls.db, 0)
  for (const changes of [null, [], {}, { media: {} }, { media: { ...snapshot, profilePhotoPath: null } }, { media: { ...snapshot, profilePhotoPath: 'https://attacker.invalid' } }]) {
    f.changes(changes); assert.equal((await f.read()).status, 404)
  }
  f.missing(); assert.equal((await f.read()).status, 404)
  assert.equal(f.calls.blob, 0)
})

test('photo route fails closed for missing private store, missing blob or invalid MIME', async () => {
  const f = readFixture(); f.guide('guide-owner')
  const token = process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN
  delete process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN
  try { assert.equal((await f.read()).status, 503) } finally { process.env.GUIDE_PRIVATE_BLOB_READ_WRITE_TOKEN = token }
  assert.equal(f.calls.blob, 0)
  f.blobStatus(404); assert.equal((await f.read()).status, 404)
  f.blobStatus(200); f.mime('image/svg+xml'); assert.equal((await f.read()).status, 415)
})
