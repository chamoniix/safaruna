import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { isReservedReferralCode } from '../src/lib/promotion-campaign'
import { canDeleteExpiredDraft } from '../src/lib/payments/expired-drafts'

test('le préfixe SAF reste exclusivement réservé au parrainage', () => {
  assert.equal(isReservedReferralCode(' saf-test '), true)
  assert.equal(isReservedReferralCode('TEST90'), false)
})

test('les campagnes ont un registre séparé et des limites globales et par pèlerin', () => {
  const schema = readFileSync('prisma/schema.prisma', 'utf8')
  assert.match(schema, /model PromotionCampaign \{/)
  assert.match(schema, /model PromotionRedemption \{/)
  assert.match(schema, /maxRedemptions\s+Int\?/)
  assert.match(schema, /maxRedemptionsPerPelerin\s+Int\?/)
  assert.match(schema, /maxDiscountBudgetCents\s+Int\?/)
})

test('une campagne est réservée sous verrou puis confirmée uniquement par le webhook payé', () => {
  const campaign = readFileSync('src/lib/promotion-campaign.ts', 'utf8')
  const checkout = readFileSync('src/lib/payments/create-session.ts', 'utf8')
  const webhook = readFileSync('src/lib/payments/process-event.ts', 'utf8')
  assert.match(campaign, /FOR UPDATE/)
  assert.match(campaign, /reservationDraftId: \{ not: null \}/)
  assert.match(checkout, /holdPromotionCampaign/)
  assert.match(webhook, /status: 'REDEEMED'/)
  assert.match(webhook, /status: 'EXHAUSTED'/)
  assert.match(webhook, /commission < 0 && !data\.promotionCampaign/)
  assert.match(webhook, /campaignCodeSnapshot/)
})

test('un draft expiré n’est supprimé que lorsque tous les états fournisseur sont terminaux', () => {
  assert.equal(canDeleteExpiredDraft([]), false)
  assert.equal(canDeleteExpiredDraft(['CREATED']), false)
  assert.equal(canDeleteExpiredDraft(['PENDING']), false)
  assert.equal(canDeleteExpiredDraft(['SUCCEEDED']), false)
  assert.equal(canDeleteExpiredDraft(['FAILED']), true)
  assert.equal(canDeleteExpiredDraft(['EXPIRED', 'CANCELLED']), true)
  assert.equal(canDeleteExpiredDraft(['FAILED', 'PENDING']), false)
})

test('Admin lit les campagnes mais seul Superadmin peut les modifier', () => {
  const route = readFileSync('src/app/api/admin/promotions/route.ts', 'utf8')
  assert.match(route, /export async function GET/)
  assert.match(route, /actor\.role !== 'SUPERADMIN'/)
  assert.match(route, /PROMOTION_CAMPAIGN_CREATED/)
  assert.match(route, /PROMOTION_CAMPAIGN_UPDATED/)
})
