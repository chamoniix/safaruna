import type { NextRequest } from 'next/server'
import { handleCreatePaymentSession } from '@/lib/payments/create-session'

export async function POST(req: NextRequest) {
  return handleCreatePaymentSession(req)
}
