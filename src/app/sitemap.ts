import { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: 'https://safaruma.com',                           lastModified: new Date(), changeFrequency: 'daily',   priority: 1   },
    { url: 'https://safaruma.com/guides',                    lastModified: new Date(), changeFrequency: 'daily',   priority: 0.9 },
    { url: 'https://safaruma.com/guides/rachid-al-madani',   lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/fatima-al-omari',    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/youssouf-konate',    lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/abdullah-ben-yusuf', lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/guides/samira-al-rashidi',  lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/lieux-saints',              lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.8 },
    { url: 'https://safaruma.com/blog',                      lastModified: new Date(), changeFrequency: 'weekly',  priority: 0.7 },
    { url: 'https://safaruma.com/a-propos',                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/contact',                   lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/faq',                       lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/services',                  lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: 'https://safaruma.com/connexion',                 lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    { url: 'https://safaruma.com/inscription',               lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ]
}
