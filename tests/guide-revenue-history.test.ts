import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { NextRequest, NextResponse } from 'next/server'

const require = createRequire(import.meta.url)
function fixture(allowed = true) {
  const queries: { model: string; input: Record<string, unknown> }[] = []
  const capture = (model: string, result: unknown) => async (input: Record<string, unknown>) => { queries.push({ model, input }); return result }
  const db = {
    guideEarning: {
      findMany: capture('earnings', []),
      aggregate: capture('earnings-total', { _sum: { totalNetCents: 1010000 }, _count: { _all: 101 } }),
    },
    transfer: {
      findFirst: capture('legacy', null),
      aggregate: capture('sent-total', { _sum: { amountCents: 12345 } }),
      count: capture('sent-count', 21),
      findMany: capture('sent-rows', [{ id: 'transfer', amountCents: 12345, currency: 'EUR', bankReference: 'CORRECTED-REF',
        sentAt: new Date('2026-01-07T12:00:00Z'), confirmedAt: new Date('2026-01-08T12:00:00Z'), recordedEarning: { reservation: { refNumber: 'RES-1' } },
      }]),
    },
  }
  const mocks: Record<string, unknown> = {
    '@/lib/prisma': db,
    '@/lib/require-account': { requireGuide: async (options: unknown) => {
      assert.equal((options as { published: boolean }).published, true)
      return allowed ? { ok: true, actor: { guideProfileId: 'authenticated-guide' } } : { ok: false, response: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) }
    } },
  }
  const loadedModule = { exports: {} }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/app/api/guide/revenus/route.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, { module: loadedModule, exports: loadedModule.exports, Date,
    require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name) })
  const route = loadedModule.exports as typeof import('../src/app/api/guide/revenus/route')
  return { queries, get: (query = '') => route.GET(new NextRequest(`https://safaruma.com/api/guide/revenus${query}`)) }
}

test('Guide revenue totals cover more than 100 missions independently of displayed history', async () => {
  const f = fixture(), response = await f.get('?transferPage=2&guideProfileId=other')
  const data = await response.json()
  assert.equal(response.status, 200); assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal(data.stats.nbMissions, 101); assert.equal(data.stats.totalNet, 10100)
  assert.equal(data.stats.sentNet, 123.45); assert.equal(data.history.length, 0)
  assert.equal(data.transfers.page, 2); assert.equal(data.transfers.pages, 3)
  assert.equal(data.transfers.rows[0].bankReference, 'CORRECTED-REF')
  assert.equal(f.queries.find(query => query.model === 'sent-rows')?.input.skip, 10)
  for (const query of f.queries) assert.equal((query.input.where as { guideProfileId: string }).guideProfileId, 'authenticated-guide')
  const sentWhere = f.queries.find(query => query.model === 'sent-rows')!.input.where
  assert.match(JSON.stringify(sentWhere), /"status":"PAID"/); assert.match(JSON.stringify(sentWhere), /"confirmedAt":\{"not":null\}/)
  assert.doesNotMatch(JSON.stringify(data), /bankSnapshot|iban|preparedByEmail|confirmedByEmail|commission/)
})

test('Guide authentication is required before any bank history query', async () => {
  const f = fixture(false)
  assert.equal((await f.get()).status, 401); assert.equal(f.queries.length, 0)
})

test('invalid transfer pagination cannot cause unbounded or negative offset', async () => {
  for (const value of ['-5', 'NaN', 'Infinity', '0', '1.5']) {
    const f = fixture(); const data = await (await f.get(`?transferPage=${value}`)).json()
    assert.equal(data.transfers.page, 1)
  }
})
