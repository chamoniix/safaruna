import assert from 'node:assert/strict'
import test from 'node:test'
import { publicGuideServicePriceCents, PUBLIC_EXTRA_PLACE_CENTS, splitBookingPaymentCents, allocateGuidePaymentCents } from '../src/lib/guide-pricing'

// Public tariff approved for 1–4, 5–14 and 15+ display ranges. No payout markup.
for (const [people, cents] of [[1,13000],[4,13000],[5,15500],[7,20500],[14,38000],[15,40500],[32,83000]]) {
  test(`public guide tariff: ${people} people pay ${cents / 100} euros per city mission`, () => {
    assert.equal(publicGuideServicePriceCents(people), cents)
  })
}
test('extra place costs 50 euros for the whole group', () => {
  assert.equal(PUBLIC_EXTRA_PLACE_CENTS,5000)
  assert.equal(publicGuideServicePriceCents(5)+2*PUBLIC_EXTRA_PLACE_CENTS,25500)
})

test('SAFARUMA retains 15 percent of the amount actually paid and the guide receives the remainder', () => {
  assert.deepEqual(splitBookingPaymentCents(40_500), { commissionCents: 6_075, guideNetCents: 34_425 })
  assert.deepEqual(splitBookingPaymentCents(13_000), { commissionCents: 1_950, guideNetCents: 11_050 })
  // A discounted payment is split from the amount collected, not the original price.
  assert.deepEqual(splitBookingPaymentCents(36_450), { commissionCents: 5_468, guideNetCents: 30_982 })
  for (const paid of [1, 99, 101, 15_501, 40_501]) {
    const split = splitBookingPaymentCents(paid)
    assert.equal(split.commissionCents + split.guideNetCents, paid)
    assert.equal(Number.isInteger(split.commissionCents), true)
    assert.equal(Number.isInteger(split.guideNetCents), true)
  }
})

test('the 85 percent is assigned to each guide according to their services', () => {
  const services = [
    { guideProfileId:'makkah',serviceGrossCents:13000,placesGrossCents:5000,transportGrossCents:0,hotelGrossCents:0 },
    { guideProfileId:'madinah',serviceGrossCents:13000,placesGrossCents:0,transportGrossCents:0,hotelGrossCents:0 },
  ]
  const paid = allocateGuidePaymentCents(31000,services)
  assert.equal(paid[0].totalNetCents,15300)
  assert.equal(paid[0].placesNetCents,4250)
  assert.equal(paid[1].totalNetCents,11050)
  const discounted = allocateGuidePaymentCents(27900,services)
  assert.equal(discounted[0].totalNetCents,13770)
  assert.equal(discounted[1].totalNetCents,9945)
  assert.equal(discounted.reduce((sum,item)=>sum+item.totalNetCents,0)+splitBookingPaymentCents(27900).commissionCents,27900)
})

test('transport and hotel are included in the same total split without losing rounding cents', () => {
  const paid=allocateGuidePaymentCents(45101,[{
    guideProfileId:'guide',serviceGrossCents:20500,placesGrossCents:20000,transportGrossCents:3600,hotelGrossCents:1001,
  }])[0]
  assert.equal(paid.totalNetCents,splitBookingPaymentCents(45101).guideNetCents)
  assert.equal(paid.totalNetCents,paid.serviceNetCents+paid.placesNetCents+paid.transportNetCents+paid.hotelNetCents)
})
