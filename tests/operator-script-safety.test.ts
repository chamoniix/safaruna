import assert from 'node:assert/strict'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import test from 'node:test'
import ts from 'typescript'

// Static inspection only: never import/execute an operator script or connect to a database.
function unsafeOperations(source: string): string[] {
  const file = ts.createSourceFile('operator.ts', source, ts.ScriptTarget.Latest, true)
  const constants = new Map<string, ts.Expression>()
  const findings = new Set<string>()
  function collect(node: ts.Node) {
    if (ts.isVariableDeclaration(node) && ts.isIdentifier(node.name) && node.initializer) {
      constants.set(node.name.text, node.initializer)
    }
    ts.forEachChild(node, collect)
  }
  collect(file)
  function hasLiteral(node: ts.Node, seen = new Set<string>()): boolean {
    if (ts.isStringLiteralLike(node)) return node.text.length > 0
    if (ts.isIdentifier(node) && !seen.has(node.text)) {
      const value = constants.get(node.text)
      if (value) return hasLiteral(value, new Set([...seen, node.text]))
    }
    // Env property names are not credentials. Fallback string values are.
    if (ts.isPropertyAccessExpression(node) || ts.isElementAccessExpression(node)) return false
    return ts.forEachChild(node, child => hasLiteral(child, seen) || undefined) === true
  }
  function inspect(node: ts.Node) {
    if ((ts.isVariableDeclaration(node) || ts.isPropertyAssignment(node)) && node.initializer) {
      const name = node.name.getText(file).replace(/['"]/g, '')
      if (/password|secret|token/i.test(name) && hasLiteral(node.initializer)) {
        findings.add('Hardcoded credential in operator script')
      }
    }
    if (ts.isCallExpression(node)) {
      const call = node.expression.getText(file)
      if (/(?:^|\.)(?:hash|hashSync)$/.test(call) && node.arguments[0] && hasLiteral(node.arguments[0])) {
        findings.add('Hardcoded password passed to hashing function')
      }
      if (/\.(?:guideAccount|guideProfile)\.(?:create|createMany|upsert|update|updateMany)$/.test(call)) {
        findings.add('Direct Guide write bypassing the reviewed application workflow')
      }
    }
    ts.forEachChild(node, inspect)
  }
  inspect(file)
  return [...findings]
}

function scriptFiles(directory: string): string[] {
  return readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? scriptFiles(path) : /\.[cm]?[jt]s$/.test(path) ? [path] : []
  })
}

test('operator scripts cannot restore the legacy password setter or bypass Guide approval', () => {
  assert.equal(existsSync('scripts/set-guide-password.ts'), false)
  for (const path of scriptFiles('scripts')) {
    assert.deepEqual(unsafeOperations(readFileSync(path, 'utf8')), [], path)
  }
})

test('guard detects fixed passwords, aliases, fallbacks and direct Guide creation', () => {
  for (const source of [
    'const password = "fixture-only"',
    'const value = "fixture-only"; bcrypt.hash(value, 12)',
    'const one = "fixture-only"; const two = one; hashSync(two, 12)',
    'const password = process.env.TEST_PASSWORD || "fixture-only"',
    'const data = { passwordHash: "fixture-only" }',
    'prisma.guideAccount.upsert({})',
    'prisma.guideProfile.create({})',
  ]) assert.ok(unsafeOperations(source).length > 0, 'Unsafe fixture must fail')
})

test('guard accepts environment credentials and read-only Guide checks', () => {
  assert.deepEqual(unsafeOperations(`
    const password = process.env.ADMIN_ACCOUNT_PASSWORD
    const hash = await bcrypt.hash(password, 12)
    prisma.adminAccount.upsert({ create: { passwordHash: hash, status: 'ACTIVE' } })
    prisma.guideProfile.findMany({})
  `), [])
})
