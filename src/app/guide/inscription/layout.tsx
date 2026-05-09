import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Inscription Guide — SAFARUMA',
  robots: { index: false, follow: false },
};

export default function GuideInscriptionLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
