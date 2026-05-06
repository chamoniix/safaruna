import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guides privés Omra certifiés — La Mecque & Médine | SAFARUMA',
  description: 'Trouvez votre guide privé certifié pour la Omra à La Mecque et Médine. 15+ guides vérifiés, 17 langues : français, arabe, wolof, darija, turc et plus. Accompagnement sur mesure.',
  alternates: { canonical: 'https://safaruma.com/guides' },
  openGraph: {
    title: 'Guides privés Omra certifiés | SAFARUMA',
    description: 'Trouvez votre guide privé pour la Omra. 15+ guides certifiés, 17 langues.',
    url: 'https://safaruma.com/guides',
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
