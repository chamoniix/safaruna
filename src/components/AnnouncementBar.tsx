import Link from 'next/link';

export default function AnnouncementBar() {
  return (
    <div className="announcement-bar">
      <span className="ab-dot" />
      {/* Desktop version */}
      <span className="ab-desktop">
        🕌 Ramadan 2025 — Réservez votre guide dès maintenant et bénéficiez de{' '}
        <Link href="/guides">disponibilités prioritaires</Link>
        {' '}· Paiement sécurisé · Annulation gratuite 48h
      </span>
      {/* Mobile version */}
      <span className="ab-mobile">
        🕌 Ramadan 2025 —{' '}
        <Link href="/guides">Réservez maintenant</Link>
      </span>
    </div>
  );
}
