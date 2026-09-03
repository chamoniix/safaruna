import assert from 'node:assert/strict'
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { spawnSync } from 'node:child_process'
import test from 'node:test'

const scriptPath = new URL('../scripts/check-runtime-env.mjs', import.meta.url)
const requiredNames = ['DATABASE_URL', 'NEXTAUTH_SECRET', 'NEXTAUTH_URL']
type EnvironmentOverrides = Record<string, string | undefined>

function isolatedEnvironment(
  overrides: EnvironmentOverrides = {},
): NodeJS.ProcessEnv {
  const environment: EnvironmentOverrides = { ...process.env }

  for (const name of [
    ...requiredNames,
    'VERCEL',
    'VERCEL_ENV',
    'VERCEL_REGION',
    '__NEXT_PROCESSED_ENV',
  ]) {
    delete environment[name]
  }

  return {
    ...environment,
    NODE_ENV: 'production',
    ...overrides,
  }
}

function runCheck(cwd: string, environment = isolatedEnvironment()) {
  return spawnSync(process.execPath, [scriptPath.pathname, '--check-only'], {
    cwd,
    encoding: 'utf8',
    env: environment,
  })
}

test('échoue avant le démarrage lorsque les variables requises manquent', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'safaruna-runtime-env-missing-'))
  t.after(() => rmSync(cwd, { force: true, recursive: true }))

  const result = runCheck(cwd)

  assert.equal(result.status, 1)
  assert.equal(result.stdout, '')
  assert.match(result.stderr, /DATABASE_URL/)
  assert.match(result.stderr, /NEXTAUTH_SECRET/)
  assert.match(result.stderr, /NEXTAUTH_URL/)
})

test('charge les fichiers .env de production avec le chargeur officiel Next.js', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'safaruna-runtime-env-success-'))
  t.after(() => rmSync(cwd, { force: true, recursive: true }))

  writeFileSync(
    join(cwd, '.env.production'),
    [
      'DATABASE_URL=postgresql://runtime-loader-test',
      'NEXTAUTH_SECRET=runtime-loader-secret',
      'NEXTAUTH_URL=https://runtime-loader.test',
    ].join('\n'),
  )

  const result = runCheck(cwd)

  assert.equal(result.status, 0)
  assert.equal(result.stdout, '')
  assert.equal(result.stderr, '')
})

test('ne révèle jamais les valeurs présentes lorsqu’une variable manque', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'safaruna-runtime-env-redaction-'))
  t.after(() => rmSync(cwd, { force: true, recursive: true }))

  const databaseSecret = 'database-secret-sentinel-value'
  const authSecret = 'private-nextauth-secret-value'
  const result = runCheck(
    cwd,
    isolatedEnvironment({
      DATABASE_URL: databaseSecret,
      NEXTAUTH_SECRET: authSecret,
    }),
  )

  assert.equal(result.status, 1)
  assert.match(result.stderr, /NEXTAUTH_URL/)
  assert.equal(result.stderr.includes(databaseSecret), false)
  assert.equal(result.stderr.includes(authSecret), false)
})

test('VERCEL seul ne permet pas de contourner le contrôle local', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'safaruna-runtime-env-vercel-'))
  t.after(() => rmSync(cwd, { force: true, recursive: true }))

  const result = runCheck(cwd, isolatedEnvironment({ VERCEL: '1' }))

  assert.equal(result.status, 1)
  assert.match(result.stderr, /DATABASE_URL/)
})

test('ne bloque pas un véritable runtime Vercel régional', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'safaruna-runtime-env-vercel-region-'))
  t.after(() => rmSync(cwd, { force: true, recursive: true }))

  const result = runCheck(
    cwd,
    isolatedEnvironment({
      VERCEL: '1',
      VERCEL_ENV: 'production',
      VERCEL_REGION: 'cdg1',
    }),
  )

  assert.equal(result.status, 0)
  assert.equal(result.stderr, '')
})

test('vercel dev en région dev1 reste soumis au contrôle local', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'safaruna-runtime-env-vercel-dev-'))
  t.after(() => rmSync(cwd, { force: true, recursive: true }))

  const result = runCheck(
    cwd,
    isolatedEnvironment({
      VERCEL: '1',
      VERCEL_ENV: 'preview',
      VERCEL_REGION: 'dev1',
    }),
  )

  assert.equal(result.status, 1)
  assert.match(result.stderr, /DATABASE_URL/)
})

test('une région sans environnement Vercel ne contourne pas le contrôle', (t) => {
  const cwd = mkdtempSync(join(tmpdir(), 'safaruna-runtime-env-region-only-'))
  t.after(() => rmSync(cwd, { force: true, recursive: true }))

  const result = runCheck(
    cwd,
    isolatedEnvironment({ VERCEL: '1', VERCEL_REGION: 'cdg1' }),
  )

  assert.equal(result.status, 1)
  assert.match(result.stderr, /DATABASE_URL/)
})
