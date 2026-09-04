import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const schema = readFileSync('prisma/schema.prisma', 'utf8')
const route = readFileSync('src/app/api/espace/dashboard-state/route.ts', 'utf8')
const duaPage = readFileSync('src/app/espace/(dashboard)/dua/page.tsx', 'utf8')
const checklistPage = readFileSync('src/app/espace/(dashboard)/checklist/page.tsx', 'utf8')

test('les préférences Pèlerin sont isolées et rattachées uniquement à son identifiant interne', () => {
  assert.match(schema, /model PelerinDashboardState[\s\S]*userId\s+String\s+@unique/)
  assert.match(schema, /memorizedDuaIds\s+Int\[\]\s+@default\(\[\]\)/)
  assert.match(schema, /completedChecklistItemIds\s+Int\[\]\s+@default\(\[\]\)/)
  assert.match(schema, /customChecklistItems\s+Json\s+@default\("\[\]"\)/)
  assert.match(schema, /@relation\(fields: \[userId\], references: \[id\], onDelete: Cascade\)/)
})

test('l’API authentifie le Pèlerin, valide les opérations et ne prend aucun userId du client', () => {
  assert.match(route, /requirePelerin\(\)/)
  assert.match(route, /where: \{ userId: access\.actor\.id \}/)
  assert.match(route, /z\.discriminatedUnion\('action'/)
  assert.match(route, /\.strict\(\)/)
  assert.doesNotMatch(route, /userId:\s*z\./)
  assert.match(route, /private, no-store, max-age=0/)
  assert.match(route, /TransactionIsolationLevel\.Serializable/)
})

test('les Du’a utilisent l’état serveur et annulent visuellement une écriture refusée', () => {
  assert.match(duaPage, /fetch\('\/api\/espace\/dashboard-state'/)
  assert.match(duaPage, /action: 'SET_DUA'/)
  assert.match(duaPage, /learned: previous/)
  assert.match(duaPage, /role="alert"/)
})

test('la checklist persiste les tâches standard et personnalisées sans entier Date.now', () => {
  assert.match(checklistPage, /action: 'SET_CHECKLIST_ITEM'/)
  assert.match(checklistPage, /action: 'ADD_CUSTOM_CHECKLIST_ITEM'/)
  assert.match(checklistPage, /action: 'SET_CUSTOM_CHECKLIST_ITEM'/)
  assert.match(checklistPage, /crypto\.randomUUID\(\)/)
  assert.doesNotMatch(checklistPage, /Date\.now\(\)/)
  assert.match(checklistPage, /setTasks\(current => current\.filter\(task => task\.id !== id\)\)/)
  assert.match(checklistPage, /role="alert"/)
})
