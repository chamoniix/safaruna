import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { buildPelerinLoginUrl } from '../src/app/espace/layout'

const checkoutPage = readFileSync('src/app/espace/checkout/[slug]/page.tsx', 'utf8')

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

test('keeps the checkout navigation inside its dark account header', () => {
  assert.match(
    checkoutPage,
    /\.checkout-account-actions\s*\{[\s\S]*?position:\s*static;[\s\S]*?padding:\s*0;[\s\S]*?background:\s*transparent;[\s\S]*?border-bottom:\s*0;/,
  )
})
