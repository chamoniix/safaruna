'use client';

import { usePathname } from 'next/navigation';
import WhatsAppButton from './WhatsAppButton';

export default function ConditionalWhatsApp() {
  const pathname = usePathname();
  if (
    pathname.startsWith('/espace') ||
    pathname.startsWith('/guide/tableau') ||
    pathname.startsWith('/guide/missions') ||
    pathname.startsWith('/guide/calendrier') ||
    pathname.startsWith('/guide/revenus') ||
    pathname.startsWith('/guide/avis') ||
    pathname.startsWith('/guide/profil') ||
    pathname.startsWith('/guide/forfaits') ||
    pathname.startsWith('/admin')
  ) return null;
  return <WhatsAppButton />;
}
