import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const city = searchParams.get('city') || ''
  const langue = searchParams.get('langue') || ''
  const gender = searchParams.get('gender') || ''

  try {
    const guides = await prisma.guideProfile.findMany({
      where: {
        status: 'ACTIVE',
        ...(langue ? { languages: { some: { languageCode: langue } } } : {}),
        ...(gender === 'HOMME' || gender === 'FEMME' ? { gender } : {}),
      },
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

      const servesMakkah = g.servesMakkah
      const servesMadinah = g.servesMadinah
      if (city === 'MAKKAH' && !servesMakkah) {
        return null
      }
      if (city === 'MADINAH' && !servesMadinah) {
        return null
      }

      return {
        slug: g.slug,
        name,
        city: g.city,
        gender: g.gender,
        serviceCities: [
          ...(servesMakkah ? ['MAKKAH'] : []),
          ...(servesMadinah ? ['MADINAH'] : []),
        ],
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
