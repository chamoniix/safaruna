import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'

const require = createRequire(import.meta.url)
type Delivery = {
  id: string; idempotencyKey: string; category: string; status: string;
  attempts: number; maxAttempts: number; payloadEncrypted: string | null;
  nextAttemptAt: Date | null; updatedAt: Date; [key: string]: unknown;
}
function fixture() {
  const rows: Delivery[] = []
  const sent: { url: string; body: Record<string, unknown> }[] = []
  let httpStatus = 201
  let failClaim = false
  let networkFailure = false
  const db = { emailDelivery: {
    create: async ({ data }: { data: Record<string, unknown> }) => {
      if (rows.some(row => row.idempotencyKey === data.idempotencyKey)) throw new Error('duplicate delivery')
      const row = { id: `mail-${rows.length}`, status: 'QUEUED', attempts: 0, updatedAt: new Date(), ...data } as Delivery
      rows.push(row); return row
    },
    findMany: async ({ where, take }: { where: { id?: { in: string[] }; OR: { status: string; category?: { in: string[] } }[] }; take: number }) => rows.filter(row =>
      row.payloadEncrypted && (row.attempts < 3 || row.category === 'GUIDE_TRANSFER_CONFIRMED' && row.status === 'SENDING') && (!where.id || where.id.in.includes(row.id)) && where.OR.some(option =>
        row.status === option.status && (!option.category || option.category.in.includes(row.category)) &&
        (row.status === 'SENDING' ? row.updatedAt.getTime() <= Date.now() - 900_000 : row.nextAttemptAt !== null && row.nextAttemptAt.getTime() <= Date.now())
      )).slice(0, take).map(row => ({ ...row })),
    updateMany: async ({ where, data }: { where: { id: string; status: string; attempts: number }; data: Partial<Omit<Delivery, 'attempts'>> & { attempts?: { increment: number } } }) => {
      if (failClaim) throw new Error('database unavailable')
      const row = rows.find(row => row.id === where.id && row.status === where.status && row.attempts === where.attempts)
      if (!row) return { count: 0 }
      const attempts = row.attempts + (data.attempts?.increment ?? 0)
      Object.assign(row, data, { attempts, updatedAt: new Date() }); return { count: 1 }
    },
    update: async ({ where, data }: { where: { id: string }; data: Partial<Delivery> }) => {
      const row = rows.find(row => row.id === where.id)!
      Object.assign(row, data); return row
    },
  } }
  const mocks: Record<string, unknown> = {
    '@/lib/prisma': db,
    '@/lib/crypto': { encrypt: (value: string) => `sealed:${value}`, decrypt: (value: string) => value.slice(7) },
  }
  const sandboxModule = { exports: {} as {
    queueGuideDossierEmail: (tx: unknown, opts: Record<string, unknown>) => Promise<string>;
    dispatchGuideDossierEmails: (ids: string[]) => Promise<void>;
    retryPendingEmails: (limit?: number) => Promise<{ checked: number; accepted: number; failed: number }>;
    queueGuideTransferEmail: (tx: unknown, opts: Record<string, unknown>) => Promise<string>;
  } }
  vm.runInNewContext(ts.transpileModule(readFileSync('src/lib/email.ts', 'utf8'), {
    compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, esModuleInterop: true },
  }).outputText, {
    module: sandboxModule, exports: sandboxModule.exports, Date, Error, AbortSignal, console: { error: () => {} },
    process: { env: { BREVO_API_KEY: 'unit-test-only', NEXT_PUBLIC_BASE_URL: 'https://safaruma.test' } },
    require: (name: string) => Object.hasOwn(mocks, name) ? mocks[name] : require(name),
    fetch: async (url: string, options: { body: string }) => {
      sent.push({ url, body: JSON.parse(options.body) })
      if (networkFailure) throw new Error('response lost')
      return { ok: httpStatus < 400, status: httpStatus, text: async () => '', json: async () => ({ messageId: `brevo-test-${sent.length}` }) }
    },
  })
  const queue = (event = 'SUBMITTED', eventId = 'audit-1') => sandboxModule.exports.queueGuideDossierEmail(db, {
    event, eventId, guideProfileId: 'guide-1', to: 'guide@example.test', name: '<script>test</script>', slug: 'guide-test',
  })
  const stored = (index = 0) => JSON.parse(rows[index].payloadEncrypted!.slice(7))
  const queueTransfer = () => sandboxModule.exports.queueGuideTransferEmail(db, {
    transferId: 'transfer', to: 'guide@example.test', name: '<script>Guide</script>', refNumber: 'RES-TEST',
    amountCents: 12345, bankReference: '<BANK-REF>', sentAt: new Date('2026-01-07T12:00:00Z'),
  })
  const due = () => rows.forEach(row => { row.nextAttemptAt = new Date(0) })
  return { ...sandboxModule.exports, rows, sent, queue, queueTransfer, stored, due, networkFailure: () => { networkFailure = true },
    providerError: (status: number) => { httpStatus = status }, breakClaim: () => { failClaim = true } }
}

test('dossier notification is persisted encrypted with event identity before any provider call', async () => {
  const f = fixture()
  const id = await f.queue()
  assert.equal(f.sent.length, 0)
  assert.equal(id, f.rows[0].id)
  assert.equal(f.rows[0].status, 'QUEUED')
  assert.equal(f.rows[0].referenceId, 'guide-1')
  assert.match(f.rows[0].idempotencyKey, /audit-1:SUBMITTED/)
  assert.match(f.stored().html, /&lt;script&gt;test&lt;\/script&gt;/)
  assert.doesNotMatch(f.stored().html, /<script>|IBAN|BIC|private\//)
  await assert.rejects(f.queue(), /duplicate/)
  assert.equal(f.rows.length, 1)
})

test('all decision templates point to the correct private dashboard, not an automatic publication', async () => {
  const f = fixture()
  for (const event of ['SUBMITTED', 'ADMIN_REVIEW', 'APPROVED', 'REJECTED', 'RETURNED', 'ACTIVATED']) {
    await f.queue(event, `audit-${event}`)
    const payload = f.stored(f.rows.length - 1)
    assert.match(payload.html, event === 'ADMIN_REVIEW' ? /\/admin\/guides\/guide-test/ : /\/guide\/profil/)
    if (event === 'APPROVED') assert.match(payload.html, /ne publie pas automatiquement/)
    if (event === 'ACTIVATED') assert.match(payload.html, /pause générale/)
  }
  assert.equal(f.sent.length, 0)
})

test('cron recovers committed QUEUED email when immediate dispatch never ran', async () => {
  const f = fixture()
  await f.queue()
  const result = await f.retryPendingEmails()
  assert.equal(result.accepted, 1)
  assert.equal(f.sent.length, 1)
  assert.equal(f.rows[0].status, 'ACCEPTED')
  assert.equal(f.rows[0].payloadEncrypted, null)
  assert.equal(f.rows[0].deliveredAt, undefined, 'provider acceptance is not delivery confirmation')
  await f.retryPendingEmails()
  assert.equal(f.sent.length, 1)
})

test('concurrent cron and immediate dispatch claim the same email only once', async () => {
  const f = fixture()
  const id = await f.queue()
  await Promise.all([f.dispatchGuideDossierEmails([id]), f.retryPendingEmails()])
  assert.equal(f.sent.length, 1)
  assert.equal(f.rows[0].attempts, 1)
})

test('transient provider failure retries the same provider key, capped at three attempts', async () => {
  const f = fixture()
  const id = await f.queue()
  f.providerError(503)
  await f.dispatchGuideDossierEmails([id])
  assert.equal(f.rows[0].status, 'RETRY_PENDING')
  assert.ok(f.rows[0].payloadEncrypted)
  f.due(); await f.retryPendingEmails()
  f.due(); await f.retryPendingEmails()
  assert.equal(f.rows[0].status, 'FAILED')
  assert.equal(f.rows[0].attempts, 3)
  assert.equal(f.rows[0].payloadEncrypted, null)
  const keys = f.sent.map(item => (item.body.headers as Record<string, string>)['Idempotency-Key'])
  assert.equal(new Set(keys).size, 1)
  await f.retryPendingEmails()
  assert.equal(f.sent.length, 3)
})

test('separate reactivations are separate events; unchanged event cannot enqueue twice', async () => {
  const f = fixture()
  const first = await f.queue('ACTIVATED', 'activation-one')
  const second = await f.queue('ACTIVATED', 'activation-two')
  await f.dispatchGuideDossierEmails([first, second])
  assert.equal(f.sent.length, 2)
  assert.notDeepEqual(f.sent[0].body.headers, f.sent[1].body.headers)
})

test('dispatch failure preserves durable QUEUED row and does not reject the committed decision', async () => {
  const f = fixture()
  const id = await f.queue()
  f.breakClaim()
  await assert.doesNotReject(f.dispatchGuideDossierEmails([id]))
  assert.equal(f.rows[0].status, 'QUEUED')
  assert.equal(f.sent.length, 0)
})

test('permanent provider error is not retried and unrelated legacy QUEUED categories are untouched', async () => {
  const f = fixture()
  const id = await f.queue()
  f.providerError(400)
  await f.dispatchGuideDossierEmails([id])
  assert.equal(f.rows[0].status, 'FAILED')
  await f.queue('SUBMITTED', 'legacy-other')
  f.rows[1].category = 'PELERIN_WELCOME'
  await f.retryPendingEmails()
  assert.equal(f.sent.length, 1)
  assert.equal(f.rows[1].status, 'QUEUED')
})

test('existing non-dossier RETRY_PENDING emails remain eligible for the same cron', async () => {
  const f = fixture()
  await f.queue()
  f.rows[0].category = 'PELERIN_WELCOME'
  f.rows[0].status = 'RETRY_PENDING'
  f.rows[0].attempts = 1
  f.due()
  assert.equal((await f.retryPendingEmails()).accepted, 1)
  assert.equal(f.rows[0].attempts, 2)
})

test('immediate dispatch targets only its committed event, leaving other queued dossiers to cron', async () => {
  const f = fixture()
  const first = await f.queue('SUBMITTED', 'one')
  await f.queue('SUBMITTED', 'two')
  await f.dispatchGuideDossierEmails([first])
  assert.equal(f.sent.length, 1)
  assert.equal(f.rows[1].status, 'QUEUED')
  assert.equal((await f.retryPendingEmails()).accepted, 1)
})

test('transfer confirmation queues one encrypted net-only email without a provider call', async () => {
  const f = fixture(); await f.queueTransfer()
  assert.equal(f.sent.length, 0); assert.equal(f.rows[0].referenceType, 'GUIDE_TRANSFER')
  assert.equal(f.rows[0].referenceId, 'transfer')
  assert.match(f.stored().html, /123,45/); assert.match(f.stored().html, /&lt;BANK-REF&gt;/)
  assert.match(f.stored().html, /&lt;script&gt;Guide&lt;\/script&gt;/)
  assert.match(f.stored().html, /ne confirme pas la réception/)
  assert.match(f.stored().html, /\/guide\/revenus/)
  assert.doesNotMatch(f.stored().html, /IBAN|commission|prix client/)
  await assert.rejects(f.queueTransfer(), /duplicate/)
})

test('transfer confirmation is recovered by cron once, including concurrent attempts', async () => {
  const f = fixture(); await f.queueTransfer()
  await Promise.all([f.retryPendingEmails(), f.retryPendingEmails()])
  assert.equal(f.sent.length, 1); assert.equal(f.rows[0].status, 'ACCEPTED')
  assert.equal(f.rows[0].deliveredAt, undefined)
  await f.retryPendingEmails(); assert.equal(f.sent.length, 1)
})

test('definite rate limiting can retry a transfer email with the same identity', async () => {
  const f = fixture(); await f.queueTransfer(); f.providerError(429)
  await f.retryPendingEmails(); assert.equal(f.rows[0].status, 'RETRY_PENDING')
  f.due(); f.providerError(201); await f.retryPendingEmails()
  assert.equal(f.rows[0].status, 'ACCEPTED'); assert.equal(f.sent.length, 2)
  assert.deepEqual(f.sent[0].body.headers, f.sent[1].body.headers)
})

for (const cause of ['lost-response', '5xx', 'stale-sending'] as const) test(`uncertain transfer email ${cause} is never automatically sent again`, async () => {
  const f = fixture(); await f.queueTransfer()
  if (cause === 'lost-response') f.networkFailure()
  if (cause === '5xx') f.providerError(503)
  if (cause === 'stale-sending') {
    f.rows[0].status = 'SENDING'; f.rows[0].attempts = 3; f.rows[0].updatedAt = new Date(0)
  }
  await f.retryPendingEmails()
  assert.equal(f.rows[0].status, 'FAILED'); assert.match(String(f.rows[0].lastError), /[Vv]érif/)
  const sent = f.sent.length; f.due(); await f.retryPendingEmails(); assert.equal(f.sent.length, sent)
  assert.equal(sent, cause === 'stale-sending' ? 0 : 1)
})
