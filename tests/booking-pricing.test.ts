import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateBookingTransportPrice } from '../src/lib/booking-pricing'

const baseInput = {
  cityChoice: 'BOTH' as const,
  nbPeople: 2,
  selectedPlaces: [] as string[],
  transportOption: 'TRAIN' as const,
  localTransportMakkah: 'NONE' as const,
  localTransportMadinah: 'NONE' as const,
  sameGuideForBothCities: true,
  sameGuidePrimaryCity: 'MADINAH' as const,
  travelMarkupBps: 0,
}

test('un guide qui quitte sa ville principale a au moins une nuit', () => {
  const pricing = calculateBookingTransportPrice(baseInput)

  assert.equal(pricing.makkahDays, 1)
  assert.equal(pricing.guideHotelNights, 1)
  assert.equal(pricing.guideHotel, 80)
  assert.equal(pricing.guideHotelNet, 80)
})

test('un lit fourni conserve la nuit requise sans facturer l’hôtel', () => {
  const pricing = calculateBookingTransportPrice({ ...baseInput, guideBedProvided: true })

  assert.equal(pricing.guideHotelNights, 1)
  assert.equal(pricing.guideHotel, 0)
  assert.equal(pricing.guideHotelNet, 0)
})

test('deux guides distincts ne déclenchent pas de nuitée', () => {
  const pricing = calculateBookingTransportPrice({ ...baseInput, sameGuideForBothCities: false })

  assert.equal(pricing.guideHotelNights, 0)
  assert.equal(pricing.guideHotel, 0)
  assert.equal(pricing.guideHotelNet, 0)
})

test('les nuits supplémentaires suivent les jours passés hors ville principale', () => {
  const pricing = calculateBookingTransportPrice({
    ...baseInput,
    selectedPlaces: ['jabal-nour', 'hira', 'jabal-thawr', 'arafat', 'muzdalifah', 'mina', 'hunayn'],
  })

  assert.equal(pricing.makkahDays, 3)
  assert.equal(pricing.guideHotelNights, 2)
  assert.equal(pricing.guideHotel, 160)
})
