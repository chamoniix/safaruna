import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

test('public guide content can shrink so tabs and review carousels scroll inside the column', () => {
  const source = readFileSync('src/app/guides/[slug]/GuideProfileClient.tsx', 'utf8')
  const contentRule = source.match(/\.profile-main-grid > div:first-child\s*\{([^}]+)\}/)?.[1]
  assert.ok(contentRule)
  assert.match(contentRule, /min-width:\s*0\s*;/)
  assert.match(source, /\.profile-tabs-bar\s*\{[^}]*overflow-x:\s*auto/)
})

test('application contact grid wraps long values and never requires a column wider than its container', () => {
  const source = readFileSync('src/app/admin/(dashboard)/candidatures-guides/page.tsx', 'utf8')
  const start = source.lastIndexOf('<div style=', source.indexOf('<div><b>Email</b>'))
  const grid = source.slice(start, source.indexOf('<div><b>Email</b>'))
  assert.match(grid, /minmax\(min\(210px,100%\),1fr\)/)
  assert.match(grid, /overflowWrap:\s*'anywhere'/)
})
