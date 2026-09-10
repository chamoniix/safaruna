import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ApplicationMediaPanel from '../src/components/guide/ApplicationMediaPanel'
import { applicationMediaView, type ApplicationMediaRecord } from '../src/lib/guide-application-media'

const form = readFileSync('src/app/guide/inscription/page.tsx', 'utf8')
const panel = readFileSync('src/components/guide/ApplicationMediaPanel.tsx', 'utf8')

test('inscription: validates photos and vehicle before final upload, locks submission and renews receipts', () => {
  assert.match(form, /if \(!photos\.profile\) return 'Ajoutez votre photo de profil\.'/)
  assert.match(form, /const MAX_PHOTO_BYTES = 4_000_000/)
  assert.match(form, /applicationMediaSchema\.safeParse/)
  assert.match(form, /setVehiclePassengerSeats\(event\.target\.value\); setVehicleSeatsConfirmed\(false\)/)
  assert.match(form, /<fieldset disabled=\{submitting\}/)
  assert.match(form, /if \(submissionInFlight\.current\) return/)
  assert.match(form, /for \(let step = 1; step < STEPS\.length; step\+\+\)/)
  const submit = form.slice(form.indexOf('const handleSubmit'), form.indexOf('if (isSubmitted)'))
  assert.match(submit, /const receipts: Partial<Record<ApplicationPhotoKind, string>> = \{\}/)
  assert.match(submit, /for \(const \[index, kind\] of filesToSend\.entries\(\)\)/)
  assert.ok(submit.indexOf('/api/guide/inscription/photos') < submit.indexOf("fetch('/api/guide/inscription',"))
  assert.match(submit, /'x-guide-email': encodeURIComponent\(guideEmail\.trim\(\)\.toLowerCase\(\)\)/)
  assert.match(submit, /body: file/)
  assert.match(form, /role="status" aria-live="polite"/)
  assert.doesNotMatch(form, /localStorage|sessionStorage|createObjectURL|profilePhotoPath/)
})

test('private media panel displays persisted data without Blob paths or edit controls', () => {
  const record: ApplicationMediaRecord = {
    id: 'application-test', profilePhotoPath: 'private/profile.jpeg', hasPersonalVehicle: true,
    vehicleModel: 'Test vehicle', vehicleYear: 2020, vehiclePassengerSeats: 4, vehicleColor: 'Blanc', vehicleSeatsConfirmed: true,
    vehicleDashboardPhotoPath: 'private/dashboard.jpeg', vehicleSeatsPhotoPath: null, vehicleExteriorPhotoPath: null,
  }
  const html = renderToStaticMarkup(createElement(ApplicationMediaPanel, { data: applicationMediaView(record) }))
  assert.match(html, /Test vehicle/)
  assert.match(html, /Places, hors conducteur/)
  assert.match(html, /\/api\/guide-applications\/application-test\/photos\/profile/)
  assert.match(html, /\?download=1/)
  assert.match(html, /Non renseigné/)
  assert.doesNotMatch(html, /private\/|blob\.vercel|<button|<input/)
  assert.doesNotMatch(panel, /from 'next\/image'/)
  assert.match(panel, /onError=/)
})

test('private media panel preserves empty historical applications without invented photos or vehicle', () => {
  const html = renderToStaticMarkup(createElement(ApplicationMediaPanel, { data: null }))
  assert.match(html, /Aucune photo ni information/)
  assert.doesNotMatch(html, /<img|<input|<button/)
})
