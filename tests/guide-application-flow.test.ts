import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const form = readFileSync('src/app/guide/inscription/page.tsx', 'utf8')
const publicRoute = readFileSync('src/app/api/guide/inscription/route.ts', 'utf8')
const adminRoute = readFileSync('src/app/api/admin/guide-applications/route.ts', 'utf8')
const adminPage = readFileSync('src/app/admin/(dashboard)/candidatures-guides/page.tsx', 'utf8')
const schema = readFileSync('prisma/schema.prisma', 'utf8')
const migration = readFileSync('prisma/migrations/20260903153000_guide_application_details/migration.sql', 'utf8')
const email = readFileSync('src/lib/email.ts', 'utf8')
const guideProfileRoute = readFileSync('src/app/api/guide/profil/route.ts', 'utf8')
const guideLanguagesRoute = readFileSync('src/app/api/guide/profil/languages/route.ts', 'utf8')
const guidePlacesRoute = readFileSync('src/app/api/guide/lieux/route.ts', 'utf8')
const guideCalendarRoute = readFileSync('src/app/api/guide/calendrier/route.ts', 'utf8')
const profileChanges = readFileSync('src/lib/guide-profile-changes.ts', 'utf8')
const adminReviewRoute = readFileSync('src/app/api/admin/guides/[slug]/profile-change/route.ts', 'utf8')
const guideProfilePage = readFileSync('src/app/guide/(dashboard)/profil/page.tsx', 'utf8')
const publicGuideRoute = readFileSync('src/app/api/guide/public/[slug]/route.ts', 'utf8')
const profileChangeMigration = readFileSync('prisma/migrations/20260903165000_guide_profile_change_requests/migration.sql', 'utf8')

test('le formulaire exige les cinq tarifs proposés sans les publier automatiquement', () => {
  for (const field of [
    'proposedOmraPrice',
    'proposedMakkahPackagePrice',
    'proposedMakkahPlacePrice',
    'proposedMadinahPackagePrice',
    'proposedMadinahPlacePrice',
  ]) {
    assert.match(form, new RegExp(field))
    assert.match(publicRoute, new RegExp(`${field}Cents`))
    assert.match(adminRoute, new RegExp(`${field}Cents`))
  }
  assert.match(form, /aucun tarif n&apos;est publié automatiquement/)
  assert.match(adminPage, /Ils ne modifient pas les tarifs du profil public/)
  assert.doesNotMatch(adminRoute, /makkahNetUpTo6Cents:\s*application\.proposed/)
  assert.doesNotMatch(adminRoute, /madinahNetUpTo6Cents:\s*application\.proposed/)
})

test('transport, ville principale et ville secondaire sont réellement transmis et persistés', () => {
  assert.match(form, /Voiture standard — jusqu’à 6 pèlerins/)
  assert.match(form, /id: 'OTHER'/)
  assert.match(form, /transportDetails/)
  assert.match(form, /offersSecondaryCity/)
  assert.match(publicRoute, /city:\s*z\.enum\(\['MAKKAH', 'MADINAH'\]/)
  assert.match(publicRoute, /transportMode:\s+z\.enum\(\['NONE', 'CAR', 'VAN', 'OTHER'\]/)
  assert.match(schema, /transportMode\s+String/)
  assert.match(migration, /ADD COLUMN "transportMode" TEXT NOT NULL/)
})

test('les coordonnées bancaires obligatoires sont chiffrées et masquées pour la liste administrative', () => {
  for (const field of ['bankAccountFirstName', 'bankAccountLastName', 'bankName', 'bankCountry']) {
    assert.match(publicRoute, new RegExp(`${field}: z\\.string`))
    assert.match(schema, new RegExp(`${field}\\s+String`))
  }
  assert.match(publicRoute, /ibanEncrypted: encrypt\(iban\)/)
  assert.match(publicRoute, /bicEncrypted: encrypt\(bic\)/)
  assert.match(adminRoute, /ibanMasked: maskedEncryptedValue\(ibanEncrypted, 4\)/)
  assert.match(adminRoute, /bicMasked: maskedEncryptedValue\(bicEncrypted, 3\)/)
  assert.doesNotMatch(adminPage, /ibanEncrypted/)
  assert.doesNotMatch(adminPage, /bicEncrypted/)
})

test('la candidature est contrôlée par Admin avant toute publication du profil', () => {
  assert.match(publicRoute, /sendWelcomeGuide/)
  assert.match(publicRoute, /GUIDE_APPLICATION_ADMIN_NOTICE/)
  assert.match(adminRoute, /status: 'DRAFT'/)
  assert.match(adminRoute, /GUIDE_APPLICATION_APPROVED/)
  assert.match(adminRoute, /sendGuideAccess/)
  assert.match(adminRoute, /profileActive: false/)
  assert.doesNotMatch(adminRoute, /status: 'ACTIVE'/)
})

test('la validation par étape remplace les erreurs techniques du schéma', () => {
  assert.match(form, /currentStep < STEPS\.length/)
  assert.match(publicRoute, /step: field \? FIELD_STEPS\[field\]/)
  assert.match(publicRoute, /Choisissez le genre du guide/)
  assert.doesNotMatch(form, /currentStep < 6/)
  assert.doesNotMatch(form, /type="file"/)
  assert.doesNotMatch(form, /12% de commission/)
})

test('la charte complète et le parcours annoncé correspondent aux cinq étapes', () => {
  assert.match(form, /Préserver strictement la confidentialité/)
  assert.match(form, /SAFARUMA peut faire évoluer cette Charte/)
  assert.match(form, /href="\/charte-islamique"/)
  assert.match(email, /Publication séparée de votre profil après contrôle/)
})

test('les données publiques soumises par le Guide restent en attente sans modifier le live', () => {
  assert.match(guideProfileRoute, /submitGuideProfileChanges/)
  assert.doesNotMatch(guideProfileRoute, /guideProfile\.update/)
  assert.doesNotMatch(guideProfileRoute, /guideAccount\.update/)
  assert.match(guideLanguagesRoute, /submitGuideProfileChanges/)
  assert.doesNotMatch(guideLanguagesRoute, /guideLanguage\.(create|createMany|delete|deleteMany)/)
  assert.match(profileChanges, /GUIDE_PROFILE_CHANGE_REQUESTED/)
  assert.match(profileChanges, /activeKey: profile\.id/)
  assert.match(profileChangeMigration, /GuideProfileChangeRequest_activeKey_key/)
  assert.match(publicGuideRoute, /status: 'ACTIVE'/)
})

test('Admin ou Superadmin décide avant publication et chaque décision est auditée', () => {
  assert.match(adminReviewRoute, /getAdminActor\(req\)/)
  assert.match(adminReviewRoute, /action === 'APPROVE'/)
  assert.match(adminReviewRoute, /guideAccount\.update/)
  assert.match(adminReviewRoute, /guideProfile\.update/)
  assert.match(adminReviewRoute, /guideLanguage\.deleteMany/)
  assert.match(adminReviewRoute, /GUIDE_PROFILE_CHANGE_APPROVED/)
  assert.match(adminReviewRoute, /GUIDE_PROFILE_CHANGE_REJECTED/)
  assert.match(adminReviewRoute, /ProfileChangedDuringReviewError/)
})

test('seules les disponibilités et les lieux restent modifiables immédiatement par le Guide', () => {
  assert.match(guidePlacesRoute, /guidePlace\.upsert/)
  assert.match(guidePlacesRoute, /GUIDE_PLACE_AVAILABILITY_UPDATED/)
  assert.match(guideCalendarRoute, /guideProfile\.update/)
  assert.match(guideCalendarRoute, /acceptingBookings/)
  assert.match(guideProfilePage, /Le profil public reste inchangé jusqu’à sa validation/)
  assert.match(guideProfilePage, /Envoyer pour validation/)
})

test('les langues de candidature utilisent les codes de la source unique', () => {
  assert.match(form, /GUIDE_LANGUAGES/)
  assert.match(publicRoute, /LANGUAGE_CODES/)
  assert.match(publicRoute, /LANG_CODE_TO_LABEL/)
})
