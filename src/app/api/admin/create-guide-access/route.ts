import { NextResponse } from 'next/server'

// Ancienne route dangereuse : elle pouvait convertir un compte pèlerin existant en guide.
export async function POST() {
  return NextResponse.json({ error: 'Ce point d’entrée a été désactivé.' }, { status: 410 })
}
