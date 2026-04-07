import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion — SAFARUMA',
  description: 'Connectez-vous à votre espace pèlerin SAFARUMA.',
  alternates: { canonical: 'https://safaruma.com/connexion' },
};

export default function ConnexionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
