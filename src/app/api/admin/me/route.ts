import { NextRequest, NextResponse } from 'next/server'
import { getAdminActor } from '@/lib/check-admin'

export async function GET(req: NextRequest) {
  const actor = await getAdminActor(req)
  if (!actor) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

  return NextResponse.json({
    admin: {
      email: actor.email,
      role: actor.role,
      individualAccount: Boolean(actor.id),
    },
  })
}
