import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Lieux saints de La Mecque & Médine — Guide complet | SAFARUMA',
  description: 'Découvrez les 26 lieux saints de Makkah et Madinah : Masjid Al-Haram, Kaaba, Jabal Nour, Rawdah, Masjid Quba, Badr et plus. Histoire, du\'as et conseils de visite avec un guide privé.',
  alternates: { canonical: 'https://safaruma.com/lieux-saints' },
  openGraph: {
    title: 'Lieux saints Omra — La Mecque & Médine | SAFARUMA',
    description: 'Histoire et spiritualité des 26 lieux saints de la Omra. Guide complet avec du\'as et conseils.',
    url: 'https://safaruma.com/lieux-saints',
  },
};

export default function LieuxSaintsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
