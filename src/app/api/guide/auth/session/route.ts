import { NextResponse } from 'next/server'
import { requireGuide } from '@/lib/require-account'

export async function GET() {
  const access = await requireGuide()
  if (!access.ok) return access.response

  return NextResponse.json(
    {
      user: {
        id: access.actor.id,
        email: access.actor.email,
        displayName: access.actor.displayName,
        firstName: access.actor.firstName,
        lastName: access.actor.lastName,
        guideProfileId: access.actor.guideProfileId,
        guideStatus: access.actor.guideStatus,
        guideSlug: access.actor.guideSlug,
        acceptingBookings: access.actor.acceptingBookings,
        servesMakkah: access.actor.servesMakkah,
        servesMadinah: access.actor.servesMadinah,
      },
    },
    { headers: { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' } },
  )
}
