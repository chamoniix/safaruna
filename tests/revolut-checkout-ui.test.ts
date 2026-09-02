import assert from 'node:assert/strict'
import test from 'node:test'
import { isAllowedHostedCheckoutUrl } from '../src/app/espace/checkout/[slug]/revolut-embedded-checkout'

test('the hosted fallback accepts only the official Revolut checkout origin', () => {
  assert.equal(
    isAllowedHostedCheckoutUrl('https://checkout.revolut.com/payment-link/order-id'),
    true
  )
  assert.equal(
    isAllowedHostedCheckoutUrl('https://checkout.revolut.com.evil.example/payment-link/order-id'),
    false
  )
  assert.equal(
    isAllowedHostedCheckoutUrl('http://checkout.revolut.com/payment-link/order-id'),
    false
  )
  assert.equal(isAllowedHostedCheckoutUrl('not-a-url'), false)
})
