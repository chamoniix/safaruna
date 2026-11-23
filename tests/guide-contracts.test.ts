import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { PrismaClient } from '@prisma/client'

const require = createRequire(import.meta.url)
function load<T>(file: string, mocks: Record<string, unknown>, globals: Record<string, unknown> = {}): T {
  const module = { exports: {} }
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
  }).outputText, { module, exports: module.exports, Date, Error, Buffer, URL, Response, AbortSignal, process,
    require: (name: string) => name === 'server-only' ? {} : Object.hasOwn(mocks, name) ? mocks[name] : require(name), ...globals })
  return module.exports as T
}

test('contract route rejects anonymous, cross-origin and unrecognized actions without calling the service', async () => {
  let actor: object | null = null, calls = 0
  class Failure extends Error { status = 409 }
  const service = new Proxy({ GuideContractError: Failure }, { get(target, key) {
    return key in target ? target[key as keyof typeof target] : async () => { calls++; return { contract: null } }
  } })
  const route = load<typeof import('../src/app/api/admin/guides/[slug]/contract/route')>('src/app/api/admin/guides/[slug]/contract/route.ts', {
    '@/lib/check-admin': { getAdminActor: async () => actor, getAdminAuditContext: () => ({}) },
    '@/lib/guide-dossier': { GuideDossierDecisionError: Failure }, '@/lib/docuseal': { DocusealContractError: Failure },
    '@/lib/guide-contracts': service, '@/lib/ratelimit': { checkRateLimitKey: async () => null },
  })
  const context = { params: Promise.resolve({ slug: 'test' }) }
  const request = (body: unknown, origin?: string) => ({ nextUrl: new URL('https://safaruma.test/api/admin/guides/test/contract'),
    headers: new Headers(origin ? { origin } : {}), json: async () => body }) as any
  assert.equal((await route.GET(request(null), context)).status, 401)
  assert.equal((await route.POST(request({ action: 'PREPARE' }), context)).status, 401)
  actor = { id: 'test-admin', role: 'ADMIN', email: 'admin@example.test' }
  assert.equal((await route.POST(request({ action: 'SEND', contractId: 'c' }, 'https://other.test'), context)).status, 403)
  assert.equal((await route.POST(request({ action: 'PREPARE', submissionId: 999 }), context)).status, 400)
  assert.equal((await route.POST(request({ action: 'SEND', contractId: '' }), context)).status, 400)
  assert.equal(calls, 0)
  assert.equal((await route.POST(request({ action: 'PREPARE' }), context)).status, 200)
  assert.equal(calls, 1)
})

test('contract route keeps provider errors private and streams PDFs behind admin authentication', async () => {
  let fail = true
  class Failure extends Error { status = 409 }
  const route = load<typeof import('../src/app/api/admin/guides/[slug]/contract/route')>('src/app/api/admin/guides/[slug]/contract/route.ts', {
    '@/lib/check-admin': { getAdminActor: async () => ({ id: 'admin', role: 'ADMIN' }) },
    '@/lib/guide-dossier': { GuideDossierDecisionError: Failure }, '@/lib/docuseal': { DocusealContractError: Failure },
    '@/lib/guide-contracts': { GuideContractError: Failure,
      readAdminGuideContract: async () => { throw new Error('secret-token https://docuseal.com/private-signing-url') },
      downloadAdminGuideContract: async () => { if (fail) throw new Failure('Non signé.')
        return new ReadableStream({ start(controller) { controller.enqueue(new TextEncoder().encode('%PDF-test')); controller.close() } }) },
    }, '@/lib/ratelimit': { checkRateLimitKey: async () => null },
  })
  const context = { params: Promise.resolve({ slug: 'guide-test' }) }
  const request = (query = '') => ({ nextUrl: new URL(`https://safaruma.test/api/admin/guides/guide-test/contract${query}`) }) as any
  const unavailable = await route.GET(request(), context)
  assert.equal(unavailable.status, 503); assert.doesNotMatch(await unavailable.text(), /secret-token|private-signing-url/)
  assert.equal((await route.GET(request('?document=audit&contractId=c'), context)).status, 409)
  fail = false
  const pdf = await route.GET(request('?document=contract&contractId=c'), context)
  assert.equal(pdf.headers.get('cache-control'), 'private, no-store')
  assert.equal(pdf.headers.get('vary'), 'Cookie'); assert.equal(pdf.headers.get('content-type'), 'application/pdf')
  assert.match(pdf.headers.get('content-disposition')!, /^attachment/)
  assert.equal(await pdf.text(), '%PDF-test')
})

const url = process.env.GUIDE_CONTRACT_TEST_DATABASE_URL
test('Guide contracts persist and reconcile against an isolated PostgreSQL database', { skip: !url }, async t => {
  const parsed = new URL(url!)
  assert.ok(['localhost', '127.0.0.1'].includes(parsed.hostname)); assert.equal(parsed.pathname, '/safaruma_contracts_test')
  const db = new PrismaClient({ datasources: { db: { url } } })
  const remote = new Map<number, any>()
  let sequence = 0, creates = 0, sends = 0, loseCreate = false, loseSend = false, fetched = ''
  class FakeApi {
    async createSubmission(body: any) {
      creates++
      assert.equal(body.send_email, false); assert.equal(body.submitters[0].send_email, false)
      assert.equal(body.send_sms, false); assert.equal(body.submitters[0].completed, undefined)
      const id = ++sequence, s = body.submitters[0]
      const submitter = { id: id + 100, submission_id: id, email: s.email, role: s.role, external_id: s.external_id,
        sent_at: null, completed_at: null, declined_at: null, status: 'awaiting', values: [] }
      remote.set(id, { id, template: { id: body.template_id }, status: 'pending', archived_at: null,
        expire_at: null, completed_at: null, updated_at: '2026-11-23T10:00:00Z', submitters: [submitter],
        audit_log_url: 'https://docuseal.com/private-audit', combined_document_url: null })
      if (loseCreate) { loseCreate = false; throw new Error('Simulated lost create response') }
      return { id, submitters: [submitter] }
    }
    async getSubmission(id: number) { return structuredClone(remote.get(id)) }
    async listSubmitters(query: any) { return { data: [...remote.values()].flatMap(r => r.submitters).filter(s => s.external_id === query.external_id) } }
    async updateSubmitter(id: number, body: any) {
      sends++; assert.equal(body.send_email, true); assert.equal(body.send_sms, false)
      assert.equal(Object.keys(body).length, 2)
      const r = [...remote.values()].find(r => r.submitters[0].id === id)
      r.submitters[0].sent_at = '2026-11-23T11:00:00Z'; r.submitters[0].status = 'sent'
      r.updated_at = '2026-11-23T11:00:00Z'
      if (loseSend) { loseSend = false; throw new Error('Simulated lost send response') }
      return r.submitters[0]
    }
    async getSubmissionDocuments(id: number) { return { id, documents: [{ name: 'Contract', url: 'https://docuseal.com/private-pdf' }] } }
  }
  const provider = load<typeof import('../src/lib/docuseal')>('src/lib/docuseal.ts', {
    '@docuseal/api': { DocusealApi: FakeApi },
  }, { process: { env: { DOCUSEAL_API_KEY: 'test-key' } } })
  // Execute the actual current-admin guard without importing unrelated email/media services.
  const dossierSource = readFileSync('src/lib/guide-dossier.ts', 'utf8')
  const syntax = ts.createSourceFile('dossier.ts', dossierSource, ts.ScriptTarget.Latest, true)
  const guardText = syntax.statements.filter(s => (ts.isClassDeclaration(s) || ts.isFunctionDeclaration(s))
    && ['GuideDossierDecisionError', 'requireCurrentDossierAdmin'].includes(s.name?.getText(syntax) || '')).map(s => s.getText(syntax)).join('\n')
  const guardModule = { exports: {} }
  vm.runInNewContext(ts.transpileModule(guardText, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText,
    { module: guardModule, exports: guardModule.exports, Error })
  const service = load<typeof import('../src/lib/guide-contracts')>('src/lib/guide-contracts.ts', {
    '@/lib/prisma': db, '@/lib/guide-dossier': guardModule.exports, '@/lib/docuseal': provider,
    '@/lib/check-admin': { adminAuditDetail: (_c: unknown, d: unknown) => JSON.stringify(d), adminAuditFields: () => ({}) },
  }, { process: { env: { DOCUSEAL_API_KEY: 'test-key' } }, fetch: async (value: string) => {
    fetched = value
    return new Response('%PDF-test', { headers: { 'content-type': 'application/pdf' } })
  } })
  const accounts: string[] = [], profiles: string[] = [], admins: string[] = []
  const context = { ip: '127.0.0.1', requestId: 'contract-test', userAgent: 'local-test' } as any
  async function guide() {
    const g = await db.guideProfile.create({ data: { slug: `contract-${++sequence}`, city: 'MADINAH',
      guideAccount: { create: { email: `guide-${sequence}@example.test`, firstName: 'Guide', lastName: 'Test' } } } })
    accounts.push(g.guideAccountId!); profiles.push(g.id); return g
  }
  async function admin(role: 'ADMIN' | 'SUPERADMIN') {
    const a = await db.adminAccount.create({ data: { email: `${role}-${++sequence}@example.test`, role } })
    admins.push(a.id); return { id: a.id, email: a.email, role }
  }
  try {
    const actor = await admin('ADMIN'), owner = await admin('SUPERADMIN')
    await t.test('both authorized roles prepare without email; repeated preparation reuses the persisted contract', async () => {
      for (const a of [actor, owner]) {
        const g = await guide(), before = creates
        const first = await service.prepareAdminGuideContract(a, context, g.slug!, 'Adresse fictive')
        assert.equal(first.contract!.prepared, true); assert.equal(first.contract!.guideAddress, 'Adresse fictive')
        assert.equal(first.contract!.canSend, true); assert.equal(sends, 0)
        const second = await service.prepareAdminGuideContract(a, context, g.slug!)
        assert.equal(second.contract!.id, first.contract!.id); assert.equal(creates, before + 1)
        assert.doesNotMatch(JSON.stringify(second), /private-pdf|private-audit|externalId|submitterId|submissionId/)
      }
    })
    await t.test('a local reservation interrupted before its first provider call can resume safely', async () => {
      const g = await guide(), before = creates
      const record = await db.guideContract.create({ data: { guideProfileId: g.id, guideAccountId: g.guideAccountId!,
        version: service.GUIDE_CONTRACT_VERSION, templateId: service.GUIDE_CONTRACT_TEMPLATE_ID, externalId: `interrupted-${sequence}`,
        guideName: 'Guide Test', guideEmail: `guide-${sequence}@example.test`, guideCity: 'Médine' } })
      const pending = await service.readAdminGuideContract(actor, g.slug!)
      assert.equal(pending.contract!.canResumePreparation, true)
      const prepared = await service.prepareAdminGuideContract(actor, context, g.slug!)
      assert.equal(prepared.contract!.id, record.id); assert.equal(prepared.contract!.prepared, true)
      assert.equal(creates, before + 1)
    })
    await t.test('simultaneous preparations and sends produce at most one provider write', async () => {
      const g = await guide(), before = creates
      await Promise.allSettled([service.prepareAdminGuideContract(actor, context, g.slug!), service.prepareAdminGuideContract(owner, context, g.slug!)])
      const state = await service.readAdminGuideContract(actor, g.slug!)
      assert.ok(state.contract?.prepared); assert.equal(creates, before + 1)
      const sendBefore = sends
      await Promise.allSettled([service.sendAdminGuideContract(actor, context, g.slug!, state.contract!.id), service.sendAdminGuideContract(owner, context, g.slug!, state.contract!.id)])
      assert.equal(sends, sendBefore + 1)
      assert.ok((await service.readAdminGuideContract(actor, g.slug!)).contract!.sentAt)
    })
    await t.test('lost create and send responses reconcile without another provider mutation', async () => {
      const g = await guide(), before = creates; loseCreate = true
      await assert.rejects(service.prepareAdminGuideContract(actor, context, g.slug!), /lost create response/)
      const waiting = await service.readAdminGuideContract(actor, g.slug!)
      assert.equal(waiting.contract!.preparationUncertain, true)
      const fixed = await service.syncAdminGuideContract(actor, context, g.slug!, waiting.contract!.id)
      assert.equal(fixed.contract!.prepared, true); assert.equal(creates, before + 1)
      loseSend = true; const sendBefore = sends
      await assert.rejects(service.sendAdminGuideContract(actor, context, g.slug!, fixed.contract!.id), /lost send response/)
      const synced = await service.syncAdminGuideContract(actor, context, g.slug!, fixed.contract!.id)
      assert.ok(synced.contract!.sentAt); assert.equal(synced.contract!.canSend, false)
      await service.sendAdminGuideContract(actor, context, g.slug!, fixed.contract!.id)
      assert.equal(sends, sendBefore + 1)
    })
    await t.test('cross-Guide ids, changed identity and revoked admins cannot send', async () => {
      const g = await guide(), other = await guide()
      const state = await service.prepareAdminGuideContract(actor, context, g.slug!)
      const before = sends
      await assert.rejects(service.sendAdminGuideContract(actor, context, other.slug!, state.contract!.id), /introuvable/)
      await db.guideAccount.update({ where: { id: g.guideAccountId! }, data: { email: 'changed@example.test' } })
      await assert.rejects(service.sendAdminGuideContract(actor, context, g.slug!, state.contract!.id), /identité/)
      const revoked = await admin('ADMIN'); await db.adminAccount.update({ where: { id: revoked.id }, data: { status: 'SUSPENDED' } })
      await assert.rejects(service.readAdminGuideContract(revoked, g.slug!), /non autorisé/)
      assert.equal(sends, before)
    })
    await t.test('partial PDFs cannot be downloaded as signed; completion never activates or publishes a photo', async () => {
      const g = await guide(), state = await service.prepareAdminGuideContract(actor, context, g.slug!)
      const id = state.contract!.id
      await assert.rejects(service.downloadAdminGuideContract(actor, g.slug!, id, 'contract'), /pas encore entièrement signé/)
      await service.downloadAdminGuideContract(actor, g.slug!, id, 'preview'); assert.equal(fetched, 'https://docuseal.com/private-pdf')
      const stored = await db.guideContract.findUniqueOrThrow({ where: { id } })
      const r = remote.get(stored.submissionId!)
      r.status = 'completed'; r.completed_at = '2026-11-23T12:00:00Z'; r.updated_at = r.completed_at
      Object.assign(r.submitters[0], { status: 'completed', completed_at: r.completed_at, values: [{ field: 'Autorisation photo', value: false }] })
      const complete = await service.syncAdminGuideContract(actor, context, g.slug!, id)
      assert.equal(complete.contract!.canDownloadSigned, true); assert.equal(complete.contract!.photoConsent, false)
      await service.downloadAdminGuideContract(actor, g.slug!, id, 'contract')
      await service.downloadAdminGuideContract(actor, g.slug!, id, 'audit'); assert.equal(fetched, 'https://docuseal.com/private-audit')
      assert.equal((await db.guideProfile.findUniqueOrThrow({ where: { id: g.id } })).status, 'DRAFT')
      assert.equal((await db.guideAccount.findUniqueOrThrow({ where: { id: g.guideAccountId! } })).image, null)
      r.status = 'pending'; r.completed_at = null; r.updated_at = '2026-11-23T10:00:00Z'; r.submitters[0].status = 'awaiting'
      const old = await service.syncAdminGuideContract(actor, context, g.slug!, id)
      assert.equal(old.contract!.canDownloadSigned, true, 'older refresh cannot replace a newer stored provider state')
      await assert.rejects(service.downloadAdminGuideContract(actor, g.slug!, id, 'contract'), /pas encore entièrement signé/, 'download still checks the fresh provider state')
    })
    await t.test('unexpected document hosts are rejected before any fetch', async () => {
      const g = await guide(), state = await service.prepareAdminGuideContract(actor, context, g.slug!)
      const c = await db.guideContract.findUniqueOrThrow({ where: { id: state.contract!.id } })
      const r = remote.get(c.submissionId!); r.status = 'completed'; r.completed_at = '2026-11-23T12:00:00Z'
      Object.assign(r.submitters[0], { status: 'completed', completed_at: r.completed_at })
      r.audit_log_url = 'http://127.0.0.1/private'
      fetched = ''
      await assert.rejects(service.downloadAdminGuideContract(actor, g.slug!, c.id, 'audit'), /hôte/)
      assert.equal(fetched, '')
    })
    const audits = await db.auditLog.findMany({ where: { target: { in: profiles } } })
    assert.ok(audits.some(a => a.action === 'GUIDE_CONTRACT_PREPARED'))
    assert.doesNotMatch(JSON.stringify(audits), /private-pdf|private-audit|test-key/)
  } finally {
    await db.auditLog.deleteMany({ where: { target: { in: profiles } } })
    await db.guideProfile.deleteMany({ where: { id: { in: profiles } } })
    await db.guideAccount.deleteMany({ where: { id: { in: accounts } } })
    await db.adminAccount.deleteMany({ where: { id: { in: admins } } })
    await db.$disconnect()
  }
})
