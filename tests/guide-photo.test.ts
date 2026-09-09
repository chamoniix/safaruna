import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'
import sharp from 'sharp'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import ts from 'typescript'
import { createGuidePhotoHandlers, GuidePhotoError, MAX_GUIDE_PHOTO_BYTES, photoState, readPhotoBody, validateGuidePhoto, type PhotoActor, type PhotoGuide } from '../src/lib/guide-photo'

const superadmin: PhotoActor = { id: 'superadmin-test', email: 'test@example.invalid', role: 'SUPERADMIN' }
const original: PhotoGuide = { id: 'guide-test', slug: 'naim-laamari', guideAccount: {
  id: 'account-test', image: null, updatedAt: new Date('2026-09-08T00:00:00Z'),
} }
const png = () => sharp({ create: { width: 20, height: 30, channels: 3, background: '#aa8833' } }).png().toBuffer()

function fixture() {
  let record = structuredClone(original)
  let actor: PhotoActor | null = superadmin
  let uploadError = false
  let publishError = false
  let revokeAfterUpload = false
  const calls = { finds: 0, uploads: 0, publishes: 0, audits: 0, reports: 0, bytes: Buffer.alloc(0) as Buffer }
  const handlers = createGuidePhotoHandlers({
    getActor: async () => actor,
    findGuide: async () => { calls.finds++; return structuredClone(record) },
    limit: async () => null,
    upload: async (_path, bytes) => {
      calls.uploads++
      calls.bytes = bytes
      if (uploadError) throw new Error('storage unavailable')
      if (revokeAfterUpload) actor = null
      return { url: `https://test.public.blob.vercel-storage.com/guide-photos/image-${calls.uploads}.png` }
    },
    publish: async ({ guide, url }) => {
      calls.publishes++
      if (publishError) throw new Error('transaction rollback')
      if (guide.guideAccount!.updatedAt.getTime() !== record.guideAccount!.updatedAt.getTime()) {
        throw new GuidePhotoError('Concurrent modification', 409)
      }
      record.guideAccount!.image = url
      record.guideAccount!.updatedAt = new Date(record.guideAccount!.updatedAt.getTime() + 1)
      calls.audits++
      return structuredClone(record)
    },
    report: () => { calls.reports++ },
  })
  return { handlers, calls, get record() { return record },
    setActor(value: PhotoActor | null) { actor = value },
    failUpload() { uploadError = true }, failPublish() { publishError = true }, revoke() { revokeAfterUpload = true },
    unlinkAccount() { record = { ...record, guideAccount: null } },
  }
}

async function request(overrides: Record<string, string> = {}) {
  return new Request('https://safaruma.com/api/admin/guides/naim-laamari/photo', {
    method: 'POST', headers: { origin: 'https://safaruma.com', 'content-type': 'image/png',
      'if-match': photoState(original, superadmin).version, ...overrides }, body: new Uint8Array(await png()),
  })
}

test('photo state uses the existing public fallback and permissions', () => {
  assert.equal(photoState(original, superadmin).image, '/images/landing/guide-naim-laamari.jpg')
  assert.equal(photoState({ ...original, slug: 'other' }, superadmin).image, null)
  assert.equal(photoState(original, { ...superadmin, role: 'ADMIN' }).canPublish, false)
  const updated = structuredClone(original)
  updated.guideAccount!.image = 'https://example.invalid/new.jpg'
  assert.equal(photoState(updated, superadmin).image, updated.guideAccount!.image)
  assert.notEqual(photoState(updated, superadmin).version, photoState(original, superadmin).version)
})

test('GET is private, admin-readable, and denies anonymous requests before reading the guide', async () => {
  const f = fixture()
  f.setActor(null)
  const req = new Request('https://safaruma.com/api/admin/guides/naim-laamari/photo')
  assert.equal((await f.handlers.GET(req, 'naim-laamari')).status, 401)
  assert.equal(f.calls.finds, 0)
  f.setActor({ ...superadmin, role: 'ADMIN' })
  const response = await f.handlers.GET(req, 'naim-laamari')
  assert.equal(response.headers.get('cache-control'), 'private, no-store')
  assert.equal((await response.json()).canPublish, false)
})

test('POST rejects anonymous and Admin before upload or database lookup', async () => {
  for (const actor of [null, { ...superadmin, role: 'ADMIN' as const }]) {
    const f = fixture(); f.setActor(actor)
    const response = await f.handlers.POST(await request(), 'naim-laamari')
    assert.equal(response.status, actor ? 403 : 401)
    assert.equal(f.calls.finds, 0); assert.equal(f.calls.uploads, 0)
  }
})

test('POST rejects missing and hostile origins and cross-site requests', async () => {
  const cases: Record<string, string>[] = [{ origin: 'https://attacker.invalid' }, { origin: 'null' }, { 'sec-fetch-site': 'cross-site' }]
  for (const headers of cases) {
    const f = fixture()
    assert.equal((await f.handlers.POST(await request(headers), 'naim-laamari')).status, 403)
    assert.equal(f.calls.uploads, 0)
  }
  const req = await request(); req.headers.delete('origin')
  assert.equal((await fixture().handlers.POST(req, 'naim-laamari')).status, 403)
})

test('POST rejects a stale/missing version and accounts not linked to a guide', async () => {
  const f = fixture()
  assert.equal((await f.handlers.POST(await request({ 'if-match': 'stale' }), 'naim-laamari')).status, 409)
  const req = await request(); req.headers.delete('if-match')
  assert.equal((await f.handlers.POST(req, 'naim-laamari')).status, 428)
  f.unlinkAccount()
  assert.equal((await f.handlers.POST(await request(), 'naim-laamari')).status, 409)
  assert.equal(f.calls.uploads, 0)
})

test('POST validates the MIME and real file before upload', async () => {
  const f = fixture()
  assert.equal((await f.handlers.POST(await request({ 'content-type': 'image/svg+xml' }), 'naim-laamari')).status, 415)
  assert.equal((await f.handlers.POST(await request({ 'content-type': 'image/jpeg' }), 'naim-laamari')).status, 400)
  const valid = await request()
  const corrupt = new Request(valid.url, { method: 'POST', headers: valid.headers, body: '<script>alert(1)</script>' })
  assert.equal((await f.handlers.POST(corrupt, 'naim-laamari')).status, 400)
  assert.equal(f.calls.uploads, 0)
})

test('bounded body reading rejects oversized files even without Content-Length', async () => {
  const cases: Record<string, string>[] = [{}, { 'content-length': '1' }]
  for (const headers of cases) {
    const oversized = new Request('https://safaruma.com', { method: 'POST', headers, body: new Uint8Array(MAX_GUIDE_PHOTO_BYTES + 1) })
    await assert.rejects(readPhotoBody(oversized), (e: unknown) => e instanceof GuidePhotoError && e.status === 413)
  }
  const empty = new Request('https://safaruma.com', { method: 'POST', body: '' })
  await assert.rejects(readPhotoBody(empty), /vide/)
})

test('JPEG PNG WebP are decoded without modifying the uploaded bytes', async () => {
  for (const format of ['jpeg', 'png', 'webp'] as const) {
    const bytes = await sharp(await png()).toFormat(format).toBuffer()
    const meta = await validateGuidePhoto(bytes, `image/${format}`)
    assert.equal(meta.format, format); assert.equal(meta.width, 20); assert.equal(meta.height, 30)
  }
  const f = fixture()
  const response = await f.handlers.POST(await request(), 'naim-laamari')
  assert.equal(response.status, 200)
  assert.deepEqual(f.calls.bytes, await png())
  assert.equal(f.calls.audits, 1)
  assert.equal((await response.json()).image, f.record.guideAccount!.image)
})

test('oversized dimensions and truncated photos are rejected', async () => {
  const tooWide = await sharp({ create: { width: 12001, height: 1, channels: 3, background: '#000' } }).png().toBuffer()
  await assert.rejects(validateGuidePhoto(tooWide, 'image/png'), /Photo invalide/)
  const bytes = await png()
  await assert.rejects(validateGuidePhoto(bytes.subarray(0, Math.floor(bytes.length / 2)), 'image/png'), /Photo invalide/)
})

test('upload and transaction failures preserve the old reference and do not report success', async () => {
  for (const failure of ['upload', 'publish']) {
    const f = fixture()
    if (failure === 'upload') f.failUpload(); else f.failPublish()
    assert.equal((await f.handlers.POST(await request(), 'naim-laamari')).status, 500)
    assert.equal(f.record.guideAccount!.image, null); assert.equal(f.calls.audits, 0)
  }
})

test('revocation during upload prevents publication', async () => {
  const f = fixture(); f.revoke()
  assert.equal((await f.handlers.POST(await request(), 'naim-laamari')).status, 403)
  assert.equal(f.calls.publishes, 0); assert.equal(f.record.guideAccount!.image, null)
})

test('retry after success is rejected before a second upload', async () => {
  const f = fixture()
  assert.equal((await f.handlers.POST(await request(), 'naim-laamari')).status, 200)
  assert.equal((await f.handlers.POST(await request(), 'naim-laamari')).status, 409)
  assert.equal(f.calls.uploads, 1); assert.equal(f.calls.audits, 1)
})

test('concurrent publications only commit one new reference', async () => {
  const f = fixture()
  const results = await Promise.all([
    f.handlers.POST(await request(), 'naim-laamari'),
    f.handlers.POST(await request(), 'naim-laamari'),
  ])
  assert.deepEqual(results.map(r => r.status).sort(), [200, 409])
  assert.equal(f.calls.audits, 1)
})

test('production adapter uses atomic versioned update and audit, OIDC, and targeted cache invalidation', () => {
  const route = readFileSync('src/app/api/admin/guides/[slug]/photo/route.ts', 'utf8')
  assert.match(route, /prisma\.\$transaction/)
  assert.match(route, /where: \{ id: account.id, image: account.image, updatedAt: account.updatedAt \}/)
  assert.match(route, /tx.auditLog.create/)
  assert.match(route, /GUIDE_PHOTO_PUBLISHED/)
  assert.match(route, /before: \{ image: account.image \}, after: \{ image: url \}/)
  assert.match(route, /revalidatePath\(`\/guides\/\$\{updated.slug\}`\)/)
  assert.doesNotMatch(route, /BLOB_READ_WRITE_TOKEN|deleteMany|\.delete\(/)
  const ui = readFileSync('src/components/admin/GuidePhotoEditor.tsx', 'utf8')
  assert.match(ui, /photo\?\.canPublish/)
  assert.match(ui, /inFlight.current/)
  assert.match(ui, /'If-Match': photo.version/)
  assert.match(ui, /FileReader/)
  assert.match(ui, /Publier cette photo/)
  assert.doesNotMatch(readFileSync('src/app/admin/(dashboard)/guides/[slug]/page.tsx', 'utf8'), /fonctionnalité R2 à venir/)
})

test('search avatars display the approved photo for Naim and other guides, with existing fallbacks', () => {
  // Execute the actual component without mounting the search page or calling its APIs.
  const source = readFileSync('src/app/guides/page.tsx', 'utf8')
  const ast = ts.createSourceFile('page.tsx', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX)
  const declaration = ast.statements.find(statement => ts.isFunctionDeclaration(statement) && statement.name?.text === 'GuideAvatarSVG')
  assert.ok(declaration)
  const compiled = ts.transpileModule(declaration.getText(ast), { compilerOptions: { jsx: ts.JsxEmit.React, target: ts.ScriptTarget.ES2020 } }).outputText
  const ImageStub = ({ src, alt, style }: { src: string; alt: string; style: React.CSSProperties }) => React.createElement('img', { src, alt, style })
  const Avatar = new Function('React', 'Image', `${compiled}; return GuideAvatarSVG`)(React, ImageStub)
  const render = (slug: string, image: string | null) => renderToStaticMarkup(React.createElement(Avatar, { slug, image, name: 'Guide Test', gradient: '', initials: 'GT' }))
  for (const slug of ['naim-laamari', 'another-guide']) {
    const html = render(slug, 'https://photos.example.invalid/approved.jpg')
    assert.match(html, /src="https:\/\/photos.example.invalid\/approved.jpg"/)
    assert.match(html, /alt="Portrait de Guide Test"/)
    assert.doesNotMatch(html, /src="\/images\/landing\/guide-naim-laamari.jpg"/)
  }
  assert.match(render('naim-laamari', null), /src="\/images\/landing\/guide-naim-laamari.jpg"/)
  assert.match(render('another-guide', null), /<svg/)
  assert.doesNotMatch(render('another-guide', null), /<img/)
})

test('approved account photo is exposed read-only in the guide profile and session', () => {
  const profileRoute = readFileSync('src/app/api/guide/profil/route.ts', 'utf8')
  assert.match(profileRoute, /image: account.image \|\| null/)
  const patchFields = profileRoute.slice(profileRoute.indexOf('.pick({'), profileRoute.indexOf('}).refine'))
  assert.doesNotMatch(patchFields, /image|photo/)
  assert.match(readFileSync('src/lib/require-account.ts', 'utf8'), /image: account.image/)
  assert.match(readFileSync('src/app/api/guide/auth/session/route.ts', 'utf8'), /image: access.actor.image/)
  const profile = readFileSync('src/app/guide/(dashboard)/profil/page.tsx', 'utf8')
  const layout = readFileSync('src/app/guide/(dashboard)/layout.tsx', 'utf8')
  assert.match(profile, /src=\{profile.image\}/)
  assert.match(layout, /src=\{su.image\}/)
  assert.doesNotMatch(profile + layout, /type="file"|Publier cette photo/)
})

test('both search card variants use the photo supplied by the available-guides API', () => {
  const search = readFileSync('src/app/guides/page.tsx', 'utf8')
  assert.match(search, /image: item.image \|\| null/)
  const avatars = search.match(/<GuideAvatarSVG\b[^>]*\/>/g) || []
  assert.equal(avatars.length, 2)
  for (const avatar of avatars) assert.match(avatar, /image=\{g.image\}/)
})
