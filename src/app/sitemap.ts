import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://safaruma.com';

  return [
    { url: base, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${base}/guides`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${base}/guides/rachid-al-madani`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/guides/fatima-al-omari`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/guides/youssouf-konate`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/guides/abdullah-ben-yusuf`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/guides/samira-al-rashidi`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    { url: `${base}/lieux-saints`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/blog`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.7 },
    { url: `${base}/a-propos`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/contact`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/faq`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/services`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${base}/guide/inscription`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
    { url: `${base}/connexion`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
    { url: `${base}/inscription`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.4 },
  ];
}
