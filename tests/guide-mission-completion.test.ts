import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'

const require = createRequire(import.meta.url)

function fixture() {
  const actor = { id: 'account', guideProfileId: 'guide', email: 'guide@example.test' }
  const mission = { id: 'mission', reservationId: 'reservation', guideProfileId: 'guide', guideCompleted: false,
    reservation: { status: 'CONFIRMED' }, active: true }
  const audits: unknown[] = []
  let authenticated = true, failAudit = false, conflict = false
  const db = {
    reservationMission: {
      findFirst: async ({ where }: { where: { id: string; reservationId: string; guideProfileId: string; guideProfile: { status: string; guideAccount: { id: string; status: string } } } }) => {
        assert.equal(where.guideProfile.status, 'ACTIVE')
        assert.equal(where.guideProfile.guideAccount.id, 'account')
        assert.equal(where.guideProfile.guideAccount.status, 'ACTIVE')
        return where.id === mission.id && where.reservationId === mission.reservationId
          && where.guideProfileId === mission.guideProfileId && mission.active ? mission : null
      },
      update: async ({ data }: { data: { guideCompleted: boolean } }) => { mission.guideCompleted = data.guideCompleted },
    },
    auditLog: { create: async ({ data }: { data: unknown }) => {
      if (failAudit) throw new Error('test audit failure')
      audits.push(data)
    } },
    $transaction: async <T>(work: (tx: unknown) => Promise<T>, options: { isolationLevel: string }) => {
      assert.equal(options.isolationLevel, 'Serializable')
      if (conflict) throw new Prisma.PrismaClientKnownRequestError('conflict', { code: 'P2034', clientVersion: 'test' })
      const before = mission.guideCompleted
      try { return await work(db) } catch (error) { mission.guideCompleted = before; throw error }
    },
  }
  const loadedModule = { exports: {} }
  const mocks: Record<string, unknown> = {
    '@/lib/prisma': db,
    '@/lib/require-account': { requireGuide: async (options: { published: boolean }) => {
      assert.equal(options.published, true)
      return authenticated ? { ok: true, actor } : { ok: false, response: NextResponse.json({}, { status: 401 }) }
    } },
    '@/lib/guide-auth': {
      hasTrustedGuideAuthOrigin: (req: NextRequest) => !req.headers.get('origin') || req.headers.get('origin') === req.nextUrl.origin,
      getGuideRequestContext: () => ({ ip: '127.0.0.1', userAgent: 'test' }),
    },
  }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/guide/missions/[id]/route.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { module: loadedModule, exports: loadedModule.exports, Error, console: { error: () => {} },
    require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) })
  const route = loadedModule.exports as typeof import('../src/app/api/guide/missions/[id]/route')
  return { mission, audits,
    unauthenticate: () => { authenticated = false }, failAudit: () => { failAudit = true }, conflict: () => { conflict = true },
    post: (body: unknown = { action: 'COMPLETE', missionId: 'mission' }, reservationId = 'reservation', origin = 'https://safaruma.test') =>
      route.POST(new NextRequest('https://safaruma.test/api/guide/missions/'+reservationId, {
        method: 'POST', headers: { origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      }), { params: Promise.resolve({ id: reservationId }) }),
  }
}

test('assigned Guide declares their mission once, without completing the whole stay or moving money', async () => {
  const f = fixture()
  assert.equal((await f.post()).status, 200)
  assert.equal(f.mission.guideCompleted, true)
  assert.equal(f.mission.reservation.status, 'CONFIRMED')
  assert.equal(f.audits.length, 1)
  assert.equal((await f.post()).status, 200)
  assert.equal(f.audits.length, 1)
})

test('another guide, another reservation, inactive profile and unknown mission cannot be completed', async () => {
  for (const variant of ['other-guide', 'other-reservation', 'inactive', 'missing']) {
    const f = fixture()
    if (variant === 'other-guide') f.mission.guideProfileId = 'another-guide'
    if (variant === 'inactive') f.mission.active = false
    const result = await f.post({ action: 'COMPLETE', missionId: variant === 'missing' ? 'unknown' : 'mission' },
      variant === 'other-reservation' ? 'another-reservation' : 'reservation')
    assert.equal(result.status, 404)
    assert.equal(f.mission.guideCompleted, false)
    assert.equal(f.audits.length, 0)
  }
})

test('pending and cancelled bookings, forged fields, missing session and foreign origins are rejected', async () => {
  for (const status of ['PENDING', 'CANCELLED']) {
    const f = fixture(); f.mission.reservation.status = status
    assert.equal((await f.post()).status, 409)
    assert.equal(f.mission.guideCompleted, false)
  }
  const f = fixture()
  assert.equal((await f.post({ action: 'COMPLETE', missionId: 'mission', guideProfileId: 'guide' })).status, 400)
  assert.equal((await f.post(null)).status, 400)
  assert.equal((await f.post(undefined, undefined, 'https://foreign.test')).status, 403)
  f.unauthenticate()
  assert.equal((await f.post()).status, 401)
  assert.equal(f.mission.guideCompleted, false)
})

test('audit failure rolls back completion and concurrent changes request a reload', async () => {
  const f = fixture(); f.failAudit()
  assert.equal((await f.post()).status, 500)
  assert.equal(f.mission.guideCompleted, false)
  const c = fixture(); c.conflict()
  assert.equal((await c.post()).status, 409)
  assert.equal(c.mission.guideCompleted, false)
})
