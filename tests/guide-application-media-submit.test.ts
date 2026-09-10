import assert from 'node:assert/strict'
import test from 'node:test'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import ts from 'typescript'
import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import * as media from '../src/lib/guide-application-media'
import * as receipt from '../src/lib/guide-application-photo-receipt'
import { GuidePhotoError } from '../src/lib/guide-photo'

process.env.ENCRYPTION_KEY = 'test-only-submit-photo-receipt-key-no-production-access'

const email = 'guide-submit@example.invalid'
const photoPath = (kind: media.ApplicationPhotoKind) => `guide-applications/12345678-1234-1234-1234-123456789abc/${kind}.png`
const tokenFor = (kind: media.ApplicationPhotoKind, targetEmail = email) => receipt.createApplicationPhotoReceipt(targetEmail, kind, photoPath(kind))

function validBody(overrides: Record<string, unknown> = {}) {
  return {
    firstName: 'Guide', lastName: 'Test', email, whatsapp: '+33123456789',
    city: 'MADINAH', gender: 'HOMME', serviceCities: ['MADINAH'], dateOfBirth: '1990-01-02',
    bio: 'Présentation de test uniquement.', experienceYears: 4, education: 'institut',
    languages: ['fr'], masteredPlaces: [], transportModes: [],
    bankAccountFirstName: 'Guide', bankAccountLastName: 'Test', bankName: 'Banque Test', bankCountry: 'France',
    iban: 'FR7612345678901234567890123', acceptedCharte: true,
    profilePhotoReceipt: tokenFor('profile'), hasPersonalVehicle: false,
    ...overrides,
  }
}

type Data = Record<string, unknown>
type CreateArguments = { data: Data }

function fixture(options: { concurrentIdentity?: boolean; existingApproved?: boolean } = {}) {
  const calls = { db: 0, transactions: 0, applicationCreates: 0, identityCreates: 0, email: 0, analytics: 0 }
  const persisted: Data[] = []
  const notices: string[] = []
  const oldPublishedProfile = { status: 'ACTIVE', image: 'https://public.example.invalid/existing-guide.jpeg' }
  const noGuideMutation = async () => { assert.fail('Submitting an application must never modify a guide account or public profile.') }
  const transaction = {
    emailIdentity: { create: async ({ data }: CreateArguments) => {
      calls.identityCreates++
      if (options.concurrentIdentity) throw new Prisma.PrismaClientKnownRequestError('Concurrent identity already claimed', { code: 'P2002', clientVersion: 'test' })
      return data
    } },
    guideApplication: { create: async ({ data }: CreateArguments) => {
      calls.applicationCreates++
      persisted.push(data)
      return { id: 'application-submit-test', email: data.email, firstName: data.firstName, lastName: data.lastName, createdAt: new Date() }
    } },
    guideAccount: { create: noGuideMutation, update: noGuideMutation, updateMany: noGuideMutation },
    guideProfile: { create: noGuideMutation, update: noGuideMutation, updateMany: noGuideMutation },
  }
  const lookup = async () => { calls.db++; return null }
  const prisma = {
    emailIdentity: { deleteMany: async () => { calls.db++; return { count: 0 } }, findUnique: lookup },
    user: { findUnique: lookup },
    guideAccount: { findUnique: lookup, create: noGuideMutation, update: noGuideMutation, updateMany: noGuideMutation },
    guideProfile: { create: noGuideMutation, update: noGuideMutation, updateMany: noGuideMutation },
    guideApplication: { findFirst: async () => { calls.db++; return options.existingApproved ? { id: 'already-approved' } : null } },
    $transaction: async (run: (tx: typeof transaction) => Promise<unknown>) => { calls.transactions++; return run(transaction) },
  }
  const overrides: Record<string, unknown> = {
    '@/lib/prisma': prisma,
    '@/lib/email': {
      baseTemplate: (value: string) => value, escapeHtml: (value: string) => value,
      heading: (value: string) => value, p: (value: string) => value,
      sendWelcomeGuide: async () => { calls.email++ },
      sendEmail: async (message: { html: string }) => { calls.email++; notices.push(message.html) },
    },
    '@/lib/crypto': { encrypt: () => 'encrypted-test-bank-details' },
    '@/lib/analytics': { recordAnalyticsEvent: async () => { calls.analytics++ } },
    '@/lib/ratelimit': { checkRateLimit: async () => null, guideApplicationRatelimit: null },
    '@/lib/places': { PLACES: [] },
    '@/lib/languages': { GUIDE_LANGUAGES: [{ code: 'fr' }], LANG_CODE_TO_LABEL: { fr: 'Français' } },
    '@/lib/guide-application-media': media,
    '@/lib/guide-application-photo-receipt': receipt,
    '@/lib/guide-photo': { GuidePhotoError },
  }
  const transpiled = ts.transpileModule(readFileSync('src/app/api/guide/inscription/route.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText
  const localRequire = createRequire(import.meta.url)
  const exported: { POST?: (request: NextRequest) => Promise<Response> } = {}
  new Function('require', 'exports', transpiled)((id: string) => {
    if (id in overrides) return overrides[id]
    // Fail closed if a new dependency would otherwise load a real service or database.
    if (['next/server', 'zod', '@prisma/client'].includes(id)) return localRequire(id)
    throw new Error(`Unmocked dependency: ${id}`)
  }, exported)
  assert.ok(exported.POST)
  const post = exported.POST
  const submit = (body: unknown) => post(new NextRequest('https://safaruma.com/api/guide/inscription', {
    method: 'POST', headers: { origin: 'https://safaruma.com', 'content-type': 'application/json' }, body: JSON.stringify(body),
  }))
  return { submit, calls, persisted, notices, oldPublishedProfile }
}

test('final submission refuses forged, wrong-email and wrong-slot receipts before creating an identity/application', async () => {
  for (const invalid of ['forged-receipt', tokenFor('profile', 'other@example.invalid'), tokenFor('dashboard')]) {
    const f = fixture()
    const response = await f.submit(validBody({ profilePhotoReceipt: invalid }))
    assert.equal(response.status, 400)
    assert.equal(f.calls.transactions, 0)
    assert.equal(f.calls.identityCreates, 0)
    assert.equal(f.calls.applicationCreates, 0)
    assert.equal(f.calls.email, 0)
  }
})

test('final submission requires a portrait and vehicle answer before database access', async () => {
  for (const value of [undefined, '', false]) {
    const f = fixture()
    const response = await f.submit(validBody({ profilePhotoReceipt: value }))
    assert.equal(response.status, 400)
    assert.equal(f.calls.db, 0)
    assert.equal(f.calls.transactions, 0)
    assert.equal(f.calls.email, 0)
  }
  const f = fixture()
  assert.equal((await f.submit(validBody({ hasPersonalVehicle: undefined }))).status, 400)
  assert.equal(f.calls.db, 0)
})

test('valid media persist verified private paths and normalized vehicle information without publishing', async () => {
  const f = fixture()
  const response = await f.submit(validBody({
    hasPersonalVehicle: true, vehicleModel: '  Modèle Test  ', vehicleYear: 2022,
    vehiclePassengerSeats: 4, vehicleColor: ' Blanc ', vehicleSeatsConfirmed: true,
    vehicleDashboardPhotoReceipt: tokenFor('dashboard'),
  }))
  assert.equal(response.status, 201)
  assert.equal(f.calls.applicationCreates, 1)
  const saved = f.persisted[0]
  assert.equal(saved.profilePhotoPath, photoPath('profile'))
  assert.equal(saved.vehicleDashboardPhotoPath, photoPath('dashboard'))
  assert.equal(saved.vehicleSeatsPhotoPath, null)
  assert.equal(saved.vehicleExteriorPhotoPath, null)
  assert.equal(saved.vehicleModel, 'Modèle Test')
  assert.equal(saved.vehicleColor, 'Blanc')
  assert.equal(saved.vehicleYear, 2022)
  assert.equal(saved.vehiclePassengerSeats, 4)
  assert.equal(saved.vehicleSeatsConfirmed, true)
  assert.equal(saved.ibanEncrypted, 'encrypted-test-bank-details')
  assert.equal('image' in saved, false)
  assert.equal('profilePhotoReceipt' in saved, false)
  assert.deepEqual(f.oldPublishedProfile, { status: 'ACTIVE', image: 'https://public.example.invalid/existing-guide.jpeg' })
  const body = await response.json()
  assert.equal(body.status, 'PENDING')
  assert.doesNotMatch(JSON.stringify(body), /guide-applications\/|PhotoPath|Receipt/)
  assert.doesNotMatch(f.notices.join('\n'), /guide-applications\/|PhotoPath|Receipt/)
  assert.equal(f.calls.email, 3)
  assert.equal(f.calls.analytics, 1)
})

test('no personal vehicle clears all submitted vehicle details and ignores vehicle-photo receipts', async () => {
  const f = fixture()
  const response = await f.submit(validBody({
    hasPersonalVehicle: false, vehicleModel: 'Old value', vehicleYear: 2022,
    vehiclePassengerSeats: 4, vehicleColor: 'Blanc', vehicleSeatsConfirmed: true,
    vehicleDashboardPhotoReceipt: 'ignored-no-vehicle', vehicleSeatsPhotoReceipt: 'ignored', vehicleExteriorPhotoReceipt: 'ignored',
  }))
  assert.equal(response.status, 201)
  const saved = f.persisted[0]
  assert.equal(saved.hasPersonalVehicle, false)
  for (const field of ['vehicleModel', 'vehicleYear', 'vehiclePassengerSeats', 'vehicleColor', 'vehicleSeatsConfirmed', 'vehicleDashboardPhotoPath', 'vehicleSeatsPhotoPath', 'vehicleExteriorPhotoPath']) {
    assert.equal(saved[field], null, field)
  }
  assert.equal(saved.profilePhotoPath, photoPath('profile'))
})

test('a concurrent identity claim returns 409 with no application, publication or email', async () => {
  const f = fixture({ concurrentIdentity: true })
  const response = await f.submit(validBody())
  assert.equal(response.status, 409)
  assert.match((await response.json()).error, /déjà utilisée/)
  assert.equal(f.calls.transactions, 1)
  assert.equal(f.calls.applicationCreates, 0)
  assert.equal(f.calls.email, 0)
  assert.equal(f.calls.analytics, 0)
  assert.equal(f.oldPublishedProfile.status, 'ACTIVE')
})

test('an already-approved application cannot be replaced or alter its published account image', async () => {
  const f = fixture({ existingApproved: true })
  const response = await f.submit(validBody())
  assert.equal(response.status, 409)
  assert.equal(f.calls.transactions, 0)
  assert.equal(f.calls.email, 0)
  assert.deepEqual(f.oldPublishedProfile, { status: 'ACTIVE', image: 'https://public.example.invalid/existing-guide.jpeg' })
})
