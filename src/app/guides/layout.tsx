import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Nos guides certifiés — SAFARUMA',
  description: 'Découvrez nos guides privés certifiés pour la Omra. Français, Arabe, Wolof, Darija — trouvez le guide qui parle votre langue et connaît les lieux saints.',
  alternates: { canonical: 'https://safaruma.com/guides' },
  openGraph: {
    title: 'Nos guides certifiés — SAFARUMA',
    description: 'Guides privés certifiés pour la Omra. 35 langues couvertes.',
    url: 'https://safaruma.com/guides',
  },
};

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
