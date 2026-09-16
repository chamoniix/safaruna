import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { getAdminActor, getAdminAuditContext } from '@/lib/check-admin'
import { sendGuideProfileActivated } from '@/lib/email'
import { decideGuideStatus, GuideDossierDecisionError } from '@/lib/guide-dossier'
import prisma from '@/lib/prisma'

const schema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('activate'), revision: z.string().regex(/^[a-f0-9]{64}$/) }).strict(),
  z.object({ action: z.literal('suspend'), revision: z.string().regex(/^[a-f0-9]{64}$/).optional() }).strict(),
])
const headers = { 'Cache-Control': 'private, no-store' }

export async function POST(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const origin = req.headers.get('origin')
  if (origin && origin !== req.nextUrl.origin) return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403, headers })
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401, headers })
  const body = schema.safeParse(await req.json().catch(() => null))
  if (!body.success) return NextResponse.json({ error: 'Action ou version du dossier invalide. Rechargez la fiche.' }, { status: 400, headers })
  const { slug } = await params
  try {
    const result = await prisma.$transaction(tx => decideGuideStatus(tx, actor, getAdminAuditContext(req), { slug }, body.data.action, body.data.revision), { isolationLevel: Prisma.TransactionIsolationLevel.Serializable })
    const { profile, status } = result
    if (status === 'ACTIVE' && profile.status !== 'ACTIVE' && profile.guideAccount?.email && profile.slug) {
      await sendGuideProfileActivated({
        to: profile.guideAccount.email,
        name: profile.guideAccount.displayName || `${profile.guideAccount.firstName ?? ''} ${profile.guideAccount.lastName ?? ''}`.trim() || 'Guide',
        profileUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://safaruma.com'}/guides/${profile.slug}`,
      }).catch(error => console.error('[guide activation email]', error))
    }
    return NextResponse.json({ success: true, newStatus: status, message: status === 'ACTIVE' ? 'Profil activé.' : 'Profil suspendu.' }, { headers })
  } catch (error) {
    if (error instanceof GuideDossierDecisionError) return NextResponse.json({ error: error.message }, { status: error.status, headers })
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') return NextResponse.json({ error: 'Le dossier a changé. Rechargez la fiche avant de décider.' }, { status: 409, headers })
    console.error('[guide activation]', error)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500, headers })
  }
}
