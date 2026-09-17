import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import { dispatchGuideTransferEmail } from '@/lib/email'
import { GuideTransferError, readReservationGuideTransfers, prepareGuideTransfer, confirmGuideTransfer, correctGuideTransfer } from '@/lib/guide-transfers'

const privateHeaders = { 'Cache-Control': 'private, no-store' }
const commandSchema = z.object({
  action: z.enum(['PREPARE', 'CONFIRM', 'CORRECT']),
  input: z.unknown(),
}).strict()

function failure(error: unknown) {
  if (error instanceof GuideTransferError) return NextResponse.json({ error: error.message }, { status: error.status, headers: privateHeaders })
  // Never return database errors or bank data to the browser.
  console.error('[guide-transfers] Operation failed')
  return NextResponse.json({ error: 'Impossible de traiter le virement. Rechargez pour vérifier son état avant de réessayer.' }, { status: 500, headers: privateHeaders })
}

export async function GET(req: NextRequest) {
  try {
    const actor = await getAdminActor(req)
    if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: privateHeaders })
    const result = await readReservationGuideTransfers(actor, req.nextUrl.searchParams.get('reservationId') ?? '')
    return NextResponse.json(result, { headers: privateHeaders })
  } catch (error) { return failure(error) }
}

export async function POST(req: NextRequest) {
  // Browser-only administrative writes: absent/null origins also fail closed.
  if (req.headers.get('origin') !== req.nextUrl.origin || req.headers.get('sec-fetch-site') === 'cross-site') {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403, headers: privateHeaders })
  }
  try {
    const actor = await getAdminActor(req)
    if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers: privateHeaders })
    if (req.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') {
      return NextResponse.json({ error: 'Format JSON requis' }, { status: 415, headers: privateHeaders })
    }
    const body = await req.text()
    if (body.length > 8192) return NextResponse.json({ error: 'Requête trop volumineuse' }, { status: 413, headers: privateHeaders })
    let value: unknown
    try { value = JSON.parse(body) } catch { value = null }
    const parsed = commandSchema.safeParse(value)
    if (!parsed.success) return NextResponse.json({ error: 'Paramètres invalides' }, { status: 400, headers: privateHeaders })
    const { action, input } = parsed.data
    if (action !== 'PREPARE' && actor.role !== 'SUPERADMIN') {
      return NextResponse.json({ error: 'Action réservée au Superadmin' }, { status: 403, headers: privateHeaders })
    }
    const context = getAdminAuditContext(req)
    const record = action === 'PREPARE' ? await prepareGuideTransfer(actor, context, input)
      : action === 'CONFIRM' ? await confirmGuideTransfer(actor, context, input)
        : await correctGuideTransfer(actor, context, input)
    if (action === 'CONFIRM') await dispatchGuideTransferEmail(record.id)
    return NextResponse.json({ record }, { headers: privateHeaders })
  } catch (error) { return failure(error) }
}
