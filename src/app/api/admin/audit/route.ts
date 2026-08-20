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

export async function POST() {
  return NextResponse.json(
    { error: 'Le journal d’audit est en écriture serveur uniquement.' },
    { status: 405, headers: { Allow: 'GET' } },
  )
}
