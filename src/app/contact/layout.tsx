import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact — SAFARUMA',
  description: "Une question sur la Omra, votre réservation ou nos guides ? L'équipe SAFARUMA vous répond rapidement, en plusieurs langues.",
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
