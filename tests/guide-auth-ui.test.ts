import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const login = readFileSync('src/app/guide/connexion/page.tsx', 'utf8')
const forgotPassword = readFileSync('src/app/guide/mot-de-passe-oublie/page.tsx', 'utf8')
const resetPassword = readFileSync('src/app/guide/reinitialiser-mot-de-passe/page.tsx', 'utf8')

test('la connexion Guide conserve son chargement pendant la redirection réussie', () => {
  assert.match(login, /router\.push\('\/guide\/tableau-de-bord'\)/)
  assert.match(login, /router\.refresh\(\);\s+return;/)
  assert.doesNotMatch(login, /finally\s*{\s*setLoading\(false\)/)
  assert.match(login, /Connexion en cours…/)
  assert.match(login, /aria-busy={loading}/)
})

test('le formulaire de mot de passe oublié expose ses états et ses libellés', () => {
  assert.match(forgotPassword, /htmlFor="guide-forgot-email"/)
  assert.match(forgotPassword, /Envoi en cours…/)
  assert.match(forgotPassword, /role="status"/)
  assert.match(forgotPassword, /role="alert"/)
  assert.match(forgotPassword, /Retour à la connexion/)
})

test('la réinitialisation Guide affiche le logo, les libellés et un succès lisible', () => {
  assert.match(resetPassword, /Retour à l’accueil SAFARUMA/)
  assert.match(resetPassword, /htmlFor="guide-reset-password"/)
  assert.match(resetPassword, /htmlFor="guide-reset-confirmation"/)
  assert.match(resetPassword, /Modification en cours…/)
  assert.match(resetPassword, /Toutes les anciennes sessions ont été fermées/)
  assert.match(resetPassword, /Se connecter →/)
  assert.match(resetPassword, /Ce lien est invalide/)
})
