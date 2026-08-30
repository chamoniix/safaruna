import assert from 'node:assert/strict'
import test from 'node:test'
import { confirmationDeadlines, publicReviewerName, reviewOpensAt } from '../src/lib/guide-workflow'

test('confirmation standard: rappel 6h et escalade 24h', () => {
  const requestedAt = new Date('2026-09-01T08:00:00.000Z')
  const departureAt = new Date('2026-09-05T08:00:00.000Z')
  const deadlines = confirmationDeadlines(requestedAt, departureAt)
  assert.equal(deadlines.urgent, false)
  assert.equal(deadlines.reminderAt.toISOString(), '2026-09-01T14:00:00.000Z')
  assert.equal(deadlines.escalationAt.toISOString(), '2026-09-02T08:00:00.000Z')
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
