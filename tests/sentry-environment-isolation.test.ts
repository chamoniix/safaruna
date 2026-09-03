import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const serverConfig = readFileSync('sentry.server.config.ts', 'utf8')
const edgeConfig = readFileSync('sentry.edge.config.ts', 'utf8')
const clientConfig = readFileSync('src/instrumentation-client.ts', 'utf8')

test('Sentry serveur et Edge utilisent le DSN des variables sans secret en dur', () => {
  for (const config of [serverConfig, edgeConfig]) {
    assert.match(config, /process\.env\.SENTRY_DSN/)
    assert.match(config, /process\.env\.NEXT_PUBLIC_SENTRY_DSN/)
    assert.doesNotMatch(config, /dsn:\s*["']https:\/\//)
  }
})

test('Sentry serveur et Edge sont limités au runtime Vercel surveillé', () => {
  for (const config of [serverConfig, edgeConfig]) {
    assert.match(config, /Boolean\(process\.env\.VERCEL_REGION\)/)
    assert.match(config, /process\.env\.VERCEL_REGION !== "dev1"/)
    assert.match(config, /process\.env\.VERCEL_ENV === "production"/)
    assert.match(config, /process\.env\.VERCEL_ENV === "preview"/)
    assert.match(config, /enabled: Boolean\(sentryDsn\) && isMonitoredVercelRuntime/)
    assert.match(config, /"vercel-production"/)
    assert.match(config, /"vercel-preview"/)
    assert.match(config, /"local"/)
  }
})

test('Sentry navigateur refuse les hôtes locaux et distingue Production de Preview', () => {
  assert.match(clientConfig, /process\.env\.NEXT_PUBLIC_VERCEL_ENV/)
  assert.match(clientConfig, /"localhost", "127\.0\.0\.1", "::1", "\[::1\]"/)
  assert.match(clientConfig, /window\.location\.hostname\.toLowerCase\(\)/)
  assert.match(clientConfig, /!isLocalHostname/)
  assert.match(clientConfig, /"vercel-production"/)
  assert.match(clientConfig, /"vercel-preview"/)
  assert.match(clientConfig, /"local"/)
})

test('la configuration client historique ne peut plus initialiser Sentry une seconde fois', () => {
  assert.equal(existsSync('sentry.client.config.ts'), false)
})
