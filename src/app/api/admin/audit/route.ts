import { NextRequest, NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/check-admin'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const logs = await prisma.auditLog.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
  })

  return NextResponse.json({ logs })
}

export async function POST(req: NextRequest) {
  if (!await checkAdmin(req))
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  const { actor, actorRole, action, target, detail } = await req.json()
  if (!actor || !actorRole || !action) {
    return NextResponse.json({ error: 'Champs manquants' }, { status: 400 })
  }

  const log = await prisma.auditLog.create({
    data: { actor, actorRole, action, target, detail },
  })

  return NextResponse.json({ log })
}
