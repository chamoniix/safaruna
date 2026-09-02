import assert from 'node:assert/strict'
import test from 'node:test'
import {
  captureCheckoutScrollState,
  isAllowedHostedCheckoutUrl,
  restoreCheckoutScrollState,
} from '../src/app/espace/checkout/[slug]/revolut-embedded-checkout'

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

test('restores the checkout and document scroll after an express payment closes', () => {
  const container = {
    style: { overflowY: 'auto' },
    scrollTop: 184,
  }
  let restoredWindowY = -1
  const ownerDocument = {
    body: { style: { overflow: '', position: '', top: '', width: '' } },
    documentElement: { style: { overflow: '' } },
    defaultView: {
      scrollY: 36,
      scrollTo: (_x: number, y: number) => { restoredWindowY = y },
    },
  }
  const target = {
    ownerDocument,
    closest: () => container,
  }

  const snapshot = captureCheckoutScrollState(target as unknown as HTMLElement)
  ownerDocument.body.style.overflow = 'hidden'
  ownerDocument.body.style.position = 'fixed'
  ownerDocument.documentElement.style.overflow = 'hidden'
  container.style.overflowY = 'hidden'
  container.scrollTop = 0

  restoreCheckoutScrollState(snapshot, ownerDocument as unknown as Document)

  assert.equal(ownerDocument.body.style.overflow, '')
  assert.equal(ownerDocument.body.style.position, '')
  assert.equal(ownerDocument.documentElement.style.overflow, '')
  assert.equal(container.style.overflowY, 'auto')
  assert.equal(container.scrollTop, 184)
  assert.equal(restoredWindowY, 36)
})
