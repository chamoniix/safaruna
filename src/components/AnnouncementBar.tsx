'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AnnouncementBar() {
  const pathname = usePathname();

  if (pathname.includes('/connexion') || pathname.includes('/inscription') || pathname.includes('/guide/connexion')) {
    return null;
  }

  return (
    <div className="announcement-bar">
      <span className="ab-dot" />
      {/* Desktop version */}
      <span className="ab-desktop">
        🕌 Omra 2026 — Réservez votre guide dès maintenant et bénéficiez de{' '}
        <Link href="/guides">disponibilités prioritaires</Link>
        {' '}· Paiement sécurisé · Annulation gratuite 48h
      </span>
      {/* Mobile version */}
      <span className="ab-mobile">
        🕌 Omra 2026 —{' '}
        <Link href="/guides">Réservez maintenant</Link>
      </span>
    </div>
  );
}
