#!/usr/bin/env node

import { spawn } from 'node:child_process'
import { join } from 'node:path'
import nextEnv from '@next/env'

const { loadEnvConfig } = nextEnv

const REQUIRED_RUNTIME_ENV_NAMES = [
  'DATABASE_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
]

const vercelRegion = process.env.VERCEL_REGION?.trim()
const vercelEnvironment = process.env.VERCEL_ENV
const isVercelRuntime = Boolean(
  vercelRegion &&
    vercelRegion !== 'dev1' &&
    (vercelEnvironment === 'production' || vercelEnvironment === 'preview'),
)
const checkOnly = process.argv.includes('--check-only')

if (!isVercelRuntime) {
  loadEnvConfig(process.cwd(), false, {
    info() {},
    error() {},
  })

  const missingNames = REQUIRED_RUNTIME_ENV_NAMES.filter(
    (name) => !process.env[name]?.trim(),
  )

  if (missingNames.length > 0) {
    console.error(
      `[runtime-env] Variables requises manquantes : ${missingNames.join(', ')}`,
    )
    process.exit(1)
  }
}

if (checkOnly) {
  process.exit(0)
}

const nextBin = join(process.cwd(), 'node_modules', 'next', 'dist', 'bin', 'next')
const nextArgs = process.argv.slice(2).filter((argument) => argument !== '--check-only')
const nextProcess = spawn(process.execPath, [nextBin, 'start', ...nextArgs], {
  env: process.env,
  stdio: 'inherit',
})

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.once(signal, () => {
    nextProcess.kill(signal)
  })
}

nextProcess.once('error', () => {
  console.error('[runtime-env] Impossible de démarrer Next.js.')
  process.exitCode = 1
})

nextProcess.once('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }

  process.exitCode = code ?? 1
})
