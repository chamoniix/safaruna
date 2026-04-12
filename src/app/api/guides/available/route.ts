import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city') || ''
  const langue = searchParams.get('langue') || ''

  try {
    const guides = await prisma.guideProfile.findMany({
      where: { status: 'ACTIVE' },
      include: {
        user: {
          select: {
            name: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
        languages: true,
      },
    })

    const result = guides.map(g => {
      const name =
        g.user.name ||
        `${g.user.firstName ?? ''} ${g.user.lastName ?? ''}`.trim()

      // Filter by city if provided
      if (city && city !== '' && g.city && !g.city.toUpperCase().includes(city.toUpperCase()) && city !== 'BOTH') {
        return null
      }

      return {
        slug: g.slug,
        name,
        city: g.city,
        bio: g.bio,
        image: g.user.image || null,
        languages: g.languages.map(l => l.languageCode),
        rating: 5,
      }
    }).filter(Boolean)

    return NextResponse.json({ guides: result })
  } catch (err) {
    console.error('[guides/available GET]', err)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
