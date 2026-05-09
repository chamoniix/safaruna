import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos guides privés certifiés pour la Omra | SAFARUMA',
  description: 'Trouvez votre guide privé Omra certifié SAFARUMA. Accompagnement personnalisé en français, arabe et autres langues. Spécialités histoire islamique, PMR, familles.',
  alternates: { canonical: 'https://safaruma.com/guides' },
  openGraph: {
    title: 'Guides privés Omra certifiés | SAFARUMA',
    description: 'Trouvez votre guide privé Omra certifié SAFARUMA. Accompagnement personnalisé en français, arabe et autres langues.',
    url: 'https://safaruma.com/guides',
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
