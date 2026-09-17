import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import test from 'node:test'
import vm from 'node:vm'
import ts from 'typescript'
import { createElement, type ComponentType } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import type { readReservationGuideTransfers } from '../src/lib/guide-transfers'

type Item = Awaited<ReturnType<typeof readReservationGuideTransfers>>['items'][number]
const require = createRequire(import.meta.url)
const loadedModule = { exports: {} }
// Test-only export: exercise the actual rendered item without exposing another
// application entry point or mounting with production credentials.
vm.runInNewContext(ts.transpileModule(`${readFileSync('src/components/admin/GuideTransferPanel.tsx', 'utf8')}\nexport { TransferItem }`, {
  compilerOptions: { target: ts.ScriptTarget.ES2020, module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true },
}).outputText, { module: loadedModule, exports: loadedModule.exports, Date,
  require: (name: string) => name.endsWith('.module.css') ? {} : require(name) })
const { TransferItem } = loadedModule.exports as { TransferItem: ComponentType<{ item: Item; busy: boolean; send: () => Promise<void> }> }

function item(): Item {
  return { earningId: 'earning', guideProfileId: 'guide', guideName: 'Test Guide', amountCents: 15000,
    record: null, blockedReason: null, reviewRequired: false, canConfirm: false, canCorrect: false, email: null,
    preparation: { earningId: 'earning', guideProfileId: 'guide', refNumber: 'TEST', amountCents: 15000,
      currency: 'EUR', dueAt: '2026-01-07T00:00:00Z', sourceRevision: 'a'.repeat(64),
      accountHolder: 'Test Guide', bankName: 'Bank', ibanLast4: '1234' },
  }
}

function pending(): Item {
  return { ...item(), preparation: null,
    record: { id: 'transfer', earningId: 'earning', guideProfileId: 'guide', amountCents: 15000, currency: 'EUR',
      bankReference: 'BANK-TEST', sentAt: '2026-01-08T00:00:00Z', dueAt: '2026-01-07T00:00:00Z',
      status: 'PENDING', preparedByEmail: 'admin@example.test', confirmedByEmail: null, confirmedAt: null, revision: 0 },
  }
}

const render = (value: Item) => renderToStaticMarkup(createElement(TransferItem, { item: value, busy: false, send: async () => {} }))

test('eligible item renders real net, masked bank and administrative reference/date form', () => {
  const html = render(item())
  assert.match(html, /Test Guide/); assert.match(html, /150,00/); assert.match(html, /1234/)
  assert.match(html, /<form/); assert.match(html, /datetime-local/); assert.match(html, /Vérifier le récapitulatif/)
  assert.doesNotMatch(html, /Modifier le montant|Vérifier et confirmer/)
})

test('pending Admin view has no confirmation, correction or second preparation', () => {
  const html = render(pending())
  assert.match(html, /BANK-TEST/); assert.match(html, /admin@example.test/)
  assert.doesNotMatch(html, /<form|Vérifier et confirmer|Corriger la référence/)
})

test('pending Superadmin view provides explicit review and metadata correction only', () => {
  const html = render({ ...pending(), canConfirm: true, canCorrect: true })
  assert.match(html, /Vérifier et confirmer/); assert.match(html, /Corriger la référence ou la date/)
  assert.doesNotMatch(html, /Supprimer|<form/)
})

test('obsolete preparation stays visible without mutation controls', () => {
  const html = render({ ...pending(), reviewRequired: true, blockedReason: 'Coordonnées modifiées.' })
  assert.match(html, /Vérification Superadmin nécessaire/); assert.match(html, /BANK-TEST/)
  assert.match(html, /enregistrement original est conservé/)
  assert.doesNotMatch(html, /<form|<button/)
})

test('future due date and unavailable bank do not render preparation form', () => {
  const value = item(); value.preparation!.dueAt = '2100-01-01T00:00:00Z'
  assert.doesNotMatch(render(value), /<form/); assert.match(render(value), /Échéance non atteinte/)
  assert.doesNotMatch(render({ ...item(), preparation: null, blockedReason: 'Banque non vérifiée.' }), /<form/)
})

test('confirmed transfer is labelled sent, not received, without repeat confirmation', () => {
  const value = pending(); value.record!.status = 'PAID'; value.record!.confirmedAt = '2026-01-08T00:00:00Z'
  value.record!.confirmedByEmail = 'owner@example.test'; value.canCorrect = true
  const html = render(value)
  assert.match(html, /Virement envoyé/); assert.match(html, /owner@example.test/)
  assert.doesNotMatch(html, /Virement reçu|Vérifier et confirmer/)
})
