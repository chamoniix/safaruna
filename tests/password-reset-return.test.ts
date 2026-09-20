import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { runInNewContext } from 'node:vm'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const login = 'src/app/connexion/page.tsx'
const forgot = 'src/app/mot-de-passe-oublie/page.tsx'
const reset = 'src/app/reinitialiser-mot-de-passe/page.tsx'
const route = 'src/app/api/auth/forgot-password/route.ts'
const destination = '/espace/checkout/naim-laamari?pair=guide-madine&selectionCity=MADINAH#recap'
const read = (path: string) => process.env.NAVIGATION_BASELINE === '1'
  ? execFileSync('git', ['show', `HEAD:${path}`], { encoding: 'utf8' }) : readFileSync(path, 'utf8')
function evaluate(code: string, context: Record<string, unknown> = {}) {
  return runInNewContext(ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText, { URL, URLSearchParams, encodeURIComponent, ...context })
}
function named(path: string, name: string) {
  const file = ts.createSourceFile(path, read(path), ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  let result = ''
  function visit(node: ts.Node) {
    if (ts.isFunctionDeclaration(node) && node.name?.text === name) result = node.getText(file)
    if (ts.isVariableDeclaration(node) && node.name.getText(file) === name) result = `const ${node.getText(file)};`
    node.forEachChild(visit)
  }
  visit(file)
  assert.ok(result, `${path}: ${name} missing`)
  return result
}

test('all reset entry points reject external/privileged returns while preserving safe pilgrim paths', () => {
  for (const path of [forgot, reset, route]) {
    const code = named(path, 'safePelerinRedirect')
    for (const value of [destination, '/guides', '/avis/deposer', '/espace/tableau-de-bord']) {
      assert.equal(evaluate(`${code}\nsafePelerinRedirect(value)`, { value }), value)
    }
    for (const value of [null, 12, {}, ['x'], '', 'https://evil.example', '//evil.example', '/\\evil.example', 'javascript:alert(1)', '/admin', '/espace/../../admin', '/guides/../../admin', '/espace/' + 'x'.repeat(2050)]) {
      assert.equal(evaluate(`${code}\nsafePelerinRedirect(value)`, { value }), '')
    }
  }
})

test('login, forgot and reset links preserve the full safe destination, absent destination preserves legacy URLs', () => {
  for (const [path, name, target] of [[login, 'forgotPasswordHref', '/mot-de-passe-oublie'], [forgot, 'loginHref', '/connexion'], [reset, 'loginHref', '/connexion'], [reset, 'forgotPasswordHref', '/mot-de-passe-oublie']]) {
    for (const redirectParam of ['', destination]) {
      const value = evaluate(`${named(path, name)}\n${name}`, { redirectParam })
      const url = new URL(value, 'https://safaruma.com')
      assert.equal(url.pathname, target)
      assert.equal(url.searchParams.get('redirect'), redirectParam || null)
      assert.match(read(path), new RegExp(`href=\\{${name}\\}`))
    }
  }
  assert.match(read(forgot), /JSON\.stringify\(\{ email, redirect: redirectParam \}\)/)
  assert.match(read(forgot), /<Suspense[\s\S]*<ForgotPasswordForm/)
})

test('actual reset request puts the safe return in email without changing hashed single-use token storage', async () => {
  for (const redirect of [destination, undefined, '//evil.example', { invalid: true }]) {
    let emailUrl = ''
    let storedToken = ''
    const user = { id: 'isolated-user', firstName: 'Test' }
    const tx = {
      passwordResetToken: { deleteMany: async () => ({}), create: async ({ data }: { data: { token: string } }) => { storedToken = data.token } },
      auditLog: { create: async () => ({}) },
    }
    const mocks: Record<string, unknown> = {
      'next/server': { NextResponse: { json: (body: unknown, init?: ResponseInit) => Response.json(body, init) } },
      '@/lib/prisma': { __esModule: true, default: { user: { findUnique: async () => user }, $transaction: async (fn: (client: typeof tx) => unknown) => fn(tx), auditLog: tx.auditLog } },
      '@/lib/email': { sendPasswordReset: async ({ resetUrl }: { resetUrl: string }) => { emailUrl = resetUrl } },
      '@/lib/ratelimit': { authRatelimit: {}, checkRateLimit: async () => null },
      '@/lib/guide-auth': { getGuideRequestContext: () => ({}) },
    }
    const exports: { POST?: (req: { json: () => Promise<unknown> }) => Promise<Response> } = {}
    evaluate(read(route), { exports, process: { env: { NEXTAUTH_URL: 'https://safaruma.com' } }, require: (id: string) => id in mocks ? mocks[id] : require(id) })
    const response = await exports.POST!({ json: async () => ({ email: 'isolated@example.com', redirect }) })
    assert.equal(response.status, 200)
    const url = new URL(emailUrl)
    assert.equal(url.origin, 'https://safaruma.com')
    assert.equal(url.pathname, '/reinitialiser-mot-de-passe')
    assert.equal(url.searchParams.get('redirect'), redirect === destination ? destination : null)
    const token = url.searchParams.get('token')!
    assert.match(token, /^[a-f0-9]{64}$/)
    assert.equal(storedToken, createHash('sha256').update(token).digest('hex'))
    assert.notEqual(storedToken, token)
  }
})
