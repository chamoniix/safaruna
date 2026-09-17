import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { NextRequest } from 'next/server'

const require = createRequire(import.meta.url)
const url = 'https://safaruma.com/api/admin/reservations/guide-transfers'

function fixture() {
  const state = { role: 'ADMIN', authenticated: true, error: null as Error | null }
  const calls: { action: string; args: unknown[] }[] = []
  const context = { ip: '127.0.0.1', requestId: 'api-test' }
  class GuideTransferError extends Error { constructor(message: string, readonly status = 409) { super(message) } }
  const operation = (action: string) => async (...args: unknown[]) => {
    if (state.error) throw state.error
    calls.push({ action, args }); return { id: 'record', status: 'PENDING' }
  }
  const mocks: Record<string, unknown> = {
    '@/lib/email': { dispatchGuideTransferEmail: async (id: string) => { calls.push({ action: 'DISPATCH', args: [id] }) } },
    '@/lib/check-admin': {
      getAdminActor: async () => state.authenticated ? { id: 'admin', email: 'admin@example.test', role: state.role } : null,
      getAdminAuditContext: () => context,
    },
    '@/lib/guide-transfers': { GuideTransferError, readReservationGuideTransfers: operation('READ'),
      prepareGuideTransfer: operation('PREPARE'), confirmGuideTransfer: operation('CONFIRM'), correctGuideTransfer: operation('CORRECT') },
  }
  const loadedModule = { exports: {} }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/admin/reservations/guide-transfers/route.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { module: loadedModule, exports: loadedModule.exports, Error,
    console: { error: () => {} },
    require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) })
  const route = loadedModule.exports as typeof import('../src/app/api/admin/reservations/guide-transfers/route')
  const post = (action = 'PREPARE', headers: Record<string, string> = {}, body?: string) => route.POST(new NextRequest(url, {
    method: 'POST', headers: { origin: 'https://safaruma.com', 'content-type': 'application/json', ...headers },
    body: body ?? JSON.stringify({ action, input: { earningId: 'earning' } }),
  }))
  return { state, calls, context, route, post, GuideTransferError }
}

test('GET requires an authenticated administrator and never caches transfer data', async () => {
  const f = fixture(); f.state.authenticated = false
  const denied = await f.route.GET(new NextRequest(`${url}?reservationId=reservation`))
  assert.equal(denied.status, 401); assert.equal(f.calls.length, 0)
  f.state.authenticated = true
  const response = await f.route.GET(new NextRequest(`${url}?reservationId=reservation`))
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(f.calls[0].action, 'READ'); assert.equal(f.calls[0].args[1], 'reservation')
})

test('POST rejects absent/null/foreign origins and cross-site requests before writes', async () => {
  const f = fixture()
  const invalidHeaders: Record<string, string>[] = [{ origin: '' }, { origin: 'null' }, { origin: 'https://evil.test' }, { 'sec-fetch-site': 'cross-site' }]
  for (const headers of invalidHeaders) {
    assert.equal((await f.post('PREPARE', headers)).status, 403)
  }
  const noOrigin = await f.route.POST(new NextRequest(url, { method: 'POST', body: '{}' }))
  assert.equal(noOrigin.status, 403); assert.equal(f.calls.length, 0)
})

test('POST requires authentication, JSON and a supported strict command', async () => {
  const f = fixture(); f.state.authenticated = false
  assert.equal((await f.post()).status, 401)
  f.state.authenticated = true
  assert.equal((await f.post('PREPARE', { 'content-type': 'text/plain' })).status, 415)
  assert.equal((await f.post('DELETE')).status, 400)
  assert.equal((await f.post('PREPARE', {}, '{')).status, 400)
  assert.equal((await f.post('PREPARE', {}, JSON.stringify({ action: 'PREPARE', input: {}, force: true }))).status, 400)
  assert.equal((await f.post('PREPARE', {}, 'x'.repeat(8193))).status, 413)
  assert.equal(f.calls.length, 0); assert.equal('DELETE' in f.route, false)
})

test('Admin can prepare but cannot confirm or correct; audit context is forwarded', async () => {
  const f = fixture()
  const response = await f.post()
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(f.calls[0].action, 'PREPARE'); assert.equal(f.calls[0].args[1], f.context)
  assert.equal((await f.post('CONFIRM')).status, 403); assert.equal((await f.post('CORRECT')).status, 403)
  assert.equal(f.calls.length, 1)
})

test('Superadmin can confirm and correct through the same guarded service', async () => {
  const f = fixture(); f.state.role = 'SUPERADMIN'
  assert.equal((await f.post('CONFIRM')).status, 200); assert.equal((await f.post('CORRECT')).status, 200)
  assert.deepEqual(f.calls.map(call => call.action), ['CONFIRM', 'DISPATCH', 'CORRECT'])
})

test('domain conflicts are explicit; unexpected failures never leak bank or database details', async () => {
  const f = fixture(); f.state.error = new f.GuideTransferError('Rechargez la réservation.', 409)
  let response = await f.post()
  assert.equal(response.status, 409); assert.equal((await response.json()).error, 'Rechargez la réservation.')
  f.state.error = new Error('postgres://secret TEST_PRIVATE_IBAN')
  response = await f.post()
  assert.equal(response.status, 500); assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.doesNotMatch(await response.text(), /postgres|secret|TEST_PRIVATE_IBAN/)
})
