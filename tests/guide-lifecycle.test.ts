import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync('prisma/migrations/20260903180000_guide_onboarding_incidents/migration.sql', 'utf8')
const applicationReview = readFileSync('src/app/api/admin/guide-applications/route.ts', 'utf8')
const manualGuideRoute = readFileSync('src/app/api/admin/guides/route.ts', 'utf8')
const activationRoute = readFileSync('src/app/api/admin/guides/[slug]/activate/route.ts', 'utf8')
const profileSubmitRoute = readFileSync('src/app/api/guide/profil/submit/route.ts', 'utf8')
const declineRoute = readFileSync('src/app/api/guide/reservations/[id]/decline/route.ts', 'utf8')
const confirmationRoute = readFileSync('src/app/api/guide/reservations/[id]/confirm/route.ts', 'utf8')
const incidentRoute = readFileSync('src/app/api/admin/guides/[slug]/incidents/route.ts', 'utf8')
const incidentService = readFileSync('src/lib/guide-reservation-incidents.ts', 'utf8')
const cron = readFileSync('src/app/api/cron/notifications/route.ts', 'utf8')
const email = readFileSync('src/lib/email.ts', 'utf8')
const guideConditions = readFileSync('src/app/conditions-guides/page.tsx', 'utf8')
const publicGuideRoute = readFileSync('src/app/api/guide/public/[slug]/route.ts', 'utf8')
const notificationWorkflow = readFileSync('.github/workflows/hourly-notifications.yml', 'utf8')

test('l’accès initial est choisi par le Guide via un lien personnel de 48 heures', () => {
  assert.match(applicationReview, /48 \* 60 \* 60 \* 1000/)
  assert.match(manualGuideRoute, /48 \* 60 \* 60 \* 1000/)
  assert.match(email, /expire dans <strong>48 heures<\/strong>/)
  assert.doesNotMatch(applicationReview, /temporaryPassword|mot de passe provisoire/i)
})

test('un nouveau profil reste hors ligne jusqu’à la double validation Guide puis Admin', () => {
  assert.match(applicationReview, /status: 'DRAFT'/)
  assert.doesNotMatch(applicationReview, /approvedAt: now/)
  assert.match(manualGuideRoute, /status: 'DRAFT'/)
  assert.match(profileSubmitRoute, /profile\.status !== 'DRAFT'/)
  assert.match(profileSubmitRoute, /status: 'REVIEW', profileSubmittedAt: submittedAt/)
  assert.match(profileSubmitRoute, /GUIDE_PROFILE_SUBMITTED_FOR_REVIEW/)
  assert.match(activationRoute, /guide\.status === 'DRAFT'/)
  assert.match(activationRoute, /changeRequests\.length > 0/)
  assert.match(activationRoute, /sendGuideProfileActivated/)
  assert.match(activationRoute, /approvedAt: new Date\(\)/)
  assert.match(activationRoute, /missingRequiredGuideProfileFields/)
  assert.match(publicGuideRoute, /status: 'ACTIVE'/)
})

test('le refus Guide exige un motif et suspend sans remboursement automatique', () => {
  assert.match(declineRoute, /min\(10/)
  assert.match(declineRoute, /suspendGuideForReservationIncident/)
  assert.match(declineRoute, /Aucun remboursement automatique n’a été déclenché/)
  assert.match(incidentService, /data: \{ status: 'SUSPENDED', acceptingBookings: false \}/)
  assert.match(incidentService, /data: \{ status: 'SUSPENDED' \}/)
  assert.match(incidentService, /data: \{ revokedAt: input\.occurredAt \}/)
  assert.doesNotMatch(declineRoute, /refund|rembourser/i)
})

test('l’absence de réponse applique 3 heures en urgence et 48 heures sinon', () => {
  assert.match(cron, /urgent de 3 heures/)
  assert.match(cron, /normal de 48 heures/)
  assert.match(cron, /type: 'NO_RESPONSE'/)
  assert.match(cron, /Aucun remboursement automatique n’a été déclenché/)
  assert.match(confirmationRoute, /now >= deadlines\.escalationAt/)
  assert.match(confirmationRoute, /suspendGuideForReservationIncident/)
  assert.match(notificationWorkflow, /2,17,32,47 \* \* \* \*/)
})

test('seul Admin décide si un incident est comptabilisé et le troisième est définitif', () => {
  assert.match(incidentRoute, /z\.enum\(\['COUNT', 'EXCUSE'\]\)/)
  assert.match(incidentRoute, /cancellationCount \+ 1/)
  assert.match(incidentRoute, /cancellationCount >= 3/)
  assert.match(incidentRoute, /GUIDE_RESERVATION_INCIDENT_COUNTED/)
  assert.match(incidentRoute, /GUIDE_RESERVATION_INCIDENT_EXCUSED/)
  assert.match(activationRoute, /permanentlyDeactivatedAt/)
})

test('la base conserve un incident unique par réservation et Guide', () => {
  assert.match(schema, /model GuideReservationIncident/)
  assert.match(schema, /@@unique\(\[reservationId, guideProfileId\]\)/)
  assert.match(schema, /cancellationCount\s+Int\s+@default\(0\)/)
  assert.match(schema, /permanentlyDeactivatedAt\s+DateTime\?/)
  assert.match(migration, /GuideReservationIncident_reservationId_guideProfileId_key/)
})

test('les conditions Guide excluent les pénalités financières et documentent les délais', () => {
  assert.match(guideConditions, /Aucune pénalité financière/)
  assert.match(guideConditions, /réservation normale doit être confirmée sous <strong>48 heures<\/strong>/)
  assert.match(guideConditions, /doit être confirmée sous <strong>3 heures<\/strong>/)
  assert.match(guideConditions, /troisième annulation ou absence de réponse comptabilisée/)
  assert.doesNotMatch(guideConditions, /50\s*€|100\s*€|150\s*€|200\s*€/)
})
