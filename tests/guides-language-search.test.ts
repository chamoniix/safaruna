import assert from 'node:assert/strict'
import test from 'node:test'
import { filterMobileLanguageOptions } from '../src/app/guides/page'

const options = [
  { val: 'fr', label: 'Français' },
  { val: 'ar', label: 'Arabe' },
  { val: 'en', label: 'English' },
  { val: 'algerien', label: 'Algérien' },
]

test('affiche seulement trois langues avant la saisie sur mobile', () => {
  assert.deepEqual(filterMobileLanguageOptions(options, '').map(option => option.val), ['fr', 'ar', 'en'])
})

test('filtre les langues à chaque saisie sans dépendre des accents', () => {
  assert.deepEqual(filterMobileLanguageOptions(options, 'alge').map(option => option.val), ['algerien'])
  assert.deepEqual(filterMobileLanguageOptions(options, 'franc').map(option => option.val), ['fr'])
})
