import { NextRequest } from 'next/server'
import { Prisma } from '@prisma/client'
import { z } from 'zod'
import { getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import { GuideDossierDecisionError } from '@/lib/guide-dossier'
import { DocusealContractError } from '@/lib/docuseal'
import { apiRatelimit, checkRateLimitKey } from '@/lib/ratelimit'
import { downloadAdminGuideContract, GuideContractError, prepareAdminGuideContract,
  readAdminGuideContract, sendAdminGuideContract, syncAdminGuideContract } from '@/lib/guide-contracts'

export const runtime = 'nodejs'
const headers = { 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff', Vary: 'Cookie' }
type Context = { params: Promise<{ slug: string }> }
const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('PREPARE'), address: z.string().trim().max(1000).optional() }).strict(),
  z.object({ action: z.literal('SEND'), contractId: z.string().min(1).max(200) }).strict(),
  z.object({ action: z.literal('SYNC'), contractId: z.string().min(1).max(200) }).strict(),
])
function failed(error: unknown) {
  if (error instanceof GuideContractError || error instanceof DocusealContractError || error instanceof GuideDossierDecisionError) {
    return Response.json({ error: error.message }, { status: error.status, headers })
  }
  if (error instanceof Prisma.PrismaClientKnownRequestError && ['P2002', 'P2034'].includes(error.code)) {
    return Response.json({ error: 'Une autre action est en cours. Rechargez le contrat avant de continuer.' }, { status: 409, headers })
  }
  // SDK errors may contain document URLs or provider payloads. Do not log them.
  return Response.json({ error: 'Le suivi du contrat est temporairement indisponible. Actualisez avant de réessayer.' }, { status: 503, headers })
}

export async function GET(req: NextRequest, context: Context) {
  try {
    const actor = await getAdminActor(req)
    if (!actor) return Response.json({ error: 'Non autorisé.' }, { status: 401, headers })
    const { slug } = await context.params
    const kind = req.nextUrl.searchParams.get('document')
    if (!kind) return Response.json(await readAdminGuideContract(actor, slug), { headers })
    const parsed = z.enum(['preview', 'contract', 'audit']).safeParse(kind)
    const contractId = req.nextUrl.searchParams.get('contractId')
    if (!parsed.success || !contractId || contractId.length > 200) return Response.json({ error: 'Document invalide.' }, { status: 400, headers })
    const limited = await checkRateLimitKey(apiRatelimit, `guide-contract:${actor.id}`)
    if (limited) return limited
    const body = await downloadAdminGuideContract(actor, slug, contractId, parsed.data)
    return new Response(body, { headers: { ...headers, 'Content-Type': 'application/pdf',
      'Content-Disposition': `${kind === 'preview' ? 'inline' : 'attachment'}; filename="safaruma-contrat-${kind}.pdf"` } })
  } catch (error) { return failed(error) }
}

export async function POST(req: NextRequest, context: Context) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return Response.json({ error: 'Origine non autorisée.' }, { status: 403, headers })
  try {
    const actor = await getAdminActor(req)
    if (!actor) return Response.json({ error: 'Non autorisé.' }, { status: 401, headers })
    const limited = await checkRateLimitKey(apiRatelimit, `guide-contract:${actor.id}`)
    if (limited) return limited
    const input = schema.safeParse(await req.json().catch(() => null))
    if (!input.success) return Response.json({ error: 'Action de contrat invalide.' }, { status: 400, headers })
    const { slug } = await context.params
    const audit = getAdminAuditContext(req)
    const result = input.data.action === 'PREPARE'
      ? await prepareAdminGuideContract(actor, audit, slug, input.data.address)
      : input.data.action === 'SEND' ? await sendAdminGuideContract(actor, audit, slug, input.data.contractId)
        : await syncAdminGuideContract(actor, audit, slug, input.data.contractId)
    return Response.json(result, { headers })
  } catch (error) { return failed(error) }
}
