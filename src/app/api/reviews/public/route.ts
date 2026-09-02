import { NextRequest, NextResponse } from 'next/server'
import { getPublicReviews } from '@/lib/public-reviews'

export async function GET(req: NextRequest) {
  const pageValue = Number.parseInt(req.nextUrl.searchParams.get('page') || '1', 10)
  const limitValue = Number.parseInt(req.nextUrl.searchParams.get('limit') || '12', 10)
  const ratingValue = Number.parseInt(req.nextUrl.searchParams.get('rating') || '', 10)

  let result
  try {
    result = await getPublicReviews({
      page: Number.isFinite(pageValue) ? pageValue : 1,
      limit: Number.isFinite(limitValue) ? limitValue : 12,
      rating: Number.isFinite(ratingValue) ? ratingValue : undefined,
    })
  } catch (error) {
    console.error('[public-reviews] lecture indisponible', error)
    return NextResponse.json({ error: 'Les avis sont temporairement indisponibles.' }, { status: 503 })
  }

  return NextResponse.json(result, {
    headers: {
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}
