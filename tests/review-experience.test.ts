import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const form = readFileSync('src/app/avis/deposer/MemberReviewForm.tsx', 'utf8')
const reviewPage = readFileSync('src/app/avis/deposer/page.tsx', 'utf8')
const cookieBanner = readFileSync('src/components/CookieBanner.tsx', 'utf8')
const registration = readFileSync('src/app/inscription/page.tsx', 'utf8')
const navbar = readFileSync('src/components/Navbar.tsx', 'utf8')
const dashboardLayout = readFileSync('src/app/espace/(dashboard)/layout.tsx', 'utf8')
const dashboardReviews = readFileSync('src/app/espace/(dashboard)/avis/page.tsx', 'utf8')
const dashboardReviewsApi = readFileSync('src/app/api/espace/my-reviews/route.ts', 'utf8')

test('un avis envoyé remplace le formulaire par une confirmation et un retour au dashboard', () => {
  assert.match(form, /if \(success\)/)
  assert.match(form, /Barakallahou fik/)
  assert.match(form, /بارك الله فيك/)
  assert.match(form, /En attente de validation/)
  assert.match(form, /href="\/espace\/tableau-de-bord"/)
  assert.match(form, /Retour à mon espace/)
})

test('la confirmation présente les trois services demandés sans fausse action commerciale', () => {
  assert.match(form, /Votre checklist Omra est prête/)
  assert.match(form, /Achetez votre équipement à l’avance/)
  assert.match(form, /Un accompagnement adapté à chacun/)
  assert.match(form, /\/parcours\/preparation-conseils\.jpg/)
  assert.match(form, /\/images\/guide-omra\/ihram\.jpg/)
  assert.match(form, /\/why-safaruma\/assistance-pmr\.jpg/)
  assert.doesNotMatch(form, /Acheter maintenant|Commander maintenant/)
})

test('la page de dépôt garde le logo vers la home sans déconnecter le compte', () => {
  assert.match(reviewPage, /className="member-review-brand" href="\/"/)
  assert.doesNotMatch(form, /signOut/)
  assert.match(navbar, /status === 'loading'/)
})

test('le bandeau cookies est masqué sur le dépôt d’avis et l’inscription Guide', () => {
  assert.match(cookieBanner, /usePathname/)
  assert.match(cookieBanner, /pathname === '\/avis\/deposer'/)
  assert.match(cookieBanner, /pathname\.startsWith\('\/guide\/inscription'\)/)
})

test('le verset sans rapport est absent du formulaire d’inscription', () => {
  assert.doesNotMatch(registration, /Coran 17:34|remplissez l&apos;engagement/)
})

test('Mes avis utilise uniquement les avis appartenant au pèlerin authentifié', () => {
  assert.match(dashboardReviewsApi, /requirePelerin\(\)/)
  assert.match(dashboardReviewsApi, /experienceReview\.findMany[\s\S]*where: \{ userId: access\.actor\.id \}/)
  assert.match(dashboardReviewsApi, /review\.findMany[\s\S]*where: \{ pelerinId: access\.actor\.id \}/)
  assert.doesNotMatch(dashboardReviewsApi, /moderationNote|moderatedByEmail|moderatedByAdminId/)
})

test('le dashboard regroupe les trois labels réels et respecte le verrou de modération', () => {
  assert.match(dashboardLayout, /href: '\/espace\/avis'[\s\S]*label: 'Mes avis'/)
  assert.match(dashboardReviews, /Avis membre/)
  assert.match(dashboardReviews, /Avis vérifié/)
  assert.match(dashboardReviews, /Avis Guide/)
  assert.match(dashboardReviewsApi, /guideReviews\.every\(review => review\.status === 'PENDING'\)/)
  assert.match(dashboardReviews, /group\.editable \? 'Modifier mes avis' : 'Voir mes avis'/)
  assert.match(dashboardReviews, /Vous n’avez pas encore laissé d’avis/)
})
