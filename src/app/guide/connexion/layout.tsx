import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion Guide — SAFARUMA',
  robots: { index: false, follow: false },
};

export default function GuideConnexionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
