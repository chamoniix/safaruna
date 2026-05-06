import type { Metadata, Viewport } from 'next';

export const viewport: Viewport = { themeColor: '#FAF7F0' };
export const metadata: Metadata = {
  title: 'FAQ — Questions fréquentes sur la Omra & les guides privés | SAFARUMA',
  description: 'Toutes les réponses à vos questions sur la Omra, les guides privés certifiés, les réservations, les prix et le déroulement du pèlerinage avec SAFARUMA.',
  alternates: { canonical: 'https://safaruma.com/faq' },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
