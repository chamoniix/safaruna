import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createServer } from 'node:http'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { DocusealApi } from '@docuseal/api'

const require = createRequire(import.meta.url)

test('official SDK prepares an unsigned single-Guide request without email or SMS', async () => {
  const requests: { url: string; token: string | undefined; body: Record<string, unknown> }[] = []
  const server = createServer(async (req, res) => {
    let raw = ''
    for await (const chunk of req) raw += chunk
    requests.push({ url: req.url!, token: req.headers['x-auth-token'] as string, body: JSON.parse(raw) })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    res.end(JSON.stringify({ id: 17, submitters: [], created_at: '2026-11-19T12:00:00Z', expire_at: null }))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  try {
    const address = server.address()
    assert.ok(address && typeof address !== 'string')
    const port = address.port
    const environment = { DOCUSEAL_API_KEY: 'test-secret' }
    const loadedModule = { exports: {} }
    const code = ts.transpileModule(readFileSync('src/lib/docuseal.ts', 'utf8'), {
      compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
    }).outputText
    vm.runInNewContext(code, {
      module: loadedModule, exports: loadedModule.exports, process: { env: environment }, Error,
      require: (name: string) => {
        if (name === 'server-only') return {}
        if (name === '@docuseal/api') return { DocusealApi: class extends DocusealApi {
          constructor(config: ConstructorParameters<typeof DocusealApi>[0]) {
            assert.equal(config?.url, 'https://api.docuseal.com')
            super({ ...config, url: `http://127.0.0.1:${port}` })
          }
        } }
        return require(name)
      },
    })
    const service = loadedModule.exports as typeof import('../src/lib/docuseal')
    const result = await service.createGuideContractDraft({ templateId: 12, guideName: 'Guide test', guideEmail: 'guide@example.test' })
    assert.equal(result.id, 17)
    assert.equal(requests.length, 1)
    // SDK 1.0.25 uses the envelope-shaped init endpoint rather than the legacy array response.
    assert.equal(requests[0].url, '/submissions/init')
    assert.equal(requests[0].token, 'test-secret')
    assert.deepEqual(requests[0].body, {
      template_id: 12, send_email: false, send_sms: false,
      submitters: [{ role: 'Guide', name: 'Guide test', email: 'guide@example.test',
        values: { 'Nom complet du Guide': 'Guide test', 'Email du Guide': 'guide@example.test' },
        send_email: false, send_sms: false }],
    })
    await assert.rejects(service.createGuideContractDraft({ templateId: 0, guideName: 'Guide', guideEmail: 'invalid' }))
    assert.equal(requests.length, 1, 'invalid recipients never reach the API')
    environment.DOCUSEAL_API_KEY = ''
    assert.throws(() => service.getDocusealClient(), /non configurée/)
    assert.equal(requests.length, 1, 'missing credentials never reach the API')
  } finally {
    await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve()))
  }
})

async function contractFixture() {
  const reference = { templateId: 12, submissionId: 17, submitterId: 23, externalId: 'contract-test', guideEmail: 'guide@example.test' }
  const submitter = { id: 23, submission_id: 17, role: 'Guide', external_id: 'contract-test', email: 'guide@example.test',
    status: 'awaiting', sent_at: null as string | null, completed_at: null as string | null, declined_at: null as string | null }
  const submission = { id: 17, template: { id: 12 }, submitters: [submitter], status: 'pending',
    completed_at: null as string | null, archived_at: null as string | null, expire_at: null as string | null,
    audit_log_url: 'https://documents.example.test/audit.pdf' }
  const requests: { method: string; url: string; body: Record<string, unknown> | null }[] = []
  const server = createServer(async (req, res) => {
    let raw = ''; for await (const chunk of req) raw += chunk
    const body = raw ? JSON.parse(raw) : null
    requests.push({ method: req.method!, url: req.url!, body })
    res.writeHead(200, { 'Content-Type': 'application/json' })
    if (req.method === 'PUT' && req.url === '/submitters/23') {
      submitter.sent_at = '2026-11-23T12:00:00Z'; submitter.status = 'sent'
      res.end(JSON.stringify(submitter)); return
    }
    if (req.url === '/submissions/17/documents?merge=true') {
      res.end(JSON.stringify({ id: 17, documents: [{ name: 'Contract', url: 'https://documents.example.test/fresh.pdf' }] })); return
    }
    if (req.url === '/submissions/init') {
      res.end(JSON.stringify({ id: 17, submitters: [submitter] })); return
    }
    res.end(JSON.stringify(submission))
  })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  const address = server.address(); assert.ok(address && typeof address !== 'string')
  const port = address.port
  const loaded = { exports: {} }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/docuseal.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, {
    module: loaded, exports: loaded.exports, Date, Error,
    process: { env: { DOCUSEAL_API_KEY: 'test-secret' } },
    require: (name: string) => {
      if (name === 'server-only') return {}
      if (name === '@docuseal/api') return { DocusealApi: class extends DocusealApi {
        constructor(config: ConstructorParameters<typeof DocusealApi>[0]) { super({ ...config, url: `http://127.0.0.1:${port}` }) }
      } }
      return require(name)
    },
  })
  return { service: loaded.exports as typeof import('../src/lib/docuseal'), reference, submitter, submission, requests,
    close: () => new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())) }
}

test('preparation pre-fills the known identity and city without setting consent, date or signature', async () => {
  const f = await contractFixture()
  try {
    await f.service.createGuideContractDraft({ templateId: 12, guideName: 'Guide Test', guideEmail: f.reference.guideEmail,
      externalId: f.reference.externalId, guideCity: 'Médine', guideAddress: 'Adresse fictive de test' })
    const body = f.requests[0].body as { send_email: boolean; send_sms: boolean; submitters: Record<string, unknown>[] }
    assert.equal(body.send_email, false); assert.equal(body.send_sms, false)
    assert.deepEqual(body.submitters[0].values, { 'Nom complet du Guide': 'Guide Test', 'Email du Guide': 'guide@example.test',
      'Ville principale': 'Médine', 'Adresse du Guide': 'Adresse fictive de test' })
    assert.equal(body.submitters[0].external_id, 'contract-test')
    assert.equal(body.submitters[0].send_email, false); assert.equal(body.submitters[0].send_sms, false)
    assert.equal('completed' in body.submitters[0], false)
  } finally { await f.close() }
})

test('a Guide contract must match the stored submission, template, role, recipient and external id', async () => {
  const f = await contractFixture()
  try {
    assert.equal((await f.service.readVerifiedGuideContract(f.reference)).submission.id, 17)
    for (const change of [
      { templateId: 999 }, { submitterId: 999 }, { externalId: 'other-contract' }, { guideEmail: 'other@example.test' },
    ]) await assert.rejects(f.service.readVerifiedGuideContract({ ...f.reference, ...change }), /ne correspond pas/)
    f.submitter.role = 'Other'
    await assert.rejects(f.service.readVerifiedGuideContract(f.reference), /ne correspond pas/)
    f.submitter.role = 'Guide'; f.submission.submitters.push({ ...f.submitter, id: 24 })
    await assert.rejects(f.service.readVerifiedGuideContract(f.reference), /ne correspond pas/)
    assert.equal(f.requests.every(r => r.method === 'GET'), true)
  } finally { await f.close() }
})

test('invitation is a separate email-only operation and a confirmed send is not repeated', async () => {
  const f = await contractFixture()
  try {
    const first = await f.service.sendGuideContractInvitation(f.reference)
    assert.equal(first.sentAt, '2026-11-23T12:00:00Z'); assert.equal(first.alreadySent, false)
    const again = await f.service.sendGuideContractInvitation(f.reference)
    assert.equal(again.alreadySent, true)
    const writes = f.requests.filter(r => r.method !== 'GET')
    assert.equal(writes.length, 1)
    assert.deepEqual(writes[0], { method: 'PUT', url: '/submitters/23', body: { send_email: true, send_sms: false } })
  } finally { await f.close() }
})

test('wrong recipient, archived, expired, completed and declined contracts never send an invitation', async () => {
  const f = await contractFixture()
  try {
    await assert.rejects(f.service.sendGuideContractInvitation({ ...f.reference, guideEmail: 'other@example.test' }))
    f.submission.archived_at = '2026-11-23T00:00:00Z'
    await assert.rejects(f.service.sendGuideContractInvitation(f.reference))
    f.submission.archived_at = null; f.submission.expire_at = '2000-01-01T00:00:00Z'
    await assert.rejects(f.service.sendGuideContractInvitation(f.reference))
    f.submission.expire_at = null
    for (const status of ['completed', 'declined', 'expired']) {
      f.submission.status = status
      await assert.rejects(f.service.sendGuideContractInvitation(f.reference))
    }
    assert.equal(f.requests.some(r => r.method === 'PUT'), false)
  } finally { await f.close() }
})

test('a partially filled PDF is never returned as signed and final PDFs use a fresh provider lookup', async () => {
  const f = await contractFixture()
  try {
    await assert.rejects(f.service.readSignedGuideContractDocument(f.reference, 'contract'), /pas encore entièrement signé/)
    assert.equal(f.requests.some(r => r.url.includes('/documents')), false)
    f.submission.status = 'completed'; f.submission.completed_at = '2026-11-23T12:00:00Z'
    await assert.rejects(f.service.readSignedGuideContractDocument(f.reference, 'contract'), /pas encore entièrement signé/)
    f.submitter.status = 'completed'; f.submitter.completed_at = f.submission.completed_at
    assert.equal(await f.service.readSignedGuideContractDocument(f.reference, 'contract'), 'https://documents.example.test/fresh.pdf')
    assert.equal(await f.service.readSignedGuideContractDocument(f.reference, 'audit'), 'https://documents.example.test/audit.pdf')
    assert.equal(f.requests.filter(r => r.url.includes('/documents')).length, 1)
  } finally { await f.close() }
})
