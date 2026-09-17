import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { NextRequest } from 'next/server'

const require = createRequire(import.meta.url)
function fixture() {
  const calls: Array<{ model: string; method: string; input: unknown }> = []
  const prisma = new Proxy({}, { get: (_, model: string) => {
    if (model === '__esModule') return false
    return new Proxy({}, { get: (_, method: string) => async (input: unknown) => {
      calls.push({ model, method, input })
      if (method === 'count') return 0
      if (method === 'aggregate') return { _sum: { amountCents: 12345 } }
      if (model === 'transfer') return [{ id: 'transfer', amountCents: 12345, currency: 'EUR', bankReference: 'BANK-REF',
        sentAt: new Date(), confirmedAt: new Date(), status: 'PAID', preparedByEmail: 'admin@example.test', confirmedByEmail: 'owner@example.test', createdAt: new Date(),
        recordedEarning: { reservation: { refNumber: 'RES-1' } }, guideProfile: { guideAccount: { email: 'guide@example.test', displayName: 'Guide' } },
      }]
      if (model === 'auditLog') return [{ id: 'audit', action: 'GUIDE_TRANSFER_CONFIRMED', actor: 'owner@example.test', actorRole: 'SUPERADMIN', ip: '127.0.0.1', createdAt: new Date(), before: null, after: { bankReference: 'BANK-REF' } }]
      return []
    } })
  } })
  const loadedModule = { exports: {} }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/internal/analytics/overview/route.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { module: loadedModule, exports: loadedModule.exports, Date, Buffer,
    process: { env: { ANALYTICS_INTERNAL_SECRET: 'test-only-secret' } },
    require: (name: string) => name === '@/lib/prisma' ? prisma : require(name),
  })
  const route = loadedModule.exports as typeof import('../src/app/api/internal/analytics/overview/route')
  return { calls, get: (authorized: boolean) => route.GET(new NextRequest('https://safaruma.test/api/internal/analytics/overview', {
    headers: authorized ? { authorization: 'Bearer test-only-secret' } : {},
  })) }
}

test('Analytics transfer register is private and unavailable without its server credential', async () => {
  const f = fixture(); assert.equal((await f.get(false)).status, 401); assert.equal(f.calls.length, 0)
})

test('Analytics separates real Guide transfers from customer payments and preserves audit identity', async () => {
  const f = fixture(); const response = await f.get(true); const data = await response.json()
  assert.equal(response.status, 200); assert.equal(data.guideTransfers.confirmedAmountCents, 12345)
  assert.equal(data.guideTransfers.rows[0].refNumber, 'RES-1')
  assert.equal(data.guideTransfers.audit[0].actor, 'owner@example.test')
  assert.equal(data.guideTransfers.audit[0].ip, '127.0.0.1')
  assert.equal(data.payments.transactions.length, 0)
  assert.doesNotMatch(JSON.stringify(data.guideTransfers), /bankSnapshot|ibanEncrypted/)
  const transferQuery = f.calls.find(call => call.model === 'transfer' && call.method === 'findMany')!.input
  assert.doesNotMatch(JSON.stringify(transferQuery), /bankSnapshot|ibanEncrypted/)
  assert.match(JSON.stringify(transferQuery), /"take":50/)
})
