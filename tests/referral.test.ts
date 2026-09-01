import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizePromoCode, promoDiscountCents, promoExpiry } from '../src/lib/referral'

test('un code promotionnel est normalisé sans espace', () => {
  assert.equal(normalizePromoCode(' saf-ab 12 '), 'SAF-AB12')
})

test('la réduction de parrainage est de 10 %', () => {
  assert.equal(promoDiscountCents(13_000, 1_000), 1_300)
  assert.equal(promoDiscountCents(65_500, 1_000), 6_550)
})

test('un code de parrainage expire au bout de 60 jours', () => {
  const start = new Date('2026-09-01T12:00:00.000Z')
  assert.equal(promoExpiry(start).toISOString(), '2026-10-31T12:00:00.000Z')
})
