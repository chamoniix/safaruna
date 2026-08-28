import { NextResponse } from 'next/server'

/**
 * Ancien point d'entrée désactivé volontairement.
 *
 * Une réservation ne peut être créée que par le flux serveur de paiement :
 * /api/payments/create-session -> webhook signé du processeur actif.
 */
export async function POST() {
  return NextResponse.json(
    { error: 'Ce point d’entrée de réservation a été désactivé.' },
    {
      status: 410,
      headers: {
        'Cache-Control': 'no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    },
  )
}
