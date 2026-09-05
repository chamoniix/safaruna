import assert from 'node:assert/strict'
import test from 'node:test'
import { confirmationDeadlines, missionDurationDays, publicReviewerName, reviewOpensAt } from '../src/lib/guide-workflow'

test('la durée affichée utilise les journées inclusives des missions, sans les jours libres du séjour', () => {
  const mission = (start: string, end: string) => ({ startDate: new Date(start), endDate: new Date(end) })
  assert.equal(missionDurationDays([mission('2026-09-16T12:00:00Z', '2026-09-16T12:00:00Z')]), 1)
  assert.equal(missionDurationDays([
    mission('2026-09-16T12:00:00Z', '2026-09-17T12:00:00Z'),
    mission('2026-09-20T12:00:00Z', '2026-09-22T12:00:00Z'),
  ]), 5)
  assert.equal(missionDurationDays([mission('2026-10-31T12:00:00Z', '2026-11-01T12:00:00Z')]), 2)
  assert.equal(missionDurationDays([]), null)
  assert.equal(missionDurationDays([mission('2026-09-17', '2026-09-16')]), null)
  assert.equal(missionDurationDays([mission('invalid', '2026-09-16')]), null)
})

test('confirmation standard: rappel 6h et suspension 48h', () => {
  const requestedAt = new Date('2026-09-01T08:00:00.000Z')
  const departureAt = new Date('2026-09-05T08:00:00.000Z')
  const deadlines = confirmationDeadlines(requestedAt, departureAt)
  assert.equal(deadlines.urgent, false)
  assert.equal(deadlines.reminderAt.toISOString(), '2026-09-01T14:00:00.000Z')
  assert.equal(deadlines.escalationAt.toISOString(), '2026-09-03T08:00:00.000Z')
})

test('confirmation urgente: rappel 1h et escalade 3h', () => {
  const requestedAt = new Date('2026-09-01T08:00:00.000Z')
  const departureAt = new Date('2026-09-02T08:00:00.000Z')
  const deadlines = confirmationDeadlines(requestedAt, departureAt)
  assert.equal(deadlines.urgent, true)
  assert.equal(deadlines.reminderAt.toISOString(), '2026-09-01T09:00:00.000Z')
  assert.equal(deadlines.escalationAt.toISOString(), '2026-09-01T11:00:00.000Z')
})

test('formulaire avis ouvre à 20h en Arabie saoudite', () => {
  assert.equal(reviewOpensAt(new Date('2026-09-07T00:00:00.000Z')).toISOString(), '2026-09-07T17:00:00.000Z')
})

test('nom public: prénom et initiale du nom', () => {
  assert.equal(publicReviewerName('Amina', 'Benali'), 'Amina B.')
  assert.equal(publicReviewerName('Amina', null), 'Amina')
})
