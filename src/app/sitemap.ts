import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // ── Pages principales ──
    { url: 'https://safaruma.com',                           lastModified: new Date(), changeFrequency: 'daily',   priority: 1.0 },
    { url: 'https://safaruma.com/guides',                    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: 'https://safaruma.com/guide-omra',                lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.9 },

    // ── Fiches guides ──
    { url: 'https://safaruma.com/guides/naim-laamari',       lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/rachid-al-madani',   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/fatima-al-omari',    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/youssouf-konate',    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/abdullah-ben-yusuf', lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/samira-al-rashidi',  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },

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
