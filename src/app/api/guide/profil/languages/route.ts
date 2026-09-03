import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { GUIDE_LANGUAGES } from '@/lib/languages'
import { requireGuide } from '@/lib/require-account'
import prisma from '@/lib/prisma'
import { getGuideRequestContext, hasTrustedGuideAuthOrigin } from '@/lib/guide-auth'
import { guideProfileChangesSchema, publicPendingRequest, submitGuideProfileChanges } from '@/lib/guide-profile-changes'

const validCodes = GUIDE_LANGUAGES.map(language => language.code) as [string, ...string[]]
const languageSchema = z.enum(validCodes)

async function requestedLanguages(guideProfileId: string) {
  const [languages, pending] = await Promise.all([
    prisma.guideLanguage.findMany({
      where: { guideProfileId },
      orderBy: { languageCode: 'asc' },
      select: { languageCode: true },
    }),
    prisma.guideProfileChangeRequest.findUnique({
      where: { activeKey: guideProfileId },
      select: { changes: true },
    }),
  ])
  const parsed = pending ? guideProfileChangesSchema.safeParse(pending.changes) : null
  return parsed?.success && parsed.data.languages
    ? parsed.data.languages
    : languages.map(language => language.languageCode)
}

export async function POST(req: NextRequest) {
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  }
  const access = await requireGuide()
  if (!access.ok) return access.response

  const parsed = z.object({ languageCode: languageSchema }).strict().safeParse(await req.json())
  if (!parsed.success) return NextResponse.json({ error: 'Code langue invalide' }, { status: 400 })

  const current = await requestedLanguages(access.actor.guideProfileId)
  if (current.includes(parsed.data.languageCode)) {
    return NextResponse.json({ languages: current, pendingApproval: false }, { status: 200 })
  }
  const languages = [...new Set([...current, parsed.data.languageCode])].sort()
  const pendingRequest = await submitGuideProfileChanges({
    actor: access.actor,
    changes: { languages },
    context: getGuideRequestContext(req),
  })

  return NextResponse.json({
    languages,
    pendingApproval: true,
    pendingChangeRequest: publicPendingRequest(pendingRequest),
  }, { status: 202 })
}

export async function DELETE(req: NextRequest) {
  if (!hasTrustedGuideAuthOrigin(req)) {
    return NextResponse.json({ error: 'Origine non autorisée' }, { status: 403 })
  }
  const access = await requireGuide()
  if (!access.ok) return access.response

  const parsed = languageSchema.safeParse(req.nextUrl.searchParams.get('languageCode'))
  if (!parsed.success) return NextResponse.json({ error: 'Code langue invalide' }, { status: 400 })

  const current = await requestedLanguages(access.actor.guideProfileId)
  if (!current.includes(parsed.data)) {
    return NextResponse.json({ languages: current, pendingApproval: false }, { status: 200 })
  }
  const languages = current.filter(languageCode => languageCode !== parsed.data)
  const pendingRequest = await submitGuideProfileChanges({
    actor: access.actor,
    changes: { languages },
    context: getGuideRequestContext(req),
  })

  return NextResponse.json({
    languages,
    pendingApproval: true,
    pendingChangeRequest: publicPendingRequest(pendingRequest),
  }, { status: 202 })
}
