import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = { themeColor: '#FAF7F0' };

export const metadata: Metadata = {
  title: 'Vivre la Omra avec un guide privé certifié | SAFARUMA',
  description: "Découvrez ce que signifie vivre la Omra avec un guide privé SAFARUMA : accompagnement spirituel personnalisé, histoire des lieux saints, sérénité sur place.",
  keywords: ['vivre la omra', 'omra avec guide', 'expérience omra', 'guide privé omra', 'accompagnement omra'],
  alternates: { canonical: 'https://safaruma.com/vivre-la-omra' },
  openGraph: {
    title: 'Vivre la Omra avec un guide privé certifié | SAFARUMA',
    description: "Découvrez ce que signifie vivre la Omra avec un guide privé SAFARUMA : accompagnement spirituel personnalisé, histoire des lieux saints, sérénité sur place.",
    url: 'https://safaruma.com/vivre-la-omra',
    siteName: 'SAFARUMA',
    locale: 'fr_FR',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
