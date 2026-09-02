import assert from 'node:assert/strict'
import test from 'node:test'
import { buildPelerinLoginUrl } from '../src/app/espace/layout'

test('preserves the complete booking URL when authentication is required', () => {
  const loginUrl = buildPelerinLoginUrl(
    '/espace/checkout/naim-laamari',
    '?pair=guide-medine&source=recherche',
  )

  const redirect = new URL(loginUrl, 'https://safaruma.com').searchParams.get('redirect')
  assert.equal(
    redirect,
    '/espace/checkout/naim-laamari?pair=guide-medine&source=recherche',
  )
})
