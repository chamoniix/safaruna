import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Créer un compte — SAFARUMA',
  description: 'Rejoignez SAFARUMA et réservez votre guide privé certifié pour la Omra.',
  alternates: { canonical: 'https://safaruma.com/inscription' },
};

export default function InscriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
