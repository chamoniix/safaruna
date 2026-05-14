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

  const LIEUX_SLUGS = [
    'masjid-al-haram','jabal-al-nour','jabal-thawr','mina','arafat','safa-marwa',
    'muzdalifah','masjid-aisha','hira','zamzam','hunayn','masjid-an-nabawi',
    'masjid-quba','jabal-uhud','al-baqi','masjid-al-qiblatayn','masjid-al-miqat',
    'masjid-al-jumua','wadi-al-aqiq','masjid-fateh','marche-dattes','badr',
    'khandaq','bir-aris','masjid-ghamamah','masjid-al-jinn',
  ];

  const BLOG_SLUGS = [
    'comment-preparer-omra-10-etapes','les-7-tours-du-tawaf',
    'jabal-uhud-bataille-islam','guide-visa-omra','difference-omra-hajj',
  ];

  return [
    // ── Pages principales ──
    { url: 'https://safaruma.com',                              lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: 'https://safaruma.com/guides',                       lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: 'https://safaruma.com/guide-omra',                   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },

    // ── Fiches guides (dynamiques depuis DB) ──
    ...guideUrls,

    // ── Pages à fort trafic SEO ──
    { url: 'https://safaruma.com/accompagnements',              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },
    { url: 'https://safaruma.com/omra-mobilite-reduite',        lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://safaruma.com/offrir-omra-parents',          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://safaruma.com/omra-avec-guide-prive',          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://safaruma.com/comment-se-passe-la-omra',      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.8 },
    { url: 'https://safaruma.com/nos-guides-certifies',          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // ── Lieux saints (pages individuelles) ──
    { url: 'https://safaruma.com/lieux-saints',                 lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    ...LIEUX_SLUGS.map(slug => ({
      url: `https://safaruma.com/lieux-saints/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),

    // ── Blog ──
    { url: 'https://safaruma.com/blog',                         lastModified: new Date(), changeFrequency: 'daily',   priority: 0.7 },
    ...BLOG_SLUGS.map(slug => ({
      url: `https://safaruma.com/blog/${slug}`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),

    // ── Services ──
    { url: 'https://safaruma.com/services',                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/services/visa',                lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: 'https://safaruma.com/services/hotels',              lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/services/transfert',           lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },

    // ── Pages institutionnelles ──
    { url: 'https://safaruma.com/a-propos',                     lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/contact',                      lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/faq',                          lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/charte-islamique',             lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },

    // ── Auth ──
    { url: 'https://safaruma.com/rejoindre',                    lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ]
}
