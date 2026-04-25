import { MetadataRoute } from 'next'
import prisma from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let guides: { slug: string | null }[] = []
  try {
    guides = await prisma.guideProfile.findMany({
      where: { status: 'ACTIVE' },
      select: { slug: true },
    })
  } catch { /* DB non disponible au build — sitemap sans guides dynamiques */ }

  const guideUrls: MetadataRoute.Sitemap = guides
    .filter(g => g.slug)
    .map(g => ({
      url: `https://safaruma.com/guides/${g.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    }))

  return [
    // ── Pages principales ──
    { url: 'https://safaruma.com',                           lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: 'https://safaruma.com/guides',                    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: 'https://safaruma.com/guide-omra',                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },

    // ── Fiches guides (dynamiques) ──
    ...guideUrls,

    // ── Pages contenu ──
    { url: 'https://safaruma.com/lieux-saints',              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/blog',                      lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    { url: 'https://safaruma.com/certification',             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://safaruma.com/services',                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },

    // ── Pages institutionnelles ──
    { url: 'https://safaruma.com/a-propos',                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/contact',                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/faq',                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },

    // ── Auth ──
    { url: 'https://safaruma.com/inscription',               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: 'https://safaruma.com/connexion',                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://safaruma.com/rejoindre',                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },

    // ── Légal ──
    { url: 'https://safaruma.com/mentions-legales',          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: 'https://safaruma.com/politique-confidentialite', lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: 'https://safaruma.com/cgu',                       lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: 'https://safaruma.com/conditions-clients',        lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
    { url: 'https://safaruma.com/charte-islamique',          lastModified: new Date(), changeFrequency: 'yearly',  priority: 0.2 },
  ]
}
