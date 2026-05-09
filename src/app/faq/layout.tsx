import type { Metadata, Viewport } from 'next';
import { CATEGORIES } from './data';

export const viewport: Viewport = { themeColor: '#FAF7F0' };

const totalQ = CATEGORIES.reduce((acc, c) => acc + c.questions.length, 0);

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: CATEGORIES.flatMap(cat =>
    cat.questions.map(item => ({
      '@type': 'Question',
      name: item.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.a,
      },
    }))
  ),
};

export const metadata: Metadata = {
  title: `FAQ Omra — ${totalQ} réponses sur les guides privés et le pèlerinage | SAFARUMA`,
  description: "Réponses détaillées : rituels Omra, choix d'un guide privé, prix, formalités, lieux saints. Toutes les questions des futurs pèlerins.",
  alternates: { canonical: 'https://safaruma.com/faq' },
  openGraph: {
    title: `FAQ Omra — ${totalQ} réponses sur les guides privés et le pèlerinage | SAFARUMA`,
    description: "Réponses détaillées : rituels Omra, choix d'un guide privé, prix, formalités, lieux saints. Toutes les questions des futurs pèlerins.",
    url: 'https://safaruma.com/faq',
    type: 'website',
    siteName: 'SAFARUMA',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      {children}
    </>
  );
}
